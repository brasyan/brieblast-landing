"""
Provisioning pipeline and background worker.

Full pipeline for one site
--------------------------
1.  Mark site ``provisioning``.
2.  Load + validate the uploaded zip.
3.  Extract zip to a temporary directory, unwrapping a single top-level folder
    if present (common zip layout).
4.  Create an unprivileged LXC container on Proxmox VE.
5.  Start the container.
6.  Bootstrap: install nginx + PHP-FPM inside the container.
7.  Deploy site files (tar → pct push → extract in container).
8.  Configure nginx inside the container for PHP-FPM.
9.  Drop an nginx reverse-proxy vhost on the proxy host.
10. Mark site ``live`` with its public URL.

Any unrecoverable error marks the site ``failed`` with a message and attempts
to destroy the container if it was already created.

Background worker
-----------------
``run_provisioning_worker()`` is an asyncio coroutine that polls the database
for ``uploaded`` sites and provisions them up to ``WORKER_CONCURRENCY`` at a
time.  It is started (and cancelled) by the FastAPI lifespan.
"""
from __future__ import annotations

import asyncio
import logging
import os
import shlex
import tarfile
import tempfile
from typing import Optional

from briehost_api import db, ssh, storage
from briehost_api.config import settings
from briehost_api.proxmox import proxmox, resources_for_plan, vmid_to_ip
from briehost_api.zip_validator import ZipValidationError, extract_zip_safe, validate_zip

log = logging.getLogger(__name__)

# Semaphore shared across all worker tasks
_semaphore: Optional[asyncio.Semaphore] = None


def _get_semaphore() -> asyncio.Semaphore:
    global _semaphore
    if _semaphore is None:
        _semaphore = asyncio.Semaphore(settings.WORKER_CONCURRENCY)
    return _semaphore


# --------------------------------------------------------------------------- #
# Nginx config templates
# --------------------------------------------------------------------------- #

_CONTAINER_NGINX_CONF = """\
server {{
    listen 80 default_server;
    root /var/www/html;
    index index.php index.html index.htm;

    location / {{
        try_files $uri $uri/ /index.php?$query_string;
    }}

    location ~ \\.php$ {{
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }}

    # Deny access to dot-files
    location ~ /\\. {{
        deny all;
    }}
}}
"""


def _proxy_nginx_conf(subdomain: str, container_ip: str) -> str:
    use_tls = bool(
        settings.WILDCARD_CERT_FULLCHAIN and settings.WILDCARD_CERT_KEY
    )
    if use_tls:
        return f"""\
server {{
    listen 80;
    server_name {subdomain};
    return 301 https://$host$request_uri;
}}

server {{
    listen 443 ssl http2;
    server_name {subdomain};

    ssl_certificate     {settings.WILDCARD_CERT_FULLCHAIN};
    ssl_certificate_key {settings.WILDCARD_CERT_KEY};
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    location / {{
        proxy_pass         http://{container_ip};
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }}
}}
"""
    # HTTP-only fallback (no cert configured)
    return f"""\
server {{
    listen 80;
    server_name {subdomain};

    location / {{
        proxy_pass         http://{container_ip};
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }}
}}
"""


# --------------------------------------------------------------------------- #
# Tarball helper (sync, called via to_thread)
# --------------------------------------------------------------------------- #

def _create_tarball(source_dir: str, dest_path: str) -> None:
    """Create a gzip-compressed tar of *source_dir* at *dest_path*."""
    with tarfile.open(dest_path, "w:gz") as tf:
        tf.add(source_dir, arcname=".")


# --------------------------------------------------------------------------- #
# Core provisioning pipeline
# --------------------------------------------------------------------------- #

async def provision_site(site_id: str) -> None:  # noqa: C901 – intentionally long
    """
    Orchestrate full LXC provisioning for *site_id*.

    All errors are caught, logged, and written to the DB.  The container is
    destroyed on failure if it has already been created.
    """
    log.info("Starting provisioning for site %s", site_id)
    vmid: Optional[int] = None

    try:
        # ------------------------------------------------------------------ #
        # 1. Fetch site + user plan
        # ------------------------------------------------------------------ #
        site = await db.get_site(site_id)
        if not site:
            log.error("Site %s not found in DB – skipping", site_id)
            return

        plan = await db.get_user_plan(site["user_id"])
        resources = resources_for_plan(plan)
        log.info("Site %s plan=%s resources=%s", site_id, plan, resources)

        # ------------------------------------------------------------------ #
        # 2. Mark provisioning
        # ------------------------------------------------------------------ #
        await db.update_site_status(site_id, "provisioning")

        # ------------------------------------------------------------------ #
        # 3. Load & validate zip
        # ------------------------------------------------------------------ #
        zip_file_path = storage.zip_path(site_id)
        if not os.path.exists(zip_file_path):
            raise RuntimeError(f"Uploaded zip not found at {zip_file_path}")

        await asyncio.to_thread(validate_zip, zip_file_path)

        # ------------------------------------------------------------------ #
        # 4. Extract to temp dir
        # ------------------------------------------------------------------ #
        with tempfile.TemporaryDirectory(prefix="briehost-") as tmpdir:
            web_root = os.path.join(tmpdir, "webroot")
            os.makedirs(web_root)
            await asyncio.to_thread(extract_zip_safe, zip_file_path, web_root)

            # Unwrap single top-level directory (common zip packaging)
            entries = os.listdir(web_root)
            if len(entries) == 1:
                candidate = os.path.join(web_root, entries[0])
                if os.path.isdir(candidate):
                    web_root = candidate
                    log.debug("Unwrapped single top-level dir: %s", entries[0])

            # ---------------------------------------------------------------- #
            # 5. Create LXC container
            # ---------------------------------------------------------------- #
            vmid = await proxmox.next_vmid()
            hostname = f"site-{site_id[:8]}"
            log.info("Creating LXC vmid=%s hostname=%s", vmid, hostname)

            create_upid = await proxmox.create_lxc(vmid, hostname, resources)
            exit_status = await proxmox.wait_for_task(create_upid, timeout=180)
            if exit_status != "OK":
                raise RuntimeError(f"LXC creation task failed: {exit_status!r}")

            # Persist VMID immediately so cleanup can remove the container on error
            await db.update_site_vmid(site_id, vmid)

            # ---------------------------------------------------------------- #
            # 6. Start container
            # ---------------------------------------------------------------- #
            log.info("Starting LXC vmid=%s", vmid)
            start_upid = await proxmox.start_lxc(vmid)
            exit_status = await proxmox.wait_for_task(start_upid, timeout=120)
            if exit_status != "OK":
                raise RuntimeError(f"LXC start task failed: {exit_status!r}")

            # Give the container a moment to initialise networking
            await asyncio.sleep(8)

            # ---------------------------------------------------------------- #
            # 7. Bootstrap: install nginx + php-fpm
            # ---------------------------------------------------------------- #
            log.info("Bootstrapping vmid=%s (installing nginx + php-fpm)", vmid)
            bootstrap_script = (
                "DEBIAN_FRONTEND=noninteractive apt-get update -qq && "
                "DEBIAN_FRONTEND=noninteractive apt-get install -y -qq "
                "nginx php8.2-fpm php8.2-cli php8.2-mysql php8.2-curl "
                "php8.2-gd php8.2-mbstring php8.2-xml php8.2-zip && "
                "systemctl enable nginx php8.2-fpm && "
                "systemctl start nginx php8.2-fpm"
            )
            await ssh.run_on_proxmox_checked(
                f"pct exec {vmid} -- bash -c {shlex.quote(bootstrap_script)}",
                label="bootstrap",
            )

            # ---------------------------------------------------------------- #
            # 8. Deploy site files
            # ---------------------------------------------------------------- #
            log.info("Deploying files to vmid=%s", vmid)
            tar_path = os.path.join(tmpdir, "webroot.tar.gz")
            await asyncio.to_thread(_create_tarball, web_root, tar_path)

            # Push tar to Proxmox host first, then into the container
            remote_tar_on_host = f"/tmp/briehost-{site_id[:8]}.tar.gz"
            await ssh.push_file_to_proxmox(tar_path, remote_tar_on_host)

            await ssh.run_on_proxmox_checked(
                f"pct push {vmid} {remote_tar_on_host} /tmp/site.tar.gz",
                label="pct push",
            )
            # Clean up the temp tar on the Proxmox host
            await ssh.run_on_proxmox(f"rm -f {remote_tar_on_host}")

            deploy_script = (
                "rm -rf /var/www/html/* && "
                "tar -xzf /tmp/site.tar.gz -C /var/www/html && "
                "rm /tmp/site.tar.gz && "
                "chown -R www-data:www-data /var/www/html && "
                r"find /var/www/html -type f -exec chmod 644 {} \; && "
                r"find /var/www/html -type d -exec chmod 755 {} \;"
            )
            await ssh.run_on_proxmox_checked(
                f"pct exec {vmid} -- bash -c {shlex.quote(deploy_script)}",
                label="deploy files",
            )

            # ---------------------------------------------------------------- #
            # 9. Configure nginx inside the container
            # ---------------------------------------------------------------- #
            log.info("Configuring nginx inside vmid=%s", vmid)
            nginx_conf_local = os.path.join(tmpdir, "nginx_default.conf")
            with open(nginx_conf_local, "w") as fh:
                fh.write(_CONTAINER_NGINX_CONF)

            remote_conf_on_host = f"/tmp/briehost-nginx-{site_id[:8]}.conf"
            await ssh.push_file_to_proxmox(nginx_conf_local, remote_conf_on_host)

            await ssh.run_on_proxmox_checked(
                f"pct push {vmid} {remote_conf_on_host} "
                f"/etc/nginx/sites-enabled/default",
                label="push nginx conf",
            )
            await ssh.run_on_proxmox(f"rm -f {remote_conf_on_host}")

            await ssh.run_on_proxmox_checked(
                f"pct exec {vmid} -- bash -c "
                f'"nginx -t && systemctl reload nginx"',
                label="reload nginx in container",
            )

            # ---------------------------------------------------------------- #
            # 10. Configure reverse proxy on the proxy host
            # ---------------------------------------------------------------- #
            short_id = site_id.replace("-", "")[:12]
            subdomain = f"{short_id}.{settings.BASE_DOMAIN}"
            container_ip = vmid_to_ip(vmid)
            log.info(
                "Configuring reverse proxy for %s → %s", subdomain, container_ip
            )

            proxy_conf_local = os.path.join(tmpdir, "proxy.conf")
            with open(proxy_conf_local, "w") as fh:
                fh.write(_proxy_nginx_conf(subdomain, container_ip))

            remote_proxy_conf = (
                f"{settings.NGINX_SITES_DIR}/{short_id}.conf"
            )
            await ssh.push_file_to_proxy(proxy_conf_local, remote_proxy_conf)
            await ssh.run_on_proxy_checked(
                "nginx -t && systemctl reload nginx",
                label="reload proxy nginx",
            )

            # ---------------------------------------------------------------- #
            # 11. Mark site live
            # ---------------------------------------------------------------- #
            protocol = (
                "https"
                if settings.WILDCARD_CERT_FULLCHAIN
                else "http"
            )
            site_url = f"{protocol}://{subdomain}"
            await db.update_site_live(site_id, site_url)
            log.info("Site %s is LIVE at %s", site_id, site_url)

    except ZipValidationError as exc:
        log.warning("Zip validation failed for site %s: %s", site_id, exc)
        await db.update_site_failed(site_id, str(exc))
    except Exception as exc:
        log.exception("Provisioning failed for site %s", site_id)
        await db.update_site_failed(site_id, str(exc))
        # Attempt to clean up the container if it was created
        if vmid is not None:
            log.info("Cleaning up container vmid=%s after failure", vmid)
            await proxmox.safe_destroy_lxc(vmid)


# --------------------------------------------------------------------------- #
# Background provisioning worker
# --------------------------------------------------------------------------- #

async def run_provisioning_worker() -> None:
    """
    Poll for ``uploaded`` sites and provision them concurrently.

    Designed to run as a long-lived asyncio task for the lifetime of the
    FastAPI process.  Cancellation is handled gracefully.
    """
    log.info(
        "Provisioning worker started (concurrency=%s, poll=%ss)",
        settings.WORKER_CONCURRENCY,
        settings.WORKER_POLL_INTERVAL_SECONDS,
    )
    sem = _get_semaphore()
    in_flight: set[str] = set()  # site IDs currently being provisioned

    while True:
        try:
            pending = await db.get_pending_sites()
            for site in pending:
                site_id = site["id"]
                if site_id in in_flight:
                    continue  # already running
                in_flight.add(site_id)

                async def _run_one(sid: str = site_id) -> None:
                    async with sem:
                        try:
                            await provision_site(sid)
                        finally:
                            in_flight.discard(sid)

                asyncio.create_task(_run_one())

        except asyncio.CancelledError:
            log.info("Provisioning worker cancelled – shutting down")
            return
        except Exception:
            log.exception("Error in provisioning worker poll loop")

        await asyncio.sleep(settings.WORKER_POLL_INTERVAL_SECONDS)
