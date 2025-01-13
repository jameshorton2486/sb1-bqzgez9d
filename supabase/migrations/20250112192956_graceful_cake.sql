DO $$ 
DECLARE
  v_policy_exists boolean;
  v_rls_enabled boolean;
  v_log_id uuid;
BEGIN
  -- Start transaction logging
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'policy_update_start',
    'Starting comprehensive policy update process',
    jsonb_build_object('timestamp', CURRENT_TIMESTAMP)
  ) RETURNING id INTO v_log_id;

  -- First ensure RLS is enabled
  SELECT rls_enabled 
  FROM pg_tables 
  WHERE tablename = 'profiles' 
  INTO v_rls_enabled;

  IF NOT v_rls_enabled THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Drop existing policies safely
  DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Administrators can manage all profiles" ON public.profiles;

  -- Create comprehensive policies with error handling
  CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

  CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

  CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

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

  -- Log successful completion
  UPDATE public.user_activity_logs
  SET 
    action_description = 'Successfully updated all profile policies',
    metadata = metadata || jsonb_build_object(
      'status', 'success',
      'policies_created', jsonb_build_array(
        'Users can view their own profile',
        'Users can update their own profile',
        'Users can insert their own profile',
        'Administrators can manage all profiles'
      ),
      'completed_at', CURRENT_TIMESTAMP
    )
  WHERE id = v_log_id;

EXCEPTION WHEN OTHERS THEN
  -- Log error details
  UPDATE public.user_activity_logs
  SET 
    action_type = 'policy_error',
    action_description = 'Error during policy update process',
    metadata = metadata || jsonb_build_object(
      'error_message', SQLERRM,
      'error_detail', SQLSTATE,
      'error_hint', 'Check if table exists and user has proper permissions',
      'timestamp', CURRENT_TIMESTAMP
    )
  WHERE id = v_log_id;
  
  RAISE EXCEPTION 'Policy update failed: %. Please check user_activity_logs for details.', SQLERRM;
END $$;