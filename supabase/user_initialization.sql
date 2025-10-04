-- Auto-initialization for new users
-- Creates profile and free subscription automatically when user signs up

-- Function to initialize new user data (profile + subscription)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, email_verified, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email_confirmed_at IS NOT NULL,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Create free subscription
  INSERT INTO public.subscriptions (
    user_id,
    status,
    plan,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    'active',
    'free',
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING; -- If subscriptions has unique constraint on user_id

  RETURN NEW;
END;
$$;

-- Revoke public access
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update email_verified when user confirms email
CREATE OR REPLACE FUNCTION public.handle_user_email_verified()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only update if email was just confirmed
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE public.profiles
    SET 
      email_verified = TRUE,
      email_verified_at = NEW.email_confirmed_at,
      updated_at = NOW()
    WHERE user_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_user_email_verified() FROM PUBLIC;

DROP TRIGGER IF EXISTS on_auth_user_email_verified ON auth.users;

CREATE TRIGGER on_auth_user_email_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_email_verified();

-- Ensure subscriptions table has proper constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'subscriptions'
      AND constraint_type = 'UNIQUE'
      AND constraint_name LIKE '%user_id%'
  ) THEN
    ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END$$;

-- Verification query: Check triggers are installed
DO $$
BEGIN
  RAISE NOTICE 'Checking triggers...';
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created' 
      AND tgrelid = 'auth.users'::regclass
  ) THEN
    RAISE WARNING 'Trigger on_auth_user_created NOT found!';
  ELSE
    RAISE NOTICE '✓ on_auth_user_created trigger installed';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_email_verified' 
      AND tgrelid = 'auth.users'::regclass
  ) THEN
    RAISE WARNING 'Trigger on_auth_user_email_verified NOT found!';
  ELSE
    RAISE NOTICE '✓ on_auth_user_email_verified trigger installed';
  END IF;
END$$;
