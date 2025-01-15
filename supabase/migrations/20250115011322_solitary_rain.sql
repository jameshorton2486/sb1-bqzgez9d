-- Create base tables with proper security
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  role text CHECK (role IN ('attorney', 'court_reporter', 'legal_staff', 'administrator', 'videographer', 'scopist')),
  organization text,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Create secure functions for data access
CREATE OR REPLACE FUNCTION get_profile(user_id uuid)
RETURNS SETOF profiles
SECURITY DEFINER
STABLE
LANGUAGE sql
AS $$
  SELECT * FROM profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION update_profile(
  user_id uuid,
  full_name text,
  organization text
)
RETURNS profiles
SECURITY DEFINER
VOLATILE
LANGUAGE plpgsql
AS $$
DECLARE
  result profiles;
BEGIN
  UPDATE profiles 
  SET 
    full_name = COALESCE(update_profile.full_name, profiles.full_name),
    organization = COALESCE(update_profile.organization, profiles.organization),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = user_id
  RETURNING * INTO result;
  
  RETURN result;
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

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT EXECUTE ON FUNCTION get_profile TO authenticated;
GRANT EXECUTE ON FUNCTION update_profile TO authenticated;
GRANT EXECUTE ON FUNCTION test_connection TO authenticated;