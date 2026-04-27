"""
HTTP routes for site management.

POST  /api/sites/upload      – Upload a zip, create a sites row, enqueue provisioning.
DELETE /api/sites/{site_id}  – Stop & destroy a site's container and remove its record.
"""
from __future__ import annotations

import asyncio
import logging
import os
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel

from briehost_api import db, storage
from briehost_api.auth import require_auth
from briehost_api.config import settings
from briehost_api.proxmox import proxmox
from briehost_api.zip_validator import ZipValidationError, validate_zip

log = logging.getLogger(__name__)

router = APIRouter(prefix="/api/sites", tags=["sites"])

MAX_UPLOAD_BYTES = 100 * 1024 * 1024  # 100 MB


class UploadResponse(BaseModel):
    siteId: str
    status: str


# --------------------------------------------------------------------------- #
# POST /api/sites/upload
# --------------------------------------------------------------------------- #

@router.post(
    "/upload",
    response_model=UploadResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Upload a PHP site zip for provisioning",
)
async def upload_site(
    user_id: Annotated[str, Depends(require_auth)],
    file: UploadFile = File(..., description="A .zip archive ≤ 100 MB"),
) -> UploadResponse:
    """
    Accept a ``.zip`` upload, persist it, record the site in the database, and
    enqueue a provisioning job.  Returns immediately with ``status=uploaded``;
    the dashboard polls the database (via Supabase real-time) for status
    changes.

    Validations performed server-side:
    - File extension must be ``.zip``.
    - File size must not exceed 100 MB.
    - Zip contents are validated for path traversal and zip-bomb patterns.
    - Per-user rate limit: configurable (default 5 uploads per hour).
    """
    # ------------------------------------------------------------------ #
    # Validate file metadata
    # ------------------------------------------------------------------ #
    filename = (file.filename or "").strip()
    if not filename.lower().endswith(".zip"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only .zip files are supported",
        )

    # ------------------------------------------------------------------ #
    # Read file (apply server-side size limit)
    # ------------------------------------------------------------------ #
    content = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File must be 100 MB or smaller",
        )

    # ------------------------------------------------------------------ #
    # Rate limiting
    # ------------------------------------------------------------------ #
    recent_count = await db.count_recent_uploads(user_id)
    if recent_count >= settings.RATE_LIMIT_UPLOADS_PER_HOUR:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"Rate limit exceeded: maximum {settings.RATE_LIMIT_UPLOADS_PER_HOUR} "
                "uploads per hour"
            ),
        )

    # ------------------------------------------------------------------ #
    # Persist zip to storage
    # ------------------------------------------------------------------ #
    # Derive a human-friendly name from the filename
    name = os.path.splitext(filename)[0][:100]

    # Insert DB row first to get the site UUID, then save the file under that UUID
    site = await db.insert_site(
        user_id=user_id,
        name=name,
        original_filename=filename,
        size_bytes=len(content),
    )
    site_id: str = site["id"]

    try:
        await storage.save_zip(site_id, content)
    except OSError as exc:
        # Roll back the DB row if storage fails
        await db.delete_site(site_id)
        log.exception("Failed to persist zip for site %s", site_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to store uploaded file",
        ) from exc

    # ------------------------------------------------------------------ #
    # Validate zip contents (quick structural check before returning)
    # ------------------------------------------------------------------ #
    zip_path = storage.zip_path(site_id)
    try:
        await asyncio.to_thread(validate_zip, zip_path)
    except ZipValidationError as exc:
        await db.update_site_failed(site_id, str(exc))
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    # The provisioning worker will pick up the 'uploaded' row automatically
    log.info("Site %s queued for provisioning (user=%s)", site_id, user_id)
    return UploadResponse(siteId=site_id, status="uploaded")


# --------------------------------------------------------------------------- #
# DELETE /api/sites/{site_id}
# --------------------------------------------------------------------------- #

@router.delete(
    "/{site_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a site and destroy its container",
)
async def delete_site(
    site_id: str,
    user_id: Annotated[str, Depends(require_auth)],
) -> None:
    """
    Stop and destroy the LXC container associated with *site_id*, remove the
    nginx proxy configuration, delete the stored zip, and remove the database
    row.

    The caller must own the site.
    """
    site = await db.get_site(site_id)
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site not found",
        )
    if site["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not own this site",
        )

    vmid: int | None = site.get("proxmox_vmid")

    # Destroy the container (best-effort; errors are logged, not surfaced)
    if vmid is not None:
        log.info("Destroying container vmid=%s for site %s", vmid, site_id)
        await proxmox.safe_destroy_lxc(vmid)

    # Remove the nginx proxy vhost (best-effort)
    short_id = site_id.replace("-", "")[:12]
    proxy_conf = f"{settings.NGINX_SITES_DIR}/{short_id}.conf"
    try:
        from briehost_api import ssh as _ssh
        await _ssh.run_on_proxy(
            f"rm -f {proxy_conf} && nginx -t && systemctl reload nginx"
        )
    except Exception as exc:  # noqa: BLE001
        log.warning("Could not remove proxy config for site %s: %s", site_id, exc)

    # Remove the stored zip
    await storage.delete_zip_async(site_id)

    # Remove the DB row
    await db.delete_site(site_id)
    log.info("Site %s deleted", site_id)
