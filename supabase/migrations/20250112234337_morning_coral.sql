-- Comprehensive policy management with proper error handling
DO $$ 
DECLARE
  v_policy_exists boolean;
  v_rls_enabled boolean;
BEGIN
  -- First ensure the profiles table exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    RAISE EXCEPTION 'Profiles table does not exist. Please ensure the table is created first.';
  END IF;

  -- Enable RLS if not already enabled
  SELECT rls_enabled 
  FROM pg_tables 
  WHERE schemaname = 'public' AND tablename = 'profiles' 
  INTO v_rls_enabled;

  IF NOT v_rls_enabled THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled Row Level Security on profiles table';
  END IF;

  -- Safely create policies
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'Users can view their own profile'
  ) INTO v_policy_exists;

  IF NOT v_policy_exists THEN
    CREATE POLICY "Users can view their own profile"
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
    RAISE NOTICE 'Created view policy for profiles';
  END IF;

  -- Create update policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
      ON public.profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);
    RAISE NOTICE 'Created update policy for profiles';
  END IF;

  -- Create insert policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
      ON public.profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
    RAISE NOTICE 'Created insert policy for profiles';
  END IF;

  -- Create admin policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'Administrators can manage all profiles'
  ) THEN
    CREATE POLICY "Administrators can manage all profiles"
      ON public.profiles
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() 
          AND role = 'administrator'
        )
      );
    RAISE NOTICE 'Created administrator policy for profiles';
  END IF;

EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail migration
  RAISE WARNING 'Policy creation encountered an error: %', SQLERRM;
  -- Re-raise the exception to ensure the migration fails properly
  RAISE;
END $$;