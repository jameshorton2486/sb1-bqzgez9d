DO $$ 
BEGIN
  -- Create a function to validate connection
  CREATE OR REPLACE FUNCTION check_connection()
  RETURNS boolean
  SECURITY DEFINER
  LANGUAGE plpgsql
  AS $$
  BEGIN
    -- Verify we can execute basic queries
    PERFORM 1;
    RETURN true;
  EXCEPTION WHEN OTHERS THEN
    RETURN false;
  END;
  $$;

  -- Log connection test
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'connection_test',
    'Testing database connection',
    jsonb_build_object(
      'timestamp', CURRENT_TIMESTAMP,
      'connection_valid', check_connection()
    )
  );

EXCEPTION WHEN OTHERS THEN
  -- Log error
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'connection_error',
    'Error testing connection',
    jsonb_build_object(
      'error', SQLERRM,
      'detail', SQLSTATE,
      'timestamp', CURRENT_TIMESTAMP
    )
  );
  RAISE;
END $$;