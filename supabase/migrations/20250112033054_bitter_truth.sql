/*
  # Delete existing users
  
  1. Changes
    - Remove all existing users and related data
    - Clean up profiles table
  
  2. Security
    - Maintain RLS policies
    - Keep table structure intact
*/

DO $$ 
BEGIN
  -- Delete from profiles first due to foreign key constraints
  DELETE FROM profiles;
  
  -- Delete from auth.users
  DELETE FROM auth.users 
  WHERE email IN (
    'jameshorton86@yahoo.com',
    'jameshorton2486@gmail.com',
    'swiftcrt2486@gmail.com'
  );
END $$;