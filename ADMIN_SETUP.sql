-- FIRST ADMIN SETUP SCRIPT
-- Run this in your Supabase SQL Editor to set a user as admin
-- Replace the email in both places below

-- Ensure profile row exists for this user
INSERT INTO public.profiles (id, plan)
SELECT u.id, 'none'
FROM auth.users u
WHERE u.email = 'lars@lakke.be'
ON CONFLICT (id) DO NOTHING;

-- Set selected user to admin
UPDATE public.profiles p
SET plan = 'admin', updated_at = now()
FROM auth.users u
WHERE p.id = u.id
  AND u.email = 'lars@lakke.be';

-- Verify this specific user
SELECT u.email, p.id, p.plan, p.created_at, p.updated_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'lars@lakke.be';
