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

-- Create test connection function
CREATE OR REPLACE FUNCTION test_connection()
RETURNS boolean
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM 1;
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Revoke direct table access
REVOKE ALL ON profiles FROM anon, authenticated;

-- Grant access to secure view and functions
GRANT SELECT ON secure_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION get_profile TO authenticated;
GRANT EXECUTE ON FUNCTION update_profile TO authenticated;
GRANT EXECUTE ON FUNCTION test_connection TO authenticated;