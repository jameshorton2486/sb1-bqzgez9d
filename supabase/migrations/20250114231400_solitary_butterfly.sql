-- Remove RLS and implement view-based security
DO $$ 
DECLARE
  v_log_id uuid;
BEGIN
  -- Start logging
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'security_update',
    'Removing RLS and implementing view-based security',
    jsonb_build_object(
      'timestamp', CURRENT_TIMESTAMP,
      'initiated_by', auth.uid()
    )
  ) RETURNING id INTO v_log_id;

  -- Disable RLS on all tables
  ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.depositions DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.transcripts DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.exhibits DISABLE ROW LEVEL SECURITY;

  -- Create secure views
  CREATE OR REPLACE VIEW secure_profiles AS
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.organization,
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE 
    p.id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles ap 
      WHERE ap.id = auth.uid() 
      AND ap.role = 'administrator'
    );

  CREATE OR REPLACE VIEW secure_depositions AS
  SELECT d.*
  FROM depositions d
  WHERE 
    d.created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('administrator', 'court_reporter')
    );

  CREATE OR REPLACE VIEW secure_transcripts AS
  SELECT t.*
  FROM transcripts t
  JOIN depositions d ON d.id = t.deposition_id
  WHERE 
    d.created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('administrator', 'court_reporter')
    );

  CREATE OR REPLACE VIEW secure_exhibits AS
  SELECT e.*
  FROM exhibits e
  JOIN depositions d ON d.id = e.deposition_id
  WHERE 
    d.created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('administrator', 'court_reporter')
    );

  -- Create secure functions for data manipulation
  CREATE OR REPLACE FUNCTION update_profile(
    user_id uuid,
    full_name text,
    organization text
  )
  RETURNS secure_profiles
  SECURITY DEFINER
  LANGUAGE plpgsql
  AS $$
  DECLARE
    result secure_profiles;
  BEGIN
    IF auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'administrator'
    ) THEN
      UPDATE profiles 
      SET 
        full_name = COALESCE(update_profile.full_name, profiles.full_name),
        organization = COALESCE(update_profile.organization, profiles.organization),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = user_id
      RETURNING * INTO result;
      
      RETURN result;
    ELSE
      RAISE EXCEPTION 'Unauthorized';
    END IF;
  END;
  $$;

  -- Revoke direct table access
  REVOKE ALL ON profiles FROM anon, authenticated;
  REVOKE ALL ON depositions FROM anon, authenticated;
  REVOKE ALL ON transcripts FROM anon, authenticated;
  REVOKE ALL ON exhibits FROM anon, authenticated;
  
  -- Grant access to secure views
  GRANT SELECT ON secure_profiles TO authenticated;
  GRANT SELECT ON secure_depositions TO authenticated;
  GRANT SELECT ON secure_transcripts TO authenticated;
  GRANT SELECT ON secure_exhibits TO authenticated;
  
  -- Grant execute on functions
  GRANT EXECUTE ON FUNCTION update_profile TO authenticated;

  -- Log successful completion
  UPDATE public.user_activity_logs
  SET 
    action_description = 'Successfully removed RLS and implemented view-based security',
    metadata = metadata || jsonb_build_object(
      'completed_at', CURRENT_TIMESTAMP,
      'status', 'success',
      'changes', jsonb_build_array(
        'Disabled RLS on all tables',
        'Created secure views',
        'Created secure functions',
        'Updated permissions'
      )
    )
  WHERE id = v_log_id;

EXCEPTION WHEN OTHERS THEN
  -- Log failure
  UPDATE public.user_activity_logs
  SET 
    action_description = 'Failed to implement view-based security',
    metadata = metadata || jsonb_build_object(
      'error', SQLERRM,
      'detail', SQLSTATE,
      'failed_at', CURRENT_TIMESTAMP
    )
  WHERE id = v_log_id;
  RAISE;
END $$;