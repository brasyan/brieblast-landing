-- Fix admin read-all policies with explicit logic instead of function call in policy

-- Drop existing admin policies (they might not be evaluating correctly)
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all sites" ON public.sites;

-- Drop existing user policies to replace them
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own sites" ON public.sites;

-- Create a single consolidated read policy for profiles:
-- Users can read: their own profile OR any profile if they're admin
CREATE POLICY "Profile read policy"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id 
    OR plan = 'admin' AND auth.uid() IN (SELECT id FROM public.profiles WHERE plan = 'admin')
  );

-- Create a single consolidated read policy for sites:
-- Users can read: their own sites OR all sites if they're admin
CREATE POLICY "Sites read policy"
  ON public.sites
  FOR SELECT
  USING (
    user_id = auth.uid() 
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE plan = 'admin')
  );

-- Update policy for profiles (users can only update their own, admins can update any)
CREATE POLICY "Profiles update policy"
  ON public.profiles
  FOR UPDATE
  USING (
    auth.uid() = id 
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE plan = 'admin')
  )
  WITH CHECK (
    auth.uid() = id 
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE plan = 'admin')
  );
