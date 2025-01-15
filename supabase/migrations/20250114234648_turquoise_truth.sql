-- Final cleanup of security model and complete removal of rls_enabled
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
    'security_cleanup_final',
    'Final cleanup of security model and rls_enabled references',
    jsonb_build_object(
      'timestamp', CURRENT_TIMESTAMP,
      'initiated_by', auth.uid()
    )
  ) RETURNING id INTO v_log_id;

  -- Create a secure function-based access layer
  CREATE OR REPLACE FUNCTION get_user_role(p_user_id uuid)
  RETURNS text
  SECURITY DEFINER
  STABLE
  LANGUAGE plpgsql
  AS $$
  DECLARE
    v_role text;
  BEGIN
    SELECT role INTO v_role
    FROM profiles
    WHERE id = p_user_id;
    RETURN v_role;
  END;
  $$;

  -- Create a comprehensive permission check function
  CREATE OR REPLACE FUNCTION check_permission(
    p_action text,
    p_resource text,
    p_resource_id uuid DEFAULT NULL
  )
  RETURNS boolean
  SECURITY DEFINER
  STABLE
  LANGUAGE plpgsql
  AS $$
  DECLARE
    v_user_role text;
  BEGIN
    -- Get user's role
    SELECT get_user_role(auth.uid()) INTO v_user_role;
    
    -- Administrator has full access
    IF v_user_role = 'administrator' THEN
      RETURN true;
    END IF;

    -- Check specific permissions
    RETURN CASE
      -- Profile access
      WHEN p_resource = 'profile' AND p_action = 'read' THEN
        auth.uid() = p_resource_id
      WHEN p_resource = 'profile' AND p_action = 'update' THEN
        auth.uid() = p_resource_id
        
      -- Deposition access
      WHEN p_resource = 'deposition' AND p_action IN ('read', 'update') THEN
        v_user_role IN ('court_reporter', 'attorney') OR
        EXISTS (
          SELECT 1 FROM depositions
          WHERE id = p_resource_id AND created_by = auth.uid()
        )
        
      -- Transcript access
      WHEN p_resource = 'transcript' AND p_action IN ('read', 'update') THEN
        v_user_role = 'court_reporter' OR
        EXISTS (
          SELECT 1 FROM transcripts t
          JOIN depositions d ON d.id = t.deposition_id
          WHERE t.id = p_resource_id AND d.created_by = auth.uid()
        )
        
      ELSE false
    END;
  END;
  $$;

  -- Create secure access functions
  CREATE OR REPLACE FUNCTION get_profile(p_user_id uuid)
  RETURNS TABLE (
    id uuid,
    email text,
    full_name text,
    role text,
    organization text,
    created_at timestamptz,
    updated_at timestamptz
  )
  SECURITY DEFINER
  STABLE
  LANGUAGE plpgsql
  AS $$
  BEGIN
    IF check_permission('read', 'profile', p_user_id) THEN
      RETURN QUERY
      SELECT p.id, p.email, p.full_name, p.role, p.organization, p.created_at, p.updated_at
      FROM profiles p
      WHERE p.id = p_user_id;
    ELSE
      RAISE EXCEPTION 'Unauthorized profile access';
    END IF;
  END;
  $$;

  CREATE OR REPLACE FUNCTION update_profile(
    p_user_id uuid,
    p_full_name text,
    p_organization text
  )
  RETURNS TABLE (
    id uuid,
    email text,
    full_name text,
    role text,
    organization text,
    created_at timestamptz,
    updated_at timestamptz
  )
  SECURITY DEFINER
  VOLATILE
  LANGUAGE plpgsql
  AS $$
  BEGIN
    IF check_permission('update', 'profile', p_user_id) THEN
      UPDATE profiles 
      SET 
        full_name = COALESCE(p_full_name, full_name),
        organization = COALESCE(p_organization, organization),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = p_user_id
      RETURNING id, email, full_name, role, organization, created_at, updated_at;
    ELSE
      RAISE EXCEPTION 'Unauthorized profile update';
    END IF;
  END;
  $$;

  -- Create audit trigger for security events
  CREATE OR REPLACE FUNCTION log_security_event()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  BEGIN
    INSERT INTO user_activity_logs (
      action_type,
      action_description,
      user_id,
      metadata
    ) VALUES (
      'security_event',
      format('Security event on %s: %s', TG_TABLE_NAME, TG_OP),
      auth.uid(),
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'timestamp', CURRENT_TIMESTAMP
      )
    );
    RETURN COALESCE(NEW, OLD);
  END;
  $$;

  -- Create triggers for security logging
  DROP TRIGGER IF EXISTS log_profile_security ON profiles;
  CREATE TRIGGER log_profile_security
    AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION log_security_event();

  -- Grant permissions to authenticated users
  GRANT EXECUTE ON FUNCTION get_user_role TO authenticated;
  GRANT EXECUTE ON FUNCTION check_permission TO authenticated;
  GRANT EXECUTE ON FUNCTION get_profile TO authenticated;
  GRANT EXECUTE ON FUNCTION update_profile TO authenticated;

  -- Log successful completion
  UPDATE public.user_activity_logs
  SET 
    action_description = 'Successfully implemented clean security model',
    metadata = metadata || jsonb_build_object(
      'completed_at', CURRENT_TIMESTAMP,
      'status', 'success',
      'changes', jsonb_build_array(
        'Created permission system',
        'Implemented secure access functions',
        'Added security audit logging',
        'Updated permissions'
      )
    )
  WHERE id = v_log_id;

EXCEPTION WHEN OTHERS THEN
  -- Log failure
  UPDATE public.user_activity_logs
  SET 
    action_description = 'Failed to implement clean security model',
    metadata = metadata || jsonb_build_object(
      'error', SQLERRM,
      'detail', SQLSTATE,
      'failed_at', CURRENT_TIMESTAMP
    )
  WHERE id = v_log_id;
  RAISE;
END $$;