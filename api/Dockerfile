# ─── Build stage ────────────────────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /build
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# ─── Runtime stage ──────────────────────────────────────────────────────────
FROM python:3.12-slim

# openssh-client is NOT needed: asyncssh is pure Python
RUN apt-get update && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /install /usr/local

WORKDIR /app
COPY briehost_api/ briehost_api/

# Upload storage directory (override with a bind-mount or volume in production)
RUN mkdir -p /var/uploads/sites && chmod 700 /var/uploads/sites

# Non-root user for defence-in-depth
RUN useradd --no-create-home --shell /bin/false appuser \
    && chown -R appuser /var/uploads/sites
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

CMD ["uvicorn", "briehost_api.main:app", "--host", "0.0.0.0", "--port", "8000"]
