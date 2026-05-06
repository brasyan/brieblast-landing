-- Add email and display_name to profiles for admin visibility

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Update the handle_new_user function to capture email from auth.users
-- Note: auth.users provides email as part of the trigger context
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, plan, email, display_name)
  VALUES (
    NEW.id, 
    'none',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- For existing users without email, backfill from auth.users if possible
-- This requires a manual query in your backend or Supabase SQL editor:
-- UPDATE profiles SET email = u.email FROM auth.users u WHERE profiles.id = u.id AND profiles.email IS NULL;
