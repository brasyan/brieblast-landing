-- Require MFA for accounts created after this migration while leaving
-- existing accounts opted out until they enable it in settings.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS two_factor_required BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, plan, email, display_name, two_factor_required)
  VALUES (
    NEW.id,
    'none',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
