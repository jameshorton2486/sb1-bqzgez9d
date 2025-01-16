-- Enable RLS on core tables with proper loop syntax
DO $$ 
DECLARE
  v_table_name text;
  v_tables text[] := ARRAY['profiles', 'depositions', 'transcripts', 'exhibits'];
BEGIN
  -- Log start of RLS verification
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'rls_verification',
    'Starting RLS verification process',
    jsonb_build_object(
      'timestamp', CURRENT_TIMESTAMP,
      'tables', v_tables
    )
  );

  -- Enable RLS for each table using FOREACH
  FOREACH v_table_name IN ARRAY v_tables
  LOOP
    IF EXISTS (
      SELECT 1 
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = v_table_name
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_table_name);
      
      -- Log the change
      INSERT INTO public.user_activity_logs (
        action_type,
        action_description,
        metadata
      ) VALUES (
        'rls_update',
        format('Enabled RLS on table %s', v_table_name),
        jsonb_build_object(
          'table', v_table_name,
          'action', 'enable_rls',
          'timestamp', CURRENT_TIMESTAMP
        )
      );
    END IF;
  END LOOP;

  -- Log completion
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'rls_verification',
    'Completed RLS verification process',
    jsonb_build_object(
      'timestamp', CURRENT_TIMESTAMP,
      'status', 'completed'
    )
  );

EXCEPTION WHEN OTHERS THEN
  -- Log error
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'rls_error',
    'Error during RLS verification',
    jsonb_build_object(
      'error', SQLERRM,
      'detail', SQLSTATE,
      'timestamp', CURRENT_TIMESTAMP
    )
  );
  RAISE;
END $$;