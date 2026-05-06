-- Repair admin access policies safely after earlier recursive policy definitions

-- Ensure admin is an allowed plan
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_plan_check
CHECK (plan IN ('none', 'smol_brie', 'thicc_brie', 'mega_brie', 'admin'));

-- Remove old admin policies if they exist
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all sites" ON public.sites;

-- Recreate helper in a safe form
DROP FUNCTION IF EXISTS public.is_admin();
CREATE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND plan = 'admin'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Admin can view any profile; users can still view their own through existing policy
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.is_admin());

-- Admin can update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin can view all sites; users keep own-sites policy
CREATE POLICY "Admins can read all sites"
  ON public.sites
  FOR SELECT
  USING (public.is_admin());
