-- Add 'admin' to the plan type check constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT profiles_plan_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_plan_check 
CHECK (plan IN ('none', 'smol_brie', 'thicc_brie', 'mega_brie', 'admin'));

-- Create a helper function to check if current user is admin (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND plan = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Allow admins to view all profiles (not just their own)
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id OR public.is_admin()
  );

-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (public.is_admin());

-- Allow admins to view all sites (not just their own)
CREATE POLICY "Admins can read all sites"
  ON public.sites
  FOR SELECT
  USING (
    user_id = auth.uid() OR public.is_admin()
  );
