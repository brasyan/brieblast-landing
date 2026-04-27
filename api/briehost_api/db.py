"""
All database operations performed by the API server use the Supabase
service-role key, which bypasses Row-Level Security.  Every function is a
plain synchronous call; callers that live in async contexts should wrap with
``asyncio.to_thread``.
"""
from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone
from typing import Optional

from supabase import Client, create_client

from briehost_api.config import settings

# Module-level singleton; created lazily on first use.
_client: Optional[Client] = None


def _db() -> Client:
    global _client
    if _client is None:
        _client = create_client(
            settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY
        )
    return _client


# --------------------------------------------------------------------------- #
# Async wrappers (thin shim so callers stay fully async)
# --------------------------------------------------------------------------- #

async def _run(fn, *args, **kwargs):
    return await asyncio.to_thread(fn, *args, **kwargs)


# --------------------------------------------------------------------------- #
# sites table
# --------------------------------------------------------------------------- #

def _insert_site_sync(
    user_id: str,
    name: str,
    original_filename: str,
    size_bytes: int,
) -> dict:
    result = (
        _db()
        .table("sites")
        .insert(
            {
                "user_id": user_id,
                "name": name,
                "original_filename": original_filename,
                "size_bytes": size_bytes,
                "status": "uploaded",
            }
        )
        .execute()
    )
    return result.data[0]


async def insert_site(
    user_id: str,
    name: str,
    original_filename: str,
    size_bytes: int,
) -> dict:
    return await _run(_insert_site_sync, user_id, name, original_filename, size_bytes)


def _get_site_sync(site_id: str) -> Optional[dict]:
    result = (
        _db().table("sites").select("*").eq("id", site_id).maybe_single().execute()
    )
    return result.data


async def get_site(site_id: str) -> Optional[dict]:
    return await _run(_get_site_sync, site_id)


def _update_site_sync(site_id: str, fields: dict) -> None:
    _db().table("sites").update(fields).eq("id", site_id).execute()


async def update_site(site_id: str, **fields) -> None:
    await _run(_update_site_sync, site_id, fields)


async def update_site_status(site_id: str, status: str) -> None:
    await update_site(site_id, status=status)


async def update_site_vmid(site_id: str, vmid: int) -> None:
    await update_site(site_id, proxmox_vmid=vmid)


async def update_site_live(site_id: str, url: str) -> None:
    await update_site(site_id, status="live", url=url)


async def update_site_failed(site_id: str, error: str) -> None:
    await update_site(
        site_id,
        status="failed",
        error_message=error[:1000],
    )


def _delete_site_sync(site_id: str) -> None:
    _db().table("sites").delete().eq("id", site_id).execute()


async def delete_site(site_id: str) -> None:
    await _run(_delete_site_sync, site_id)


def _get_pending_sites_sync() -> list[dict]:
    result = _db().table("sites").select("*").eq("status", "uploaded").execute()
    return result.data or []


async def get_pending_sites() -> list[dict]:
    return await _run(_get_pending_sites_sync)


def _get_live_sites_sync() -> list[dict]:
    result = (
        _db()
        .table("sites")
        .select("id,proxmox_vmid,status")
        .eq("status", "live")
        .execute()
    )
    return [s for s in (result.data or []) if s.get("proxmox_vmid") is not None]


async def get_live_sites() -> list[dict]:
    return await _run(_get_live_sites_sync)


def _heal_provisioning_sync() -> None:
    """Reset containers left in 'provisioning' (mid-flight on last crash) to 'uploaded'."""
    _db().table("sites").update({"status": "uploaded"}).eq(
        "status", "provisioning"
    ).execute()


async def heal_provisioning() -> None:
    await _run(_heal_provisioning_sync)


# --------------------------------------------------------------------------- #
# profiles table
# --------------------------------------------------------------------------- #

def _get_user_plan_sync(user_id: str) -> str:
    result = (
        _db()
        .table("profiles")
        .select("plan")
        .eq("id", user_id)
        .maybe_single()
        .execute()
    )
    return (result.data or {}).get("plan", "none")


async def get_user_plan(user_id: str) -> str:
    return await _run(_get_user_plan_sync, user_id)


# --------------------------------------------------------------------------- #
# Rate limiting helper
# --------------------------------------------------------------------------- #

def _count_recent_uploads_sync(user_id: str, since_iso: str) -> int:
    result = (
        _db()
        .table("sites")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .gte("created_at", since_iso)
        .execute()
    )
    return result.count or 0


async def count_recent_uploads(user_id: str) -> int:
    since = (
        datetime.now(timezone.utc) - timedelta(hours=1)
    ).isoformat()
    return await _run(_count_recent_uploads_sync, user_id, since)
