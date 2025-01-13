-- Fix RLS configuration without relying on rls_enabled column
DO $$ 
DECLARE
  v_policy_exists boolean;
BEGIN
  -- First ensure the profiles table exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    RAISE EXCEPTION 'Profiles table does not exist. Please ensure the table is created first.';
  END IF;

  -- Enable RLS directly without checking rls_enabled
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  
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
  END IF;

  -- Log successful policy creation
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'policy_update',
    'Successfully created/verified profile policies',
    jsonb_build_object(
      'timestamp', CURRENT_TIMESTAMP,
      'table', 'profiles',
      'status', 'completed'
    )
  );

EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail migration
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'policy_error',
    'Error creating/verifying profile policies',
    jsonb_build_object(
      'error', SQLERRM,
      'timestamp', CURRENT_TIMESTAMP
    )
  );
  RAISE;
END $$;