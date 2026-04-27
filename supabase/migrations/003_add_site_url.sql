-- Add a url column so the backend can write the live site address after
-- the LXC container has been provisioned and a subdomain assigned.
ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS url TEXT;
