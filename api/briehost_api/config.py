"""
Centralised settings loaded from environment variables (or a .env file via
python-dotenv).  Every attribute has a type-annotated default; required fields
have no default and will raise a RuntimeError during import if missing.
"""
from __future__ import annotations

import os
from typing import Optional

from dotenv import load_dotenv

load_dotenv()  # reads .env in the current working directory, if present


def _require(key: str) -> str:
    val = os.environ.get(key)
    if not val:
        raise RuntimeError(
            f"Required environment variable {key!r} is not set. "
            "Copy api/.env.example to api/.env and fill in the values."
        )
    return val


def _opt(key: str, default: str = "") -> str:
    return os.environ.get(key, default)


def _int(key: str, default: int) -> int:
    return int(os.environ.get(key, str(default)))


def _bool(key: str, default: bool = False) -> bool:
    return os.environ.get(key, str(default)).lower() in ("1", "true", "yes")


class _Settings:
    # ------------------------------------------------------------------ #
    # Supabase
    # ------------------------------------------------------------------ #
    SUPABASE_URL: str = _require("SUPABASE_URL")
    SUPABASE_SERVICE_ROLE_KEY: str = _require("SUPABASE_SERVICE_ROLE_KEY")
    # Found in: Supabase project → Settings → API → JWT Secret
    SUPABASE_JWT_SECRET: str = _require("SUPABASE_JWT_SECRET")

    # ------------------------------------------------------------------ #
    # Proxmox REST API
    # ------------------------------------------------------------------ #
    PROXMOX_HOST: str = _require("PROXMOX_HOST")
    PROXMOX_PORT: int = _int("PROXMOX_PORT", 8006)
    # API token in the form  user@realm!tokenid
    PROXMOX_TOKEN_ID: str = _require("PROXMOX_TOKEN_ID")
    PROXMOX_TOKEN_SECRET: str = _require("PROXMOX_TOKEN_SECRET")
    PROXMOX_NODE: str = _opt("PROXMOX_NODE", "pve")
    # Storage pool that holds LXC root filesystems (e.g. local-lvm, local-zfs)
    PROXMOX_STORAGE: str = _opt("PROXMOX_STORAGE", "local-lvm")
    # Full template path as shown in the Proxmox UI storage browser
    PROXMOX_TEMPLATE: str = _opt(
        "PROXMOX_TEMPLATE",
        "local:vztmpl/debian-12-standard_12.2-1_amd64.tar.zst",
    )
    # Bridge that containers attach to (must exist on the Proxmox host)
    PROXMOX_BRIDGE: str = _opt("PROXMOX_BRIDGE", "vmbr1")
    # VMID range reserved for site containers
    PROXMOX_VMID_MIN: int = _int("PROXMOX_VMID_MIN", 200)
    PROXMOX_VMID_MAX: int = _int("PROXMOX_VMID_MAX", 9999)
    # Verify Proxmox TLS certificate (disable for self-signed certs in dev)
    PROXMOX_VERIFY_TLS: bool = _bool("PROXMOX_VERIFY_TLS", False)

    # ------------------------------------------------------------------ #
    # SSH access to the Proxmox host (needed for pct exec / pct push)
    # ------------------------------------------------------------------ #
    # Falls back to PROXMOX_HOST if not set
    PROXMOX_SSH_HOST: str = _opt("PROXMOX_SSH_HOST", "")
    PROXMOX_SSH_PORT: int = _int("PROXMOX_SSH_PORT", 22)
    PROXMOX_SSH_USER: str = _opt("PROXMOX_SSH_USER", "root")
    # Path to the private key file on the API server
    PROXMOX_SSH_KEY_PATH: str = _opt("PROXMOX_SSH_KEY_PATH", "/run/secrets/proxmox_ssh_key")
    # Optional: path to a known_hosts file.  Leave empty to accept any host
    # key (insecure – only suitable for isolated lab environments).
    PROXMOX_SSH_KNOWN_HOSTS: Optional[str] = _opt("PROXMOX_SSH_KNOWN_HOSTS") or None

    # ------------------------------------------------------------------ #
    # Container networking
    # ------------------------------------------------------------------ #
    # First three octets of the private subnet used for containers, e.g. "10.100.0"
    CONTAINER_NETWORK_BASE: str = _opt("CONTAINER_NETWORK_BASE", "10.100.0")
    CONTAINER_GATEWAY: str = _opt("CONTAINER_GATEWAY", "10.100.0.1")
    # Prefix length for the container subnet (e.g. 24 for /24)
    CONTAINER_SUBNET_PREFIX: int = _int("CONTAINER_SUBNET_PREFIX", 24)

    # ------------------------------------------------------------------ #
    # Public domain & reverse proxy
    # ------------------------------------------------------------------ #
    # Site subdomains will be  {short_id}.{BASE_DOMAIN}
    BASE_DOMAIN: str = _opt("BASE_DOMAIN", "sites.example.com")
    # SSH to the nginx proxy host (defaults to PROXMOX_SSH_HOST / PROXMOX_HOST
    # when the same machine acts as both Proxmox node and proxy)
    NGINX_PROXY_SSH_HOST: str = _opt("NGINX_PROXY_SSH_HOST", "")
    NGINX_PROXY_SSH_USER: str = _opt("NGINX_PROXY_SSH_USER", "root")
    NGINX_SITES_DIR: str = _opt("NGINX_SITES_DIR", "/etc/nginx/sites-enabled")
    # Wildcard TLS certificate paths on the proxy host (optional)
    WILDCARD_CERT_FULLCHAIN: str = _opt("WILDCARD_CERT_FULLCHAIN", "")
    WILDCARD_CERT_KEY: str = _opt("WILDCARD_CERT_KEY", "")

    # ------------------------------------------------------------------ #
    # Local storage
    # ------------------------------------------------------------------ #
    UPLOAD_DIR: str = _opt("UPLOAD_DIR", "/var/uploads/sites")

    # ------------------------------------------------------------------ #
    # Rate limiting
    # ------------------------------------------------------------------ #
    RATE_LIMIT_UPLOADS_PER_HOUR: int = _int("RATE_LIMIT_UPLOADS_PER_HOUR", 5)

    # ------------------------------------------------------------------ #
    # Optional extra security header
    # ------------------------------------------------------------------ #
    # When set, every request must include  x-api-key: <value>
    API_KEY: str = _opt("API_KEY", "")

    # ------------------------------------------------------------------ #
    # Worker / watchdog tuning
    # ------------------------------------------------------------------ #
    WORKER_POLL_INTERVAL_SECONDS: int = _int("WORKER_POLL_INTERVAL_SECONDS", 10)
    WATCHDOG_INTERVAL_SECONDS: int = _int("WATCHDOG_INTERVAL_SECONDS", 60)
    # Maximum concurrent provisioning tasks
    WORKER_CONCURRENCY: int = _int("WORKER_CONCURRENCY", 3)

    # Helpers ------------------------------------------------------------ #
    @property
    def proxmox_ssh_host(self) -> str:
        return self.PROXMOX_SSH_HOST or self.PROXMOX_HOST

    @property
    def nginx_proxy_ssh_host(self) -> str:
        return self.NGINX_PROXY_SSH_HOST or self.proxmox_ssh_host


settings = _Settings()
