-- Sites uploaded by users for hosting on Proxmox LXC containers
CREATE TABLE public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'uploaded'
    CHECK (status IN ('uploaded', 'provisioning', 'live', 'failed')),
  proxmox_vmid INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX sites_user_id_idx ON public.sites(user_id);

ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

-- Users can read their own sites. All writes happen server-side via the
-- service-role key from briehost-api, so no INSERT/UPDATE/DELETE policies.
CREATE POLICY "Users can read own sites"
  ON public.sites
  FOR SELECT
  USING (auth.uid() = user_id);

-- Reuse the timestamp trigger function defined in 001_create_profiles.sql
CREATE TRIGGER sites_updated_at
  BEFORE UPDATE ON public.sites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
