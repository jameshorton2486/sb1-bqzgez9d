/*
  # Delete Test User Accounts
  
  1. Changes
    - Removes specified test user accounts and their associated data
    - Cascading deletion will clean up related profile data
  
  2. Security
    - Uses secure deletion through auth.users table
    - Cascading delete ensures no orphaned data
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