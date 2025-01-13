-- Fix RLS checking implementation
DO $$ 
DECLARE
  v_has_rls boolean;
  v_tables text[] := ARRAY['profiles', 'depositions', 'transcripts', 'exhibits'];
  v_table text;
BEGIN
  -- Create function to properly check RLS status
  CREATE OR REPLACE FUNCTION check_table_rls(p_table text)
  RETURNS boolean AS $$
  BEGIN
    RETURN EXISTS (
      SELECT 1
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' 
      AND c.relname = p_table
      AND c.relrowsecurity = true
    );
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

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

  -- Check and fix RLS for each table
  FOREACH v_table IN ARRAY v_tables
  LOOP
    -- Check if table exists
    IF EXISTS (
      SELECT 1 
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = v_table
    ) THEN
      -- Check if RLS is enabled
      SELECT check_table_rls(v_table) INTO v_has_rls;
      
      IF NOT v_has_rls THEN
        -- Enable RLS
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