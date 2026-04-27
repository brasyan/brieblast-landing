-- Add a composite index that makes polling for pending work fast.
-- The provisioning worker queries:  WHERE status = 'uploaded'
-- The watchdog queries:             WHERE status = 'live'
CREATE INDEX IF NOT EXISTS sites_status_idx ON public.sites (status);
