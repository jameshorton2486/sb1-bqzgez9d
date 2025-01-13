/*
  # Fix profile validation
  
  1. Changes
    - Remove incorrect profile completeness policy
    - Add proper validation trigger
    
  2. Security
    - Maintain data integrity through triggers
    - Ensure profile names are not empty
*/

-- Drop the incorrect policy if it exists
DROP POLICY IF EXISTS "enforce_profile_completeness" ON profiles;

-- Create a proper validation trigger
CREATE OR REPLACE FUNCTION check_profile_completeness()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.full_name IS NULL OR NEW.full_name = '') THEN
    RAISE EXCEPTION 'Profile name cannot be empty';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS enforce_profile_completeness ON profiles;

-- Create the trigger
CREATE TRIGGER enforce_profile_completeness
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_profile_completeness();