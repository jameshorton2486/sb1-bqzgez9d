-- Fix function syntax with proper DECLARE placement
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
  BEGIN
    -- Get values from NEW record
    v_user_id := NEW.id;
    v_email := NEW.email;
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');

    -- Insert into profiles
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

    -- Log the action
    INSERT INTO public.user_activity_logs (
      action_type,
      action_description,
      metadata
    ) VALUES (
      'user_created',
      'New user profile created',
      jsonb_build_object(
        'user_id', v_user_id,
        'email', v_email,
        'timestamp', CURRENT_TIMESTAMP
      )
    );

    RETURN NEW;
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't prevent user creation
    INSERT INTO public.user_activity_logs (
      action_type,
      action_description,
      metadata
    ) VALUES (
      'user_creation_error',
      'Failed to create user profile',
      jsonb_build_object(
        'error', SQLERRM,
        'detail', SQLSTATE,
        'user_id', v_user_id,
        'timestamp', CURRENT_TIMESTAMP
      )
    );
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Log successful function creation
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'function_created',
    'Successfully created handle_new_user function',
    jsonb_build_object(
      'timestamp', CURRENT_TIMESTAMP,
      'function', 'handle_new_user'
    )
  );
END $$;