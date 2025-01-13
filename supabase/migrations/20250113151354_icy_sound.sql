-- Safe rollback to working security model
DO $$ 
DECLARE
  v_log_id uuid;
BEGIN
  -- Start logging the rollback process
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'rollback_start',
    'Starting database security rollback',
    jsonb_build_object(
      'timestamp', CURRENT_TIMESTAMP,
      'initiated_by', auth.uid()
    )
  ) RETURNING id INTO v_log_id;

  -- Verify and use secure_profiles view
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name = 'secure_profiles'
  ) THEN
    -- Recreate secure view if missing
    CREATE OR REPLACE VIEW secure_profiles AS
    SELECT 
      p.id,
      p.email,
      p.full_name,
      p.role,
      p.organization,
      p.created_at,
      p.updated_at
    FROM profiles p
    WHERE 
      p.id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM profiles ap 
        WHERE ap.id = auth.uid() 
        AND ap.role = 'administrator'
      );
  END IF;

  -- Ensure proper permissions
  REVOKE ALL ON profiles FROM anon, authenticated;
  GRANT SELECT ON secure_profiles TO authenticated;
  GRANT EXECUTE ON FUNCTION get_profile TO authenticated;
  GRANT EXECUTE ON FUNCTION update_profile TO authenticated;

  -- Log successful rollback
  UPDATE public.user_activity_logs
  SET 
    action_description = 'Successfully rolled back to secure view model',
    metadata = metadata || jsonb_build_object(
      'completed_at', CURRENT_TIMESTAMP,
      'status', 'success'
    )
  WHERE id = v_log_id;

EXCEPTION WHEN OTHERS THEN
  -- Log rollback failure
  UPDATE public.user_activity_logs
  SET 
    action_description = 'Rollback failed',
    metadata = metadata || jsonb_build_object(
      'error', SQLERRM,
      'failed_at', CURRENT_TIMESTAMP
    )
  WHERE id = v_log_id;
  RAISE;
END $$;