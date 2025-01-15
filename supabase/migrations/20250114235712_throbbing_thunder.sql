-- Create function to properly check RLS status
CREATE OR REPLACE FUNCTION check_table_rls(p_schema text, p_table text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = p_schema 
    AND c.relname = p_table
    AND c.relrowsecurity = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to verify database access
CREATE OR REPLACE FUNCTION verify_database_access()
RETURNS boolean AS $$
BEGIN
  -- Simple check if we can query profiles
  PERFORM 1 FROM profiles LIMIT 1;
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_table_rls TO authenticated;
GRANT EXECUTE ON FUNCTION verify_database_access TO authenticated;