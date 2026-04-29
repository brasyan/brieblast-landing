-- FIRST ADMIN SETUP SCRIPT
-- Run this in your Supabase SQL Editor to set a user as admin
-- Replace 'admin@example.com' with the actual admin email address

-- Find the user by email and update their profile to admin
UPDATE public.profiles 
SET plan = 'admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'lars@lakke.be' 
  LIMIT 1
);

-- Verify the admin was set (you should see the admin user in results)
SELECT id, plan, created_at FROM public.profiles WHERE plan = 'admin';
