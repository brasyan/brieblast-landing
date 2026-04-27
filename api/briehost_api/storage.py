"""
Local-disk storage for uploaded zip files.

Each uploaded zip is stored as  <UPLOAD_DIR>/<site_id>.zip  so it can be
retrieved by the provisioning worker and re-used for re-deploys.
"""
from __future__ import annotations

import asyncio
import os

import aiofiles

from briehost_api.config import settings


def _ensure_upload_dir() -> str:
    os.makedirs(settings.UPLOAD_DIR, mode=0o700, exist_ok=True)
    return settings.UPLOAD_DIR


def zip_path(site_id: str) -> str:
    """Return the absolute path for the stored zip of *site_id*."""
    return os.path.join(_ensure_upload_dir(), f"{site_id}.zip")


async def save_zip(site_id: str, data: bytes) -> str:
    """Persist *data* as the zip for *site_id*. Returns the file path."""
    path = zip_path(site_id)
    async with aiofiles.open(path, "wb") as fh:
        await fh.write(data)
    return path


def delete_zip(site_id: str) -> None:
    """Remove the stored zip for *site_id* (silently ignores missing files)."""
    path = zip_path(site_id)
    try:
        os.unlink(path)
    except FileNotFoundError:
        pass


async def delete_zip_async(site_id: str) -> None:
    await asyncio.to_thread(delete_zip, site_id)
