-- Create function to check RLS status
CREATE OR REPLACE FUNCTION check_rls_status(p_schema text, p_table text)
RETURNS boolean
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
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
$$;

-- Enable RLS on profiles table if not enabled
DO $$
BEGIN
  IF NOT check_rls_status('public', 'profiles') THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create or update profile policies
DO $$
BEGIN
  -- Drop existing policy if it exists
  DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
  
  -- Create new policy
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
END $$;