# briehost-api

Backend API server for BrieHosting.  Accepts site zip uploads from the
dashboard, spins up an unprivileged LXC container on a Proxmox VE node for
each site, deploys the PHP/HTML content, and configures an nginx reverse proxy
so the site is immediately reachable at a public subdomain.

---

## Architecture overview

```
Browser (React dashboard)
        │ POST /api/sites/upload  (multipart/form-data)
        │ Bearer: <supabase-jwt>
        ▼
briehost-api  (FastAPI, Python 3.12)
        │
        ├─ Supabase (Postgres + realtime)
        │       public.sites      – site records + status
        │       public.profiles   – user plan
        │
        ├─ Proxmox VE REST API    – create / start / destroy LXC containers
        │
        └─ SSH → Proxmox host     – pct exec (bootstrap, deploy)
                                  – pct push (file copy into container)
                                  – nginx vhost drop + reload
```

### Upload flow (synchronous part)

1. Validate JWT + optional API key.
2. Check rate limit (≤ N uploads per hour via DB count).
3. Validate file type (`.zip`) and size (≤ 100 MB).
4. Write zip to `UPLOAD_DIR/<site-id>.zip`.
5. Run zip security checks (path traversal, zip-bomb, symlinks).
6. Insert a `sites` row with `status = 'uploaded'`.
7. Return `{ siteId, status: "uploaded" }` immediately.

### Provisioning pipeline (background worker)

The worker polls for `uploaded` rows every `WORKER_POLL_INTERVAL_SECONDS`
seconds and processes up to `WORKER_CONCURRENCY` sites in parallel.

```
uploaded
   │
   ▼  (worker picks up the row)
provisioning
   │
   ├─ Validate + extract zip
   ├─ Create unprivileged LXC container (Proxmox REST API)
   ├─ Store vmid in DB (enables cleanup on failure)
   ├─ Start container
   ├─ Bootstrap: apt-get install nginx php8.2-fpm … (via pct exec over SSH)
   ├─ Copy site files (tar → pct push → extract)
   ├─ Configure nginx inside container (PHP-FPM vhost)
   ├─ Drop reverse-proxy vhost on nginx proxy host
   └─ Reload proxy nginx
   │
   ├─ success → live  (sites.url = "https://<short-id>.<BASE_DOMAIN>")
   └─ failure → failed (sites.error_message = "…")
```

### Watchdog

A separate asyncio task runs every `WATCHDOG_INTERVAL_SECONDS` seconds, queries
Proxmox for the status of all `live` containers, and marks any that are not
`running` as `failed`.

---

## Prerequisites

| Component | Notes |
|-----------|-------|
| Proxmox VE 7+ | API token with `VM.Allocate`, `VM.Config.Network`, `VM.PowerMgmt`, `VM.Console`, `Datastore.AllocateSpace` |
| LXC template | Debian 12 standard image downloaded to local storage |
| Private bridge | `vmbr1` (or custom) with DHCP/routing to the container subnet |
| SSH key | API server must be able to SSH to the Proxmox host as root (for `pct` commands) |
| nginx proxy | On the Proxmox host or a separate machine; must accept SSH + allow config drops |
| Wildcard TLS cert | Optional — enables HTTPS for `*.sites.example.com` |
| Supabase project | URL, service-role key, and JWT secret |

---

## Quick start

```bash
cd api
cp .env.example .env
# edit .env with your values

# Run locally
pip install -r requirements.txt
uvicorn briehost_api.main:app --reload

# Or with Docker Compose
docker compose up --build
```

The API will be available at `http://localhost:8000`.
Interactive docs at `http://localhost:8000/docs`.

---

## Environment variables

See [`.env.example`](.env.example) for the full list with inline documentation.

**Required:**

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (bypasses RLS) |
| `SUPABASE_JWT_SECRET` | JWT secret used to verify user tokens |
| `PROXMOX_HOST` | Hostname / IP of the Proxmox node |
| `PROXMOX_TOKEN_ID` | Proxmox API token ID (`user@realm!token`) |
| `PROXMOX_TOKEN_SECRET` | Proxmox API token secret |

**Key optional:**

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_DOMAIN` | `sites.example.com` | Subdomain base for published sites |
| `PROXMOX_BRIDGE` | `vmbr1` | Private bridge for container networking |
| `WILDCARD_CERT_FULLCHAIN` | *(empty)* | Enable HTTPS with a wildcard cert |
| `API_KEY` | *(empty)* | Require `x-api-key` header on all requests |
| `WORKER_CONCURRENCY` | `3` | Max simultaneous provisioning jobs |
| `RATE_LIMIT_UPLOADS_PER_HOUR` | `5` | Per-user upload rate limit |

---

## Proxmox setup

### 1. Create the API token

```
Datacenter → Permissions → API Tokens → Add
  User:  root@pam  (or a dedicated user)
  Token ID: briehost
  Privilege Separation: unchecked (inherits user permissions)
```

Grant the token these permissions on `/` (or the relevant paths):

```
pveum aclmod / -token 'root@pam!briehost' -role PVEAdmin
```

### 2. Create the private bridge

On the Proxmox host, add to `/etc/network/interfaces`:

```
auto vmbr1
iface vmbr1 inet static
    address 10.100.0.1/24
    bridge-ports none
    bridge-stp off
    bridge-fd 0
    # Masquerade so containers can reach the internet (apt-get etc.)
    post-up   iptables -t nat -A POSTROUTING -s '10.100.0.0/24' -o vmbr0 -j MASQUERADE
    post-down iptables -t nat -D POSTROUTING -s '10.100.0.0/24' -o vmbr0 -j MASQUERADE
```

Apply with `ifreload -a`.

### 3. Download the Debian template

```bash
pveam update
pveam download local debian-12-standard_12.2-1_amd64.tar.zst
```

### 4. Configure SSH access

Generate an ED25519 key pair (or use an existing one):

```bash
ssh-keygen -t ed25519 -f ~/.ssh/briehost_proxmox -C "briehost-api"
ssh-copy-id -i ~/.ssh/briehost_proxmox.pub root@proxmox.example.com
```

Place the private key at the path specified by `PROXMOX_SSH_KEY_PATH` (default
`/run/secrets/proxmox_ssh_key`) and mount it read-only into the API container.

For strict host-key verification set `PROXMOX_SSH_KNOWN_HOSTS` to a file
containing the Proxmox host's fingerprint:

```bash
ssh-keyscan proxmox.example.com > proxmox_known_hosts
```

---

## Security considerations

- Containers run **unprivileged** (`unprivileged=1`) with no extra capabilities.
- Containers are attached to a **private bridge** (`vmbr1`) with no direct
  inbound internet access; the nginx proxy is the only ingress path.
- Zip uploads are validated for **path traversal**, **zip-bombs** (max 500 MB
  uncompressed, 10 000 files), and **symlinks** before any extraction.
- The Supabase **service-role key** is only held by this server and never
  exposed to the browser.
- The `PROXMOX_VERIFY_TLS=false` default is suitable for self-signed
  certificates in a private network; set to `true` in production with a valid
  cert.
- Set `PROXMOX_SSH_KNOWN_HOSTS` in production to prevent MITM attacks on the
  SSH channel.

---

## Database migrations

Apply the migration in `supabase/migrations/004_add_sites_index.sql` to add
a composite index that makes the worker's polling queries efficient:

```sql
CREATE INDEX IF NOT EXISTS sites_status_idx ON public.sites (status);
```
