"""
Async SSH helpers for running commands and transferring files on the
Proxmox host (or the nginx proxy host when they differ).

Uses ``asyncssh`` (pure-Python) so no external SSH binary is required.

Security note
-------------
``known_hosts=None`` is used when ``PROXMOX_SSH_KNOWN_HOSTS`` is not
configured.  This makes the connection vulnerable to MITM attacks and should
only be used in trusted isolated lab environments.  In production, set
``PROXMOX_SSH_KNOWN_HOSTS`` to a file containing the host's fingerprint.
"""
from __future__ import annotations

import logging
from typing import Optional, Tuple

import asyncssh

from briehost_api.config import settings

log = logging.getLogger(__name__)


def _connect_kwargs(host: str) -> dict:
    return {
        "host": host,
        "port": settings.PROXMOX_SSH_PORT,
        "username": settings.PROXMOX_SSH_USER,
        "client_keys": [settings.PROXMOX_SSH_KEY_PATH],
        "known_hosts": settings.PROXMOX_SSH_KNOWN_HOSTS,
    }


async def run(host: str, cmd: str) -> Tuple[int, str, str]:
    """
    Run *cmd* on *host* over SSH.

    Returns ``(exit_status, stdout, stderr)``.
    Raises :class:`asyncssh.Error` on connection failures.
    """
    log.debug("SSH [%s] $ %s", host, cmd)
    async with asyncssh.connect(**_connect_kwargs(host)) as conn:
        result = await conn.run(cmd, check=False)
    log.debug(
        "SSH [%s] exit=%s stdout=%r stderr=%r",
        host,
        result.exit_status,
        result.stdout[:200] if result.stdout else "",
        result.stderr[:200] if result.stderr else "",
    )
    return result.exit_status, result.stdout or "", result.stderr or ""


async def run_checked(host: str, cmd: str, label: str = "") -> str:
    """
    Like :func:`run` but raises :class:`RuntimeError` if exit status is
    non-zero.  Returns stdout on success.
    """
    code, stdout, stderr = await run(host, cmd)
    if code != 0:
        prefix = f"{label}: " if label else ""
        raise RuntimeError(
            f"{prefix}Command failed (exit {code}).\n"
            f"CMD: {cmd}\n"
            f"STDERR: {stderr}\n"
            f"STDOUT: {stdout}"
        )
    return stdout


async def push_file(host: str, local_path: str, remote_path: str) -> None:
    """SCP *local_path* to *remote_path* on *host*."""
    log.debug("SCP [%s] %s → %s", host, local_path, remote_path)
    async with asyncssh.connect(**_connect_kwargs(host)) as conn:
        await asyncssh.scp(local_path, (conn, remote_path))


async def run_on_proxmox(cmd: str) -> Tuple[int, str, str]:
    """Run *cmd* on the configured Proxmox SSH host."""
    return await run(settings.proxmox_ssh_host, cmd)


async def run_on_proxmox_checked(cmd: str, label: str = "") -> str:
    return await run_checked(settings.proxmox_ssh_host, cmd, label)


async def push_file_to_proxmox(local_path: str, remote_path: str) -> None:
    """Push *local_path* to the Proxmox SSH host."""
    await push_file(settings.proxmox_ssh_host, local_path, remote_path)


async def run_on_proxy(cmd: str) -> Tuple[int, str, str]:
    """Run *cmd* on the nginx proxy host (may be the same as Proxmox)."""
    return await run(settings.nginx_proxy_ssh_host, cmd)


async def run_on_proxy_checked(cmd: str, label: str = "") -> str:
    return await run_checked(settings.nginx_proxy_ssh_host, cmd, label)


async def push_file_to_proxy(local_path: str, remote_path: str) -> None:
    """Push *local_path* to the nginx proxy host."""
    await push_file(settings.nginx_proxy_ssh_host, local_path, remote_path)
