-- Improve function definitions with proper error handling
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
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be null';
  END IF;

  IF p_required_roles IS NULL OR array_length(p_required_roles, 1) = 0 THEN
    RAISE EXCEPTION 'Required roles cannot be null or empty';
  END IF;

  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND (
      id = p_user_id 
      OR role = ANY(p_required_roles)
    )
  );
EXCEPTION WHEN OTHERS THEN
  -- Log error and re-raise
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'access_check_error',
    'Error checking user access',
    jsonb_build_object(
      'error', SQLERRM,
      'detail', SQLSTATE,
      'user_id', p_user_id,
      'roles', p_required_roles,
      'timestamp', CURRENT_TIMESTAMP
    )
  );
  RAISE;
END;
$$;

-- Improve update_user_profile with better error handling and RETURN QUERY
CREATE OR REPLACE FUNCTION update_user_profile(
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
  -- Input validation
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be null';
  END IF;

  -- Check access
  IF NOT check_user_access(p_user_id, ARRAY['administrator']) THEN
    RAISE EXCEPTION 'Unauthorized profile update';
  END IF;

  -- Perform update and return results
  RETURN QUERY
    UPDATE profiles 
    SET 
      full_name = COALESCE(p_full_name, full_name),
      organization = COALESCE(p_organization, organization),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = p_user_id
    RETURNING id, email, full_name, role, organization, created_at, updated_at;

  -- Check if any rows were updated
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for ID: %', p_user_id;
  END IF;

EXCEPTION WHEN OTHERS THEN
  -- Log error and re-raise
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'profile_update_error',
    'Error updating user profile',
    jsonb_build_object(
      'error', SQLERRM,
      'detail', SQLSTATE,
      'user_id', p_user_id,
      'timestamp', CURRENT_TIMESTAMP
    )
  );
  RAISE;
END;
$$;

-- Log migration completion
INSERT INTO public.user_activity_logs (
  action_type,
  action_description,
  metadata
) VALUES (
  'migration_complete',
  'Successfully updated function definitions',
  jsonb_build_object(
    'timestamp', CURRENT_TIMESTAMP,
    'changes', jsonb_build_array(
      'Improved error handling in check_user_access',
      'Added input validation to update_user_profile',
      'Fixed RETURN QUERY syntax',
      'Added detailed error logging'
    )
  )
);