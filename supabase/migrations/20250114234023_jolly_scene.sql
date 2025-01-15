-- Clean up security model and remove rls_enabled references
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
    'security_cleanup',
    'Removing rls_enabled references and cleaning up security model',
    jsonb_build_object(
      'timestamp', CURRENT_TIMESTAMP,
      'initiated_by', auth.uid()
    )
  ) RETURNING id INTO v_log_id;

  -- Drop rls_enabled columns if they exist
  DO $inner$ 
  BEGIN
    ALTER TABLE public.profiles DROP COLUMN IF EXISTS rls_enabled;
    ALTER TABLE public.depositions DROP COLUMN IF EXISTS rls_enabled;
    ALTER TABLE public.transcripts DROP COLUMN IF EXISTS rls_enabled;
    ALTER TABLE public.exhibits DROP COLUMN IF EXISTS rls_enabled;
  EXCEPTION WHEN undefined_column THEN
    NULL;
  END $inner$;

  -- Update secure views to remove any rls_enabled references
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

  -- Create function to check user permissions
  CREATE OR REPLACE FUNCTION check_user_access(
    p_user_id uuid,
    p_required_roles text[]
  )
  RETURNS boolean
  SECURITY DEFINER
  STABLE
  LANGUAGE plpgsql
  AS $$
  BEGIN
    RETURN EXISTS (
      SELECT 1 
      FROM profiles 
      WHERE id = auth.uid() 
      AND (
        id = p_user_id 
        OR role = ANY(p_required_roles)
      )
    );
  END;
  $$;

  -- Create secure CRUD functions that don't rely on RLS
  CREATE OR REPLACE FUNCTION update_user_profile(
    p_user_id uuid,
    p_full_name text,
    p_organization text
  )
  RETURNS secure_profiles
  SECURITY DEFINER
  VOLATILE
  LANGUAGE plpgsql
  AS $$
  DECLARE
    v_result secure_profiles;
  BEGIN
    IF check_user_access(p_user_id, ARRAY['administrator']) THEN
      UPDATE profiles 
      SET 
        full_name = COALESCE(p_full_name, full_name),
        organization = COALESCE(p_organization, organization),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = p_user_id
      RETURNING * INTO v_result;
      
      RETURN v_result;
    ELSE
      RAISE EXCEPTION 'Unauthorized profile update';
    END IF;
  END;
  $$;

  -- Grant permissions to new function
  GRANT EXECUTE ON FUNCTION check_user_access TO authenticated;
  GRANT EXECUTE ON FUNCTION update_user_profile TO authenticated;

  -- Log successful completion
  UPDATE public.user_activity_logs
  SET 
    action_description = 'Successfully cleaned up security model',
    metadata = metadata || jsonb_build_object(
      'completed_at', CURRENT_TIMESTAMP,
      'status', 'success',
      'changes', jsonb_build_array(
        'Removed rls_enabled columns',
        'Updated secure views',
        'Added permission check function',
        'Created secure CRUD functions'
      )
    )
  WHERE id = v_log_id;

EXCEPTION WHEN OTHERS THEN
  -- Log failure
  UPDATE public.user_activity_logs
  SET 
    action_description = 'Failed to clean up security model',
    metadata = metadata || jsonb_build_object(
      'error', SQLERRM,
      'detail', SQLSTATE,
      'failed_at', CURRENT_TIMESTAMP
    )
  WHERE id = v_log_id;
  RAISE;
END $$;