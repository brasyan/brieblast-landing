"""
FastAPI dependency that verifies the Supabase JWT and returns the caller's
user UUID.  Optionally enforces a shared API key header for an extra layer of
network-level protection.
"""
from __future__ import annotations

from typing import Optional

import jwt
from fastapi import Header, HTTPException, status

from briehost_api.config import settings


def _verify_jwt(token: str) -> str:
    """Decode and validate a Supabase-issued JWT. Returns the user UUID."""
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
        )

    user_id: Optional[str] = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing 'sub' claim",
        )
    return user_id


async def require_auth(
    authorization: str = Header(..., description="Bearer <supabase-access-token>"),
    x_api_key: Optional[str] = Header(default=None),
) -> str:
    """
    FastAPI dependency.

    1. If API_KEY is configured, rejects requests without the matching
       x-api-key header.
    2. Validates the Authorization: Bearer <jwt> header against the
       Supabase JWT secret.

    Returns the authenticated user's UUID.
    """
    # Optional extra API-key guard
    if settings.API_KEY:
        if x_api_key != settings.API_KEY:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid or missing API key",
            )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header must be 'Bearer <token>'",
        )

    token = authorization[len("Bearer "):]
    return _verify_jwt(token)
