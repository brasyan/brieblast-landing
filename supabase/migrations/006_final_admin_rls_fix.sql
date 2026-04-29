-- Final fix: Use SECURITY DEFINER function to avoid recursion in RLS policies

-- Drop all problematic policies first
DROP POLICY IF EXISTS "Profile read policy" ON public.profiles;
DROP POLICY IF EXISTS "Sites read policy" ON public.sites;
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all sites" ON public.sites;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own sites" ON public.sites;

-- Drop old function if it exists
DROP FUNCTION IF EXISTS public.is_admin();

-- Create a SECURITY DEFINER function that checks admin status
-- SECURITY DEFINER runs with owner privileges, bypassing RLS
CREATE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid() AND plan = 'admin'
  );
$$;

-- Grant execute to authenticated users only
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Simple policies that use the function (no recursion because function has SECURITY DEFINER)

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.is_admin());

-- Admins can update all profiles
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Users can read their own sites
CREATE POLICY "Users can read own sites"
  ON public.sites
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all sites
CREATE POLICY "Admins can read all sites"
  ON public.sites
  FOR SELECT
  USING (public.is_admin());
