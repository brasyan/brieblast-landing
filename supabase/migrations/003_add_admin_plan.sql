-- Add 'admin' to the plan type check constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT profiles_plan_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_plan_check 
CHECK (plan IN ('none', 'smol_brie', 'thicc_brie', 'mega_brie', 'admin'));

-- Allow admins to view all profiles (not just their own)
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.plan = 'admin'
    )
  );

-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.plan = 'admin'
    )
  );

-- Allow admins to view all sites (not just their own)
CREATE POLICY "Admins can read all sites"
  ON public.sites
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.plan = 'admin'
    )
  );
