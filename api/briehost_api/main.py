"""
FastAPI application factory.

Lifespan
--------
On startup:
  1. Heal any 'provisioning' sites that were interrupted by a previous crash.
  2. Start the background provisioning worker.
  3. Start the container health watchdog.

On shutdown:
  Both background tasks are cancelled and awaited gracefully.
"""
from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from briehost_api import db
from briehost_api.provisioner import run_provisioning_worker
from briehost_api.routers import sites
from briehost_api.watchdog import run_watchdog

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s: %(message)s",
)
log = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ------------------------------------------------------------------ #
    # Startup
    # ------------------------------------------------------------------ #
    log.info("briehost-api starting up")

    # Reset any sites that were left 'provisioning' by a previous crash
    await db.heal_provisioning()
    log.info("Healed stale 'provisioning' sites → 'uploaded'")

    worker_task = asyncio.create_task(
        run_provisioning_worker(), name="provisioning-worker"
    )
    watchdog_task = asyncio.create_task(run_watchdog(), name="watchdog")

    yield  # ← application runs here

    # ------------------------------------------------------------------ #
    # Shutdown
    # ------------------------------------------------------------------ #
    log.info("briehost-api shutting down – cancelling background tasks")
    worker_task.cancel()
    watchdog_task.cancel()
    await asyncio.gather(worker_task, watchdog_task, return_exceptions=True)
    log.info("Background tasks stopped")


app = FastAPI(
    title="briehost-api",
    description=(
        "Backend API for BrieHosting – handles site uploads, "
        "LXC container provisioning on Proxmox VE, and lifecycle management."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

# Allow the Vite dev server and the production domain to call the API.
# Adjust origins for your deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://briehosting.example.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------------
# Routes
# -------------------------------------------------------------------------
app.include_router(sites.router)


@app.get("/health", tags=["meta"])
async def health() -> JSONResponse:
    """Simple liveness probe used by Docker / load-balancers."""
    return JSONResponse({"status": "ok"})
