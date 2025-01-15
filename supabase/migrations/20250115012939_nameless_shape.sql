-- Create connection check function
CREATE OR REPLACE FUNCTION check_connection()
RETURNS boolean AS $$
BEGIN
  RETURN true;
EXCEPTION 
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;