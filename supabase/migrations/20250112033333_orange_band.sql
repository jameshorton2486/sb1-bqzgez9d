/*
  # Profile Validation Enhancement
  
  1. Changes
    - Add comprehensive profile validation trigger
    - Add automatic timestamp updates
    - Remove any conflicting policies/triggers
    
  2. Security
    - Validate required profile fields
    - Maintain data integrity
    - Ensure proper timestamp management
*/

-- Create a comprehensive profile validation function
CREATE OR REPLACE FUNCTION validate_profile_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate full name
  IF NEW.full_name IS NULL OR TRIM(NEW.full_name) = '' THEN
    RAISE EXCEPTION 'Full name cannot be empty';
  END IF;

  -- Validate email format
  IF NEW.email IS NOT NULL AND NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;

  -- Validate role
  IF NEW.role IS NOT NULL AND NEW.role NOT IN (
    'attorney', 'court_reporter', 'legal_staff', 
    'administrator', 'videographer', 'scopist'
  ) THEN
    RAISE EXCEPTION 'Invalid role specified';
  END IF;

  -- Set timestamps
  IF TG_OP = 'INSERT' THEN
    NEW.created_at = CURRENT_TIMESTAMP;
  END IF;
  NEW.updated_at = CURRENT_TIMESTAMP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing validation triggers if they exist
DROP TRIGGER IF EXISTS validate_profile_data ON profiles;
DROP TRIGGER IF EXISTS enforce_profile_completeness ON profiles;

-- Create new validation trigger
CREATE TRIGGER validate_profile_data
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_profile_data();