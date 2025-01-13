/*
  # Safe Policy Implementation with Error Handling
  
  1. Changes
    - Add existence checks for policies
    - Implement comprehensive error handling
    - Add activity logging
    - Ensure atomic operations
    
  2. Security
    - Maintain existing RLS
    - Preserve security model
    - Add proper logging
*/

DO $$ 
DECLARE
  v_policy_exists boolean;
  v_log_id uuid;
BEGIN
  -- Start transaction logging
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'policy_update_start',
    'Starting policy update process',
    jsonb_build_object('timestamp', CURRENT_TIMESTAMP)
  ) RETURNING id INTO v_log_id;

  -- Check if policy exists
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can view their own profile'
  ) INTO v_policy_exists;

  -- Only create policy if it doesn't exist
  IF NOT v_policy_exists THEN
    CREATE POLICY "Users can view their own profile"
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
      
    -- Log successful creation
    UPDATE public.user_activity_logs
    SET 
      action_description = 'Successfully created profile policy',
      metadata = metadata || jsonb_build_object(
        'status', 'success',
        'policy_name', 'Users can view their own profile',
        'created_at', CURRENT_TIMESTAMP
      )
    WHERE id = v_log_id;
  ELSE
    -- Log skip message
    UPDATE public.user_activity_logs
    SET 
      action_description = 'Policy already exists, skipped creation',
      metadata = metadata || jsonb_build_object(
        'status', 'skipped',
        'reason', 'policy_exists',
        'policy_name', 'Users can view their own profile'
      )
    WHERE id = v_log_id;
  END IF;

EXCEPTION WHEN OTHERS THEN
  -- Log error details
  UPDATE public.user_activity_logs
  SET 
    action_type = 'policy_error',
    action_description = 'Error during policy creation',
    metadata = metadata || jsonb_build_object(
      'error_message', SQLERRM,
      'error_detail', SQLSTATE,
      'timestamp', CURRENT_TIMESTAMP
    )
  WHERE id = v_log_id;
  
  RAISE EXCEPTION 'Policy creation failed: %', SQLERRM;
END $$;