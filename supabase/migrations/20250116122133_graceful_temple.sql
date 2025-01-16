-- Create function to verify database access
CREATE OR REPLACE FUNCTION verify_database_access()
RETURNS boolean
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Simple check if we can query profiles
  PERFORM 1 FROM profiles LIMIT 1;
  RETURN true;
EXCEPTION 
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Log the change
INSERT INTO public.user_activity_logs (
  action_type,
  action_description,
  metadata
) VALUES (
  'function_created',
  'Created database verification function',
  jsonb_build_object(
    'timestamp', CURRENT_TIMESTAMP,
    'function', 'verify_database_access',
    'status', 'success'
  )
);