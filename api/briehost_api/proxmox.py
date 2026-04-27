"""
Thin async wrapper around the Proxmox VE REST API.

Authentication uses the API token scheme:
    Authorization: PVEAPIToken=<token-id>=<token-secret>

where <token-id> is in the form  user@realm!token-name.

All methods that trigger a Proxmox task return the UPID string.
Use :meth:`ProxmoxClient.wait_for_task` to block until it completes.
"""
from __future__ import annotations

import asyncio
import logging
from typing import Any, Optional

import httpx

from briehost_api.config import settings

log = logging.getLogger(__name__)

# --------------------------------------------------------------------------- #
# Plan → LXC resource mapping
# --------------------------------------------------------------------------- #
PLAN_RESOURCES: dict[str, dict[str, int]] = {
    "smol_brie":  {"cores": 1, "memory_mb": 512,  "rootfs_gb": 5},
    "thicc_brie": {"cores": 2, "memory_mb": 1024, "rootfs_gb": 20},
    "mega_brie":  {"cores": 4, "memory_mb": 2048, "rootfs_gb": 50},
    # Fallback for users without a plan (should not normally reach provisioning)
    "none":       {"cores": 1, "memory_mb": 256,  "rootfs_gb": 2},
}


def resources_for_plan(plan: str) -> dict[str, int]:
    return PLAN_RESOURCES.get(plan, PLAN_RESOURCES["none"])


# --------------------------------------------------------------------------- #
# IP addressing
# --------------------------------------------------------------------------- #

def vmid_to_ip(vmid: int) -> str:
    """
    Deterministically map a VMID to a private IP address.

    vmid_min + 0 → <base>.10
    vmid_min + 1 → <base>.11
    …

    The last usable address in a /24 block is .254, so we reserve .1 for the
    gateway and start containers at .10, giving 245 containers per /24 block.
    After 245 containers the third octet is incremented automatically.
    """
    offset = vmid - settings.PROXMOX_VMID_MIN  # 0-based index
    base_parts = settings.CONTAINER_NETWORK_BASE.split(".")  # e.g. ["10","100","0"]
    third = int(base_parts[2]) + (offset // 245)
    fourth = (offset % 245) + 10  # start at .10 (leaves .1 for the gateway)
    return f"{base_parts[0]}.{base_parts[1]}.{third}.{fourth}"


# --------------------------------------------------------------------------- #
# Client
# --------------------------------------------------------------------------- #

class ProxmoxClient:
    """Async Proxmox VE API client."""

    def __init__(self) -> None:
        self._base = (
            f"https://{settings.PROXMOX_HOST}:{settings.PROXMOX_PORT}/api2/json"
        )

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": (
                f"PVEAPIToken={settings.PROXMOX_TOKEN_ID}"
                f"={settings.PROXMOX_TOKEN_SECRET}"
            )
        }

    def _client(self) -> httpx.AsyncClient:
        return httpx.AsyncClient(
            verify=settings.PROXMOX_VERIFY_TLS,
            timeout=httpx.Timeout(30.0),
        )

    async def _get(self, path: str) -> Any:
        async with self._client() as c:
            r = await c.get(f"{self._base}{path}", headers=self._headers())
            r.raise_for_status()
            return r.json().get("data")

    async def _post(self, path: str, data: dict) -> Any:
        async with self._client() as c:
            r = await c.post(
                f"{self._base}{path}", headers=self._headers(), data=data
            )
            r.raise_for_status()
            return r.json().get("data")

    async def _delete(self, path: str, params: Optional[dict] = None) -> Any:
        async with self._client() as c:
            r = await c.delete(
                f"{self._base}{path}",
                headers=self._headers(),
                params=params or {},
            )
            r.raise_for_status()
            return r.json().get("data")

    # ---------------------------------------------------------------------- #
    # Task management
    # ---------------------------------------------------------------------- #

    async def wait_for_task(
        self, upid: str, timeout: int = 180, poll_interval: float = 3.0
    ) -> str:
        """
        Poll a Proxmox task until it reaches 'stopped' status.

        Returns the exit status string (e.g. "OK" or an error message).
        Raises :class:`TimeoutError` if the task does not finish in time.
        """
        node = settings.PROXMOX_NODE
        import time
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            data = await self._get(f"/nodes/{node}/tasks/{upid}/status")
            if data and data.get("status") == "stopped":
                return data.get("exitstatus", "unknown")
            await asyncio.sleep(poll_interval)
        raise TimeoutError(
            f"Proxmox task {upid!r} did not complete within {timeout}s"
        )

    # ---------------------------------------------------------------------- #
    # VMID allocation
    # ---------------------------------------------------------------------- #

    async def next_vmid(self) -> int:
        """Return the next available VMID, clamped to our configured range."""
        data = await self._get("/cluster/nextid")
        vmid = int(data)
        if vmid < settings.PROXMOX_VMID_MIN:
            vmid = settings.PROXMOX_VMID_MIN
        if vmid > settings.PROXMOX_VMID_MAX:
            raise RuntimeError(
                f"VMID {vmid} exceeds configured maximum {settings.PROXMOX_VMID_MAX}"
            )
        return vmid

    # ---------------------------------------------------------------------- #
    # LXC lifecycle
    # ---------------------------------------------------------------------- #

    async def create_lxc(
        self, vmid: int, hostname: str, resources: dict[str, int]
    ) -> str:
        """
        Create an unprivileged LXC container.

        Container characteristics:
        - Unprivileged (drops all capabilities)
        - Attached to the configured private bridge (no direct internet access
          unless the Proxmox host's firewall permits specific outbound routes)
        - Static IP derived from VMID for predictable internal routing

        Returns the Proxmox task UPID.
        """
        node = settings.PROXMOX_NODE
        container_ip = vmid_to_ip(vmid)
        subnet = settings.CONTAINER_SUBNET_PREFIX
        gw = settings.CONTAINER_GATEWAY

        params: dict[str, Any] = {
            "vmid": vmid,
            "ostemplate": settings.PROXMOX_TEMPLATE,
            "hostname": hostname,
            "cores": resources["cores"],
            "memory": resources["memory_mb"],
            "swap": 0,
            "rootfs": f"{settings.PROXMOX_STORAGE}:{resources['rootfs_gb']}",
            "net0": (
                f"name=eth0,bridge={settings.PROXMOX_BRIDGE},"
                f"ip={container_ip}/{subnet},gw={gw}"
            ),
            "unprivileged": 1,
            "onboot": 0,
            "start": 0,
            # Security: drop all capabilities the LXC framework does not need
            "features": "nesting=0",
        }
        upid = await self._post(f"/nodes/{node}/lxc", params)
        return str(upid)

    async def start_lxc(self, vmid: int) -> str:
        """Start a stopped LXC container. Returns task UPID."""
        node = settings.PROXMOX_NODE
        upid = await self._post(f"/nodes/{node}/lxc/{vmid}/status/start", {})
        return str(upid)

    async def stop_lxc(self, vmid: int) -> str:
        """Force-stop a running LXC container. Returns task UPID."""
        node = settings.PROXMOX_NODE
        upid = await self._post(
            f"/nodes/{node}/lxc/{vmid}/status/stop", {"forceStop": 1}
        )
        return str(upid)

    async def destroy_lxc(self, vmid: int) -> str:
        """
        Destroy an LXC container (must be stopped first).
        The ``force`` flag removes the container even if it has snapshots;
        ``purge`` removes it from the cluster's replication/backup configuration.

        Returns task UPID.
        """
        node = settings.PROXMOX_NODE
        upid = await self._delete(
            f"/nodes/{node}/lxc/{vmid}", params={"force": 1, "purge": 1}
        )
        return str(upid)

    async def get_lxc_status(self, vmid: int) -> str:
        """Return the current status string of an LXC container."""
        node = settings.PROXMOX_NODE
        data = await self._get(f"/nodes/{node}/lxc/{vmid}/status/current")
        return (data or {}).get("status", "unknown")

    async def safe_destroy_lxc(self, vmid: int) -> None:
        """
        Best-effort stop + destroy.  Errors are logged but not re-raised so
        that cleanup paths do not shadow the original exception.
        """
        try:
            stop_upid = await self.stop_lxc(vmid)
            await self.wait_for_task(stop_upid, timeout=60)
        except Exception as exc:  # noqa: BLE001
            log.warning("Could not stop vmid %s during cleanup: %s", vmid, exc)
        try:
            destroy_upid = await self.destroy_lxc(vmid)
            await self.wait_for_task(destroy_upid, timeout=120)
        except Exception as exc:  # noqa: BLE001
            log.warning("Could not destroy vmid %s during cleanup: %s", vmid, exc)


# Module-level singleton
proxmox = ProxmoxClient()
