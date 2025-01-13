/*
  # Update Profile Roles

  1. Changes
    - Remove 'witness' role from profiles table
    - Add 'videographer' and 'scopist' roles
    
  2. Security
    - Updates the role check constraint to enforce valid roles
    - Maintains existing RLS policies
*/

DO $$ 
BEGIN
  -- Update the role check constraint
  ALTER TABLE public.profiles 
    DROP CONSTRAINT IF EXISTS profiles_role_check;
    
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('attorney', 'court_reporter', 'legal_staff', 'administrator', 'videographer', 'scopist'));
END $$;