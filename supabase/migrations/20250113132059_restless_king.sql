-- Fix RLS configuration without using rls_enabled column
DO $$ 
DECLARE
  v_table_exists boolean;
BEGIN
  -- First verify if the profiles table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) INTO v_table_exists;

  IF v_table_exists THEN
    -- Enable RLS directly without checking rls_enabled column
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
    -- Recreate policies to ensure they don't reference rls_enabled
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
    CREATE POLICY "Users can view their own profile"
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);

    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    CREATE POLICY "Users can update their own profile"
      ON public.profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);

    -- Log successful update
    INSERT INTO public.user_activity_logs (
      action_type,
      action_description,
      metadata
    ) VALUES (
      'rls_update',
      'Successfully updated RLS configuration',
      jsonb_build_object(
        'timestamp', CURRENT_TIMESTAMP,
        'table', 'profiles',
        'status', 'completed'
      )
    );
  END IF;

EXCEPTION WHEN OTHERS THEN
  -- Log error details
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'rls_error',
    'Error updating RLS configuration',
    jsonb_build_object(
      'error', SQLERRM,
      'detail', SQLSTATE,
      'timestamp', CURRENT_TIMESTAMP
    )
  );
  RAISE;
END $$;