-- Fix SQL syntax with proper function definitions
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