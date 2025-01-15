-- Create secure view for profile access
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
  -- User can only see their own profile
  p.id = auth.uid()
  -- Or user is an administrator
  OR EXISTS (
    SELECT 1 FROM profiles ap 
    WHERE ap.id = auth.uid() 
    AND ap.role = 'administrator'
  );

-- Create secure function for getting profile
CREATE OR REPLACE FUNCTION get_profile(user_id uuid)
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
  RETURN QUERY
  SELECT * FROM secure_profiles WHERE id = user_id;
END;
$$;

-- Create secure function for updating profile
CREATE OR REPLACE FUNCTION update_profile(
  user_id uuid,
  full_name text,
  organization text
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
DECLARE
  result record;
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
      
    RETURN QUERY SELECT 
      result.id,
      result.email,
      result.full_name,
      result.role,
      result.organization,
      result.created_at,
      result.updated_at;
  ELSE
    RAISE EXCEPTION 'Unauthorized';
  END IF;
END;
$$;

-- Revoke direct table access
REVOKE ALL ON profiles FROM anon, authenticated;
  
-- Grant access to secure view and functions
GRANT SELECT ON secure_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION get_profile TO authenticated;
GRANT EXECUTE ON FUNCTION update_profile TO authenticated;

-- Log the security changes
INSERT INTO public.user_activity_logs (
  action_type,
  action_description,
  metadata
) VALUES (
  'security_update',
  'Implemented simplified security model',
  jsonb_build_object(
    'timestamp', CURRENT_TIMESTAMP,
    'changes', jsonb_build_array(
      'Created secure_profiles view',
      'Created get_profile function',
      'Created update_profile function',
      'Updated permissions'
    )
  ));