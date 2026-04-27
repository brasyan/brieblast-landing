"""
Container health watchdog.

Periodically queries Proxmox for the status of all containers that the
database believes are ``live``.  If a container is found to be stopped or
missing, the corresponding site is marked ``failed`` with an explanatory
message.

This reconciles state after unexpected container crashes, Proxmox host reboots,
or manual interventions that happen outside the normal API workflow.
"""
from __future__ import annotations

import asyncio
import logging

from briehost_api import db
from briehost_api.config import settings
from briehost_api.proxmox import proxmox

log = logging.getLogger(__name__)


async def _check_container(site_id: str, vmid: int) -> None:
    """Check one container and mark it failed if it is not running."""
    try:
        status = await proxmox.get_lxc_status(vmid)
    except Exception as exc:
        log.warning(
            "Watchdog: could not fetch status for vmid=%s (site %s): %s",
            vmid,
            site_id,
            exc,
        )
        return

    if status != "running":
        log.warning(
            "Watchdog: vmid=%s (site %s) is %r – marking failed",
            vmid,
            site_id,
            status,
        )
        await db.update_site_failed(
            site_id,
            f"Container (vmid {vmid}) is {status!r}. "
            "It may have crashed or been stopped externally.",
        )


async def run_watchdog() -> None:
    """
    Periodically check all ``live`` containers.

    Designed to run as a long-lived asyncio task for the lifetime of the
    FastAPI process.  Cancellation is handled gracefully.
    """
    log.info(
        "Container watchdog started (interval=%ss)",
        settings.WATCHDOG_INTERVAL_SECONDS,
    )
    while True:
        await asyncio.sleep(settings.WATCHDOG_INTERVAL_SECONDS)
        try:
            live_sites = await db.get_live_sites()
            if live_sites:
                checks = [
                    _check_container(s["id"], s["proxmox_vmid"]) for s in live_sites
                ]
                await asyncio.gather(*checks, return_exceptions=True)
        except asyncio.CancelledError:
            log.info("Watchdog cancelled – shutting down")
            return
        except Exception:
            log.exception("Error in watchdog loop")
