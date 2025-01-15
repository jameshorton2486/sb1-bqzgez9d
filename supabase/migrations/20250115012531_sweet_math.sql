-- Create function to check RLS status
CREATE OR REPLACE FUNCTION check_rls_status(p_schema text, p_table text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = p_schema 
    AND c.relname = p_table
    AND c.relrowsecurity = true
  );
END;
$$;

-- Enable RLS and create policies
DO $$
BEGIN
  -- Enable RLS on profiles table
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

  -- Create policy for viewing own profile
  DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
  CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

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