-- Fix for rls_enabled column issue
DO $$ 
BEGIN
  -- Instead of checking rls_enabled column which doesn't exist in pg_tables,
  -- we'll use pg_class and pg_namespace to check RLS status
  CREATE OR REPLACE FUNCTION check_rls_status(p_schema text, p_table text)
  RETURNS boolean AS $$
  DECLARE
    v_oid oid;
    v_rls_enabled boolean;
  BEGIN
    SELECT c.oid
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = p_schema AND c.relname = p_table
    INTO v_oid;

    SELECT relrowsecurity
    FROM pg_class
    WHERE oid = v_oid
    INTO v_rls_enabled;

    RETURN v_rls_enabled;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Update existing policies using the new function
  IF NOT check_rls_status('public', 'profiles') THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Verify and recreate policies if needed
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile"
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  -- Log the changes
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'rls_update',
    'Updated RLS configuration',
    jsonb_build_object(
      'timestamp', CURRENT_TIMESTAMP,
      'table', 'profiles',
      'status', 'completed'
    )
  );

EXCEPTION WHEN OTHERS THEN
  -- Log any errors
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'rls_error',
    'Error updating RLS configuration',
    jsonb_build_object(
      'timestamp', CURRENT_TIMESTAMP,
      'error', SQLERRM,
      'detail', SQLSTATE
    )
  );
  RAISE;
END $$;