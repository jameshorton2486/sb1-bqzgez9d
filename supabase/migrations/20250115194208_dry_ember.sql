-- Fix function syntax with proper structure
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
BEGIN
  RETURN QUERY
  SELECT p.id, p.email, p.full_name, p.role, p.organization, p.created_at, p.updated_at
  FROM profiles p
  WHERE p.id = user_id
    AND (
      auth.uid() = user_id 
      OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'administrator'
      )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON secure_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION get_profile TO authenticated;