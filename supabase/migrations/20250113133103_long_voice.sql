-- Disable RLS on all tables
DO $$ 
BEGIN
  -- Disable RLS on core tables
  ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.depositions DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.transcripts DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.exhibits DISABLE ROW LEVEL SECURITY;

  -- Log the change
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'rls_update',
    'Disabled RLS on all tables',
    jsonb_build_object(
      'timestamp', CURRENT_TIMESTAMP,
      'tables', jsonb_build_array(
        'profiles',
        'depositions',
        'transcripts',
        'exhibits'
      ),
      'action', 'disable_rls'
    )
  );

END $$;