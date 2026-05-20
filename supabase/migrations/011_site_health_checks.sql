-- Health checks for public status.
-- The backend/worker should periodically check live sites and write one row per
-- check with public.record_site_health_check(...). The public /status summary
-- only counts a site as online when a recent health check says it is up.

CREATE TABLE IF NOT EXISTS public.site_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('up', 'down', 'unknown')),
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  response_ms INTEGER CHECK (response_ms IS NULL OR response_ms >= 0),
  status_code INTEGER CHECK (status_code IS NULL OR status_code BETWEEN 100 AND 599),
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS site_health_checks_site_checked_idx
  ON public.site_health_checks(site_id, checked_at DESC);

CREATE INDEX IF NOT EXISTS site_health_checks_checked_at_idx
  ON public.site_health_checks(checked_at DESC);

ALTER TABLE public.site_health_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own site health checks" ON public.site_health_checks;
DROP POLICY IF EXISTS "Admins can read all site health checks" ON public.site_health_checks;

CREATE POLICY "Users can read own site health checks"
  ON public.site_health_checks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.sites
      WHERE sites.id = site_health_checks.site_id
        AND sites.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all site health checks"
  ON public.site_health_checks
  FOR SELECT
  USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.record_site_health_check(
  p_site_id UUID,
  p_status TEXT,
  p_response_ms INTEGER DEFAULT NULL,
  p_status_code INTEGER DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_id UUID;
BEGIN
  IF p_status NOT IN ('up', 'down', 'unknown') THEN
    RAISE EXCEPTION 'Invalid health check status: %', p_status;
  END IF;

  INSERT INTO public.site_health_checks (
    site_id,
    status,
    response_ms,
    status_code,
    error_message
  )
  VALUES (
    p_site_id,
    p_status,
    p_response_ms,
    p_status_code,
    NULLIF(left(coalesce(p_error_message, ''), 500), '')
  )
  RETURNING id INTO inserted_id;

  RETURN inserted_id;
END;
$$;

REVOKE ALL ON FUNCTION public.record_site_health_check(UUID, TEXT, INTEGER, INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_site_health_check(UUID, TEXT, INTEGER, INTEGER, TEXT) TO service_role;

CREATE OR REPLACE FUNCTION public.get_public_status_summary()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH latest_health AS (
    SELECT DISTINCT ON (site_id)
      site_id,
      status,
      checked_at,
      response_ms,
      status_code
    FROM public.site_health_checks
    ORDER BY site_id, checked_at DESC
  ),
  public_sites AS (
    SELECT
      sites.id,
      sites.status,
      sites.updated_at,
      latest_health.status AS health_status,
      latest_health.checked_at AS health_checked_at
    FROM public.sites
    LEFT JOIN latest_health ON latest_health.site_id = sites.id
    WHERE sites.status <> 'scan_failed'
  ),
  site_stats AS (
    SELECT
      COUNT(*)::INT AS total,
      COUNT(*) FILTER (WHERE status = 'live')::INT AS live_configured,
      COUNT(*) FILTER (
        WHERE status = 'live'
          AND health_status = 'up'
          AND health_checked_at >= now() - interval '5 minutes'
      )::INT AS healthy,
      COUNT(*) FILTER (
        WHERE status = 'live'
          AND health_status = 'down'
          AND health_checked_at >= now() - interval '5 minutes'
      )::INT AS unhealthy,
      COUNT(*) FILTER (
        WHERE status = 'live'
          AND (
            health_checked_at IS NULL
            OR health_checked_at < now() - interval '5 minutes'
            OR health_status = 'unknown'
          )
      )::INT AS unknown,
      COUNT(*) FILTER (WHERE status = 'uploaded')::INT AS uploaded,
      COUNT(*) FILTER (WHERE status = 'scanning')::INT AS scanning,
      COUNT(*) FILTER (WHERE status = 'provisioning')::INT AS provisioning,
      COUNT(*) FILTER (WHERE status = 'failed')::INT AS failed,
      MAX(updated_at) AS last_site_update,
      MAX(health_checked_at) AS last_health_check
    FROM public_sites
  ),
  public_incidents AS (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', incident.id,
          'date', to_char(incident.started_at AT TIME ZONE 'UTC', 'YYYY-MM-DD'),
          'title', incident.title,
          'service', incident.service,
          'status',
            CASE incident.status
              WHEN 'investigating' THEN 'Investigating'
              WHEN 'identified' THEN 'Identified'
              WHEN 'monitoring' THEN 'Monitoring'
              ELSE 'Resolved'
            END,
          'severity', incident.severity,
          'description', incident.description
        )
        ORDER BY
          CASE WHEN incident.status = 'resolved' THEN 1 ELSE 0 END,
          incident.started_at DESC
      ),
      '[]'::jsonb
    ) AS items
    FROM (
      SELECT id, title, service, status, severity, description, started_at
      FROM public.status_incidents
      ORDER BY
        CASE WHEN status = 'resolved' THEN 1 ELSE 0 END,
        started_at DESC
      LIMIT 10
    ) AS incident
  )
  SELECT jsonb_build_object(
    'generatedAt', now(),
    'sites', jsonb_build_object(
      'total', site_stats.total,
      'live', site_stats.healthy,
      'liveConfigured', site_stats.live_configured,
      'healthy', site_stats.healthy,
      'unhealthy', site_stats.unhealthy,
      'unknown', site_stats.unknown,
      'uploaded', site_stats.uploaded,
      'scanning', site_stats.scanning,
      'provisioning', site_stats.provisioning,
      'failed', site_stats.failed,
      'scanFailed', 0,
      'lastUpdated', site_stats.last_site_update,
      'lastHealthCheck', site_stats.last_health_check
    ),
    'incidents', public_incidents.items
  )
  FROM site_stats, public_incidents;
$$;

REVOKE ALL ON FUNCTION public.get_public_status_summary() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_status_summary() TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_status_summary() TO authenticated;
