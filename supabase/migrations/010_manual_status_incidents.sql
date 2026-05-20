-- Manual public incidents for /status.
-- Security scan failures stay private in the admin security view and are never
-- exposed as public incidents.

CREATE TABLE IF NOT EXISTS public.status_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(trim(title)) BETWEEN 3 AND 120),
  service TEXT NOT NULL DEFAULT 'Platform' CHECK (char_length(trim(service)) BETWEEN 2 AND 80),
  status TEXT NOT NULL DEFAULT 'investigating'
    CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved')),
  severity TEXT NOT NULL DEFAULT 'degraded'
    CHECK (severity IN ('notice', 'degraded', 'outage')),
  description TEXT NOT NULL CHECK (char_length(trim(description)) BETWEEN 10 AND 2000),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS status_incidents_started_at_idx
  ON public.status_incidents(started_at DESC);

CREATE INDEX IF NOT EXISTS status_incidents_status_idx
  ON public.status_incidents(status);

ALTER TABLE public.status_incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read status incidents" ON public.status_incidents;
DROP POLICY IF EXISTS "Admins can insert status incidents" ON public.status_incidents;
DROP POLICY IF EXISTS "Admins can update status incidents" ON public.status_incidents;
DROP POLICY IF EXISTS "Admins can delete status incidents" ON public.status_incidents;

CREATE POLICY "Public can read status incidents"
  ON public.status_incidents
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert status incidents"
  ON public.status_incidents
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update status incidents"
  ON public.status_incidents
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete status incidents"
  ON public.status_incidents
  FOR DELETE
  USING (public.is_admin());

DROP TRIGGER IF EXISTS status_incidents_updated_at ON public.status_incidents;
CREATE TRIGGER status_incidents_updated_at
  BEFORE UPDATE ON public.status_incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

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
      'live', site_stats.live,
      'uploaded', site_stats.uploaded,
      'scanning', site_stats.scanning,
      'provisioning', site_stats.provisioning,
      'failed', site_stats.failed,
      'scanFailed', 0,
      'lastUpdated', site_stats.last_site_update
    ),
    'incidents', public_incidents.items
  )
  FROM site_stats, public_incidents;
$$;

REVOKE ALL ON FUNCTION public.get_public_status_summary() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_status_summary() TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_status_summary() TO authenticated;
