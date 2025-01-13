-- Fix RLS configuration by adding required column and recreating policies
DO $$ 
BEGIN
  -- Add rls_enabled column to all tables that need it
  ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS rls_enabled BOOLEAN DEFAULT true;
  ALTER TABLE public.depositions 
    ADD COLUMN IF NOT EXISTS rls_enabled BOOLEAN DEFAULT true;
  ALTER TABLE public.transcripts 
    ADD COLUMN IF NOT EXISTS rls_enabled BOOLEAN DEFAULT true;
  ALTER TABLE public.exhibits 
    ADD COLUMN IF NOT EXISTS rls_enabled BOOLEAN DEFAULT true;

  -- Enable RLS on all tables
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.depositions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.exhibits ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies to recreate them
  DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Administrators can manage all profiles" ON public.profiles;

  -- Recreate policies
  CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id AND rls_enabled = true);

  CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id AND rls_enabled = true);

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

  -- Log the changes
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'rls_fix',
    'Fixed RLS configuration and policies',
    jsonb_build_object(
      'timestamp', CURRENT_TIMESTAMP,
      'changes', 'Added rls_enabled column and recreated policies'
    )
  );

EXCEPTION WHEN OTHERS THEN
  -- Log any errors
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'rls_error',
    'Error fixing RLS configuration',
    jsonb_build_object(
      'error', SQLERRM,
      'timestamp', CURRENT_TIMESTAMP
    )
  );
  RAISE;
END $$;