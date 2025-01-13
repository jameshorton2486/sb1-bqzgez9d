/*
  # Add RLS Enabled Column
  
  1. Changes
    - Add rls_enabled column to profiles table
    - Add rls_enabled column to depositions table
    - Add rls_enabled column to transcripts table
    - Add rls_enabled column to exhibits table
    
  2. Security
    - Set default value to true for existing rows
    - Maintain existing RLS policies
*/

DO $$ 
BEGIN
  -- Add rls_enabled column to profiles if it doesn't exist
  ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS rls_enabled BOOLEAN DEFAULT true;

  -- Add rls_enabled column to depositions if it doesn't exist
  ALTER TABLE public.depositions 
    ADD COLUMN IF NOT EXISTS rls_enabled BOOLEAN DEFAULT true;

  -- Add rls_enabled column to transcripts if it doesn't exist
  ALTER TABLE public.transcripts 
    ADD COLUMN IF NOT EXISTS rls_enabled BOOLEAN DEFAULT true;

  -- Add rls_enabled column to exhibits if it doesn't exist
  ALTER TABLE public.exhibits 
    ADD COLUMN IF NOT EXISTS rls_enabled BOOLEAN DEFAULT true;

  -- Log successful column addition
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'schema_update',
    'Added rls_enabled columns to tables',
    jsonb_build_object(
      'timestamp', CURRENT_TIMESTAMP,
      'tables_modified', jsonb_build_array(
        'profiles',
        'depositions',
        'transcripts',
        'exhibits'
      )
    )
  );

EXCEPTION WHEN OTHERS THEN
  -- Log error details
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'schema_error',
    'Error adding rls_enabled columns',
    jsonb_build_object(
      'error', SQLERRM,
      'detail', SQLSTATE,
      'timestamp', CURRENT_TIMESTAMP
    )
  );
  RAISE;
END $$;