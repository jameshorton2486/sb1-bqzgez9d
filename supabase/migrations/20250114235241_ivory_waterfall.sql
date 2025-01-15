-- Create connection test function
CREATE OR REPLACE FUNCTION test_connection()
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION test_connection TO authenticated;

-- Log connection setup
INSERT INTO public.user_activity_logs (
  action_type,
  action_description,
  metadata
) VALUES (
  'connection_setup',
  'Setting up Supabase connection',
  jsonb_build_object(
    'timestamp', CURRENT_TIMESTAMP,
    'connection_test', test_connection()
  )
);