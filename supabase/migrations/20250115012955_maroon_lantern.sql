-- Create base tables
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  role text CHECK (role IN ('attorney', 'court_reporter', 'legal_staff', 'administrator', 'videographer', 'scopist')),
  organization text,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Create secure view
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

-- Create secure functions
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

CREATE OR REPLACE FUNCTION test_connection()
RETURNS boolean AS $$
BEGIN
  RETURN true;
EXCEPTION 
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON secure_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION get_profile TO authenticated;
GRANT EXECUTE ON FUNCTION test_connection TO authenticated;