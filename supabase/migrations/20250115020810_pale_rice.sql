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
  p.id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles ap 
    WHERE ap.id = auth.uid() 
    AND ap.role = 'administrator'
  );

-- Create secure functions for data access
CREATE OR REPLACE FUNCTION get_profile(user_id uuid)
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  role text,
  organization text,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
  SELECT * FROM secure_profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

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
) AS $$
  UPDATE profiles 
  SET 
    full_name = COALESCE(update_profile.full_name, profiles.full_name),
    organization = COALESCE(update_profile.organization, profiles.organization),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = user_id
    AND (
      auth.uid() = user_id 
      OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'administrator'
      )
    )
  RETURNING 
    id, email, full_name, role, organization, created_at, updated_at;
$$ LANGUAGE sql SECURITY DEFINER VOLATILE;

CREATE OR REPLACE FUNCTION test_connection()
RETURNS boolean AS $$
BEGIN
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON secure_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION get_profile TO authenticated;
GRANT EXECUTE ON FUNCTION update_profile TO authenticated;
GRANT EXECUTE ON FUNCTION test_connection TO authenticated;