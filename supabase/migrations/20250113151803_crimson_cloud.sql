-- Fix security model without relying on rls_enabled
DO $$ 
DECLARE
  v_log_id uuid;
BEGIN
  -- Start logging
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'security_update',
    'Starting security model update',
    jsonb_build_object(
      'timestamp', CURRENT_TIMESTAMP,
      'initiated_by', auth.uid()
    )
  ) RETURNING id INTO v_log_id;

  -- Drop any columns named rls_enabled if they exist
  DO $inner$ 
  BEGIN
    IF EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND column_name = 'rls_enabled'
    ) THEN
      ALTER TABLE public.profiles DROP COLUMN IF EXISTS rls_enabled;
      ALTER TABLE public.depositions DROP COLUMN IF EXISTS rls_enabled;
      ALTER TABLE public.transcripts DROP COLUMN IF EXISTS rls_enabled;
      ALTER TABLE public.exhibits DROP COLUMN IF EXISTS rls_enabled;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Log but continue if column drop fails
    NULL;
  END $inner$;

  -- Enable RLS on all tables
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.depositions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.exhibits ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies
  DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Administrators can manage all profiles" ON public.profiles;

  -- Create new policies without rls_enabled dependency
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

  -- Update log with success
  UPDATE public.user_activity_logs
  SET 
    action_description = 'Successfully updated security model',
    metadata = metadata || jsonb_build_object(
      'completed_at', CURRENT_TIMESTAMP,
      'status', 'success',
      'changes', jsonb_build_array(
        'Removed rls_enabled columns',
        'Enabled RLS on all tables',
        'Created new security policies'
      )
    )
  WHERE id = v_log_id;

EXCEPTION WHEN OTHERS THEN
  -- Log failure
  UPDATE public.user_activity_logs
  SET 
    action_description = 'Failed to update security model',
    metadata = metadata || jsonb_build_object(
      'error', SQLERRM,
      'detail', SQLSTATE,
      'failed_at', CURRENT_TIMESTAMP
    )
  WHERE id = v_log_id;
  RAISE;
END $$;