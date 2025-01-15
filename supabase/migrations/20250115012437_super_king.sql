-- Enable RLS on core tables
DO $$
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
      'tables', ARRAY['profiles', 'depositions', 'transcripts', 'exhibits']
    )
  );

  -- Enable RLS for each table
  FOR v_table IN 
    SELECT unnest(ARRAY['profiles', 'depositions', 'transcripts', 'exhibits'])
  LOOP
    IF EXISTS (
      SELECT 1 
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = v_table
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_table);
      
      -- Log the change
      INSERT INTO public.user_activity_logs (
        action_type,
        action_description,
        metadata
      ) VALUES (
        'rls_update',
        format('Enabled RLS on table %s', v_table),
        jsonb_build_object(
          'table', v_table,
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