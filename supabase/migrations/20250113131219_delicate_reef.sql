-- Fix RLS policies without relying on rls_enabled column
DO $$ 
BEGIN
  -- Enable RLS on profiles table directly
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

  -- Recreate core policies
  DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Administrators can manage all profiles" ON public.profiles;

  -- Create new policies
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

  -- Log successful update
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'rls_update',
    'Successfully recreated RLS policies',
    jsonb_build_object(
      'timestamp', CURRENT_TIMESTAMP,
      'table', 'profiles',
      'action', 'policy_recreation'
    )
  );

EXCEPTION WHEN OTHERS THEN
  -- Log error but continue
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'rls_error',
    'Failed to update RLS policies',
    jsonb_build_object(
      'error', SQLERRM,
      'timestamp', CURRENT_TIMESTAMP
    )
  );
  -- Re-raise the error
  RAISE;
END $$;