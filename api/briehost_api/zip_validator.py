"""
Zip-file security validation.

Checks performed:
  - File is a valid zip archive.
  - Number of entries does not exceed MAX_FILES (guards against zip-of-zips DoS).
  - Total uncompressed size does not exceed MAX_UNCOMPRESSED_BYTES (zip-bomb guard).
  - No entry has an absolute path or contains ".." components (path traversal guard).
  - No symbolic links (prevents escaping the web root after extraction).
"""
from __future__ import annotations

import os
import stat
import zipfile

MAX_FILES = 10_000
MAX_UNCOMPRESSED_BYTES = 500 * 1024 * 1024  # 500 MB
_S_IFLNK = stat.S_IFLNK  # 0xA000


class ZipValidationError(ValueError):
    """Raised when the zip fails a security or integrity check."""


def _is_symlink_entry(entry: zipfile.ZipInfo) -> bool:
    """Return True if the zip entry represents a symbolic link."""
    unix_mode = (entry.external_attr >> 16) & 0xFFFF
    return stat.S_IFMT(unix_mode) == _S_IFLNK


def _is_unsafe_path(name: str) -> bool:
    """Return True if *name* attempts a path traversal."""
    if os.path.isabs(name):
        return True
    # Normalise separators and check every component
    parts = name.replace("\\", "/").split("/")
    return ".." in parts


def validate_zip(zip_path: str) -> None:
    """
    Validate *zip_path* for security.

    Raises :class:`ZipValidationError` if any check fails.
    """
    try:
        with zipfile.ZipFile(zip_path, "r") as zf:
            entries = zf.infolist()
    except zipfile.BadZipFile as exc:
        raise ZipValidationError(f"Not a valid zip archive: {exc}") from exc

    if len(entries) > MAX_FILES:
        raise ZipValidationError(
            f"Zip contains too many entries ({len(entries)} > {MAX_FILES})"
        )

    total_uncompressed = 0
    for entry in entries:
        if _is_unsafe_path(entry.filename):
            raise ZipValidationError(
                f"Path traversal detected in zip entry: {entry.filename!r}"
            )
        if _is_symlink_entry(entry):
            raise ZipValidationError(
                f"Symbolic links are not permitted: {entry.filename!r}"
            )
        total_uncompressed += entry.file_size
        if total_uncompressed > MAX_UNCOMPRESSED_BYTES:
            raise ZipValidationError(
                f"Uncompressed content exceeds {MAX_UNCOMPRESSED_BYTES // 1024 // 1024} MB "
                "(possible zip-bomb)"
            )


def extract_zip_safe(zip_path: str, dest_dir: str) -> None:
    """
    Extract *zip_path* into *dest_dir*, skipping any unsafe entries.

    Each extracted path is canonicalised and verified to stay inside
    *dest_dir* before writing; this provides defence-in-depth on top of
    :func:`validate_zip`.
    """
    real_dest = os.path.realpath(dest_dir)
    with zipfile.ZipFile(zip_path, "r") as zf:
        for entry in zf.infolist():
            name = entry.filename

            # Skip directories (they are created implicitly below)
            if entry.is_dir():
                continue

            # Skip unsafe or symlink entries (already caught by validate_zip,
            # but guard here as well for defence-in-depth)
            if _is_unsafe_path(name) or _is_symlink_entry(entry):
                continue

            dest_path = os.path.realpath(os.path.join(dest_dir, name))
            # Use commonpath for a cross-platform containment check (avoids
            # double-separator edge-cases and mixed drive letters on Windows)
            try:
                if os.path.commonpath([real_dest, dest_path]) != real_dest:
                    continue
            except ValueError:
                # commonpath raises ValueError for paths on different drives
                continue

            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            with zf.open(entry) as src, open(dest_path, "wb") as dst:
                dst.write(src.read())
