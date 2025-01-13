/*
  # Safe Policy Implementation

  1. Changes
    - Add safe policy creation with existence checks
    - Implement proper error handling
    - Add logging for policy operations
    - Ensure atomic operations

  2. Security
    - Maintain RLS enforcement
    - Preserve existing security model
    - Add proper access controls
*/

DO $$ 
BEGIN
  -- First ensure RLS is enabled
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can view their own profile'
  ) THEN
    DROP POLICY "Users can view their own profile" ON public.profiles;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update their own profile'
  ) THEN
    DROP POLICY "Users can update their own profile" ON public.profiles;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can insert their own profile'
  ) THEN
    DROP POLICY "Users can insert their own profile" ON public.profiles;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Administrators can manage all profiles'
  ) THEN
    DROP POLICY "Administrators can manage all profiles" ON public.profiles;
  END IF;

  -- Create new policies with proper error handling
  CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

  CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

  CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

  -- Add administrator override policy
  CREATE POLICY "Administrators can manage all profiles"
    ON public.profiles
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'administrator'
      )
    );

  -- Log successful policy creation
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'policy_update',
    'Successfully updated profile policies',
    jsonb_build_object(
      'timestamp', CURRENT_TIMESTAMP,
      'policies_created', jsonb_build_array(
        'Users can view their own profile',
        'Users can update their own profile',
        'Users can insert their own profile',
        'Administrators can manage all profiles'
      )
    )
  );

EXCEPTION WHEN OTHERS THEN
  -- Log error and re-raise
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'policy_error',
    'Error updating profile policies',
    jsonb_build_object(
      'timestamp', CURRENT_TIMESTAMP,
      'error', SQLERRM
    )
  );
  RAISE;
END $$;