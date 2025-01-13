/*
  # Update user role to administrator
  
  1. Changes
    - Updates the role of specified user to 'administrator'
    
  2. Security
    - Maintains existing RLS policies
    - Administrator role grants elevated access per existing policies
*/

DO $$ 
BEGIN
  UPDATE profiles
  SET 
    role = 'administrator',
    updated_at = NOW()
  WHERE email = 'jameshorton86@yahoo.com';
END $$;