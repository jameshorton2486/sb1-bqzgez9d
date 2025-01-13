-- Fix RLS configuration without relying on rls_enabled column
DO $$ 
DECLARE
  v_policy_exists boolean;
  v_log_id uuid;
  v_policies_to_check text[] := ARRAY[
    'Users can view their own profile',
    'Users can update their own profile',
    'Users can insert their own profile',
    'Administrators can manage all profiles'
  ];
  v_policy text;
BEGIN
  -- Start transaction logging
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'policy_update_start',
    'Starting policy verification process',
    jsonb_build_object('timestamp', CURRENT_TIMESTAMP)
  ) RETURNING id INTO v_log_id;

  -- Enable RLS directly
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
  UPDATE public.user_activity_logs
  SET metadata = metadata || jsonb_build_object(
    'rls_status', 'enabled',
    'enabled_at', CURRENT_TIMESTAMP
  )
  WHERE id = v_log_id;

  -- Check and fix each policy
  FOREACH v_policy IN ARRAY v_policies_to_check
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = v_policy
    ) INTO v_policy_exists;

    IF NOT v_policy_exists THEN
      -- Create missing policy based on type
      CASE v_policy
        WHEN 'Users can view their own profile' THEN
          CREATE POLICY "Users can view their own profile"
            ON public.profiles
            FOR SELECT
            TO authenticated
            USING (auth.uid() = id);
            
        WHEN 'Users can update their own profile' THEN
          CREATE POLICY "Users can update their own profile"
            ON public.profiles
            FOR UPDATE
            TO authenticated
            USING (auth.uid() = id);
            
        WHEN 'Users can insert their own profile' THEN
          CREATE POLICY "Users can insert their own profile"
            ON public.profiles
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = id);
            
        WHEN 'Administrators can manage all profiles' THEN
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
      END CASE;

      -- Log policy creation
      UPDATE public.user_activity_logs
      SET metadata = metadata || jsonb_build_object(
        v_policy, jsonb_build_object(
          'status', 'created',
          'created_at', CURRENT_TIMESTAMP
        )
      )
      WHERE id = v_log_id;
    END IF;
  END LOOP;

  -- Log successful completion
  UPDATE public.user_activity_logs
  SET 
    action_description = 'Successfully verified and fixed all profile policies',
    metadata = metadata || jsonb_build_object(
      'status', 'success',
      'completed_at', CURRENT_TIMESTAMP
    )
  WHERE id = v_log_id;

EXCEPTION WHEN OTHERS THEN
  -- Log error details
  UPDATE public.user_activity_logs
  SET 
    action_type = 'policy_error',
    action_description = 'Error during policy verification process',
    metadata = metadata || jsonb_build_object(
      'error_message', SQLERRM,
      'error_detail', SQLSTATE,
      'failed_at', CURRENT_TIMESTAMP
    )
  WHERE id = v_log_id;
  
  RAISE;
END $$;