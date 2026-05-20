-- Public status summary for the /status page.
-- Exposes only aggregate deployment health, not user/site contents.
-- Public incident entries are added in 010_manual_status_incidents.sql.

ALTER TABLE public.sites DROP CONSTRAINT IF EXISTS sites_status_check;
ALTER TABLE public.sites
ADD CONSTRAINT sites_status_check
CHECK (status IN ('uploaded', 'scanning', 'provisioning', 'live', 'failed', 'scan_failed'));

CREATE OR REPLACE FUNCTION public.get_public_status_summary()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH site_stats AS (
    SELECT
      COUNT(*)::INT AS total,
      COUNT(*) FILTER (WHERE status = 'live')::INT AS live,
      COUNT(*) FILTER (WHERE status = 'uploaded')::INT AS uploaded,
      COUNT(*) FILTER (WHERE status = 'scanning')::INT AS scanning,
      COUNT(*) FILTER (WHERE status = 'provisioning')::INT AS provisioning,
      COUNT(*) FILTER (WHERE status = 'failed')::INT AS failed,
      MAX(updated_at) AS last_site_update
    FROM public.sites
  )
  SELECT jsonb_build_object(
    'generatedAt', now(),
    'sites', jsonb_build_object(
      'total', site_stats.total,
      'live', site_stats.live,
      'uploaded', site_stats.uploaded,
      'scanning', site_stats.scanning,
      'provisioning', site_stats.provisioning,
      'failed', site_stats.failed,
      'scanFailed', 0,
      'lastUpdated', site_stats.last_site_update
    ),
    'incidents', '[]'::jsonb
  )
  FROM site_stats;
$$;

REVOKE ALL ON FUNCTION public.get_public_status_summary() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_status_summary() TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_status_summary() TO authenticated;
