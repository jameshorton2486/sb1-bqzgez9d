/*
  # Delete Test Users

  1. Changes
    - Delete specified test user accounts
    - Clean up related profile data
    
  2. Security
    - Uses secure deletion through auth.users
*/

DO $$ 
BEGIN
  -- Delete users and their related data through auth.users
  -- This will cascade to profiles and other related tables
  DELETE FROM auth.users 
  WHERE email IN (
    'jameshorton86@yahoo.com',
    'jameshorton2486@gmail.com',
    'swiftcrt2486@gmail.com'
  );
END $$;