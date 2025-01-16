-- Create or replace function with proper syntax and error handling
DO $$ 
DECLARE
  v_exists boolean;
BEGIN
  -- Create or replace the function
  CREATE OR REPLACE FUNCTION handle_new_user()
  RETURNS TRIGGER AS $$
  DECLARE
    v_user_id uuid;
    v_email text;
    v_full_name text;
    v_log_id uuid;
  BEGIN
    -- Start transaction logging
    INSERT INTO public.user_activity_logs (
      action_type,
      action_description,
      metadata
    ) VALUES (
      'user_creation_start',
      'Starting new user creation process',
      jsonb_build_object(
        'timestamp', CURRENT_TIMESTAMP,
        'trigger_name', TG_NAME,
        'table_name', TG_TABLE_NAME
      )
    ) RETURNING id INTO v_log_id;

    -- Get values from NEW record
    v_user_id := NEW.id;
    v_email := NEW.email;
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');

    -- Insert into profiles with validation
    IF v_email IS NULL THEN
      RAISE EXCEPTION 'Email cannot be null';
    END IF;

    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
      v_email,
      v_full_name,
      NOW(),
      NOW()
    );

    -- Update log with success
    UPDATE public.user_activity_logs
    SET 
      action_description = 'Successfully created new user profile',
      metadata = metadata || jsonb_build_object(
        'completed_at', CURRENT_TIMESTAMP,
        'user_id', v_user_id,
        'email', v_email,
        'status', 'success'
      )
    WHERE id = v_log_id;

    RETURN NEW;

  EXCEPTION WHEN OTHERS THEN
    -- Update log with error details
    UPDATE public.user_activity_logs
    SET 
      action_type = 'user_creation_error',
      action_description = 'Failed to create user profile',
      metadata = metadata || jsonb_build_object(
        'error', SQLERRM,
        'detail', SQLSTATE,
        'user_id', v_user_id,
        'failed_at', CURRENT_TIMESTAMP
      )
    WHERE id = v_log_id;

    -- Re-raise the exception with more context
    RAISE EXCEPTION 'User creation failed: %. Check user_activity_logs for details.', SQLERRM;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Drop existing trigger if it exists
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

  -- Create new trigger
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

  -- Log successful function and trigger creation
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'function_created',
    'Successfully created handle_new_user function and trigger',
    jsonb_build_object(
      'timestamp', CURRENT_TIMESTAMP,
      'function', 'handle_new_user',
      'trigger', 'on_auth_user_created'
    )
  );
END $$;