-- Improve security model with additional safeguards
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
    'Improving security model with additional safeguards',
    jsonb_build_object(
      'timestamp', CURRENT_TIMESTAMP,
      'initiated_by', auth.uid()
    )
  ) RETURNING id INTO v_log_id;

  -- Create secure functions for all operations
  CREATE OR REPLACE FUNCTION get_user_profile(user_id uuid)
  RETURNS SETOF secure_profiles
  SECURITY DEFINER
  STABLE
  LANGUAGE sql
  AS $$
    SELECT * FROM secure_profiles WHERE id = user_id;
  $$;

  CREATE OR REPLACE FUNCTION get_user_depositions(user_id uuid)
  RETURNS SETOF secure_depositions
  SECURITY DEFINER
  STABLE
  LANGUAGE sql
  AS $$
    SELECT * FROM secure_depositions WHERE created_by = user_id;
  $$;

  CREATE OR REPLACE FUNCTION create_deposition(
    p_title text,
    p_case_number text,
    p_scheduled_date timestamptz
  )
  RETURNS secure_depositions
  SECURITY DEFINER
  VOLATILE
  LANGUAGE plpgsql
  AS $$
  DECLARE
    v_result secure_depositions;
  BEGIN
    INSERT INTO depositions (
      title,
      case_number,
      scheduled_date,
      status,
      created_by
    ) VALUES (
      p_title,
      p_case_number,
      p_scheduled_date,
      'scheduled',
      auth.uid()
    )
    RETURNING * INTO v_result;
    
    RETURN v_result;
  END;
  $$;

  -- Create audit trigger function
  CREATE OR REPLACE FUNCTION log_table_changes()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO user_activity_logs (
      action_type,
      action_description,
      user_id,
      metadata
    ) VALUES (
      CASE
        WHEN TG_OP = 'INSERT' THEN 'insert'
        WHEN TG_OP = 'UPDATE' THEN 'update'
        WHEN TG_OP = 'DELETE' THEN 'delete'
      END,
      format('Table %s %s operation', TG_TABLE_NAME, TG_OP),
      auth.uid(),
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'timestamp', CURRENT_TIMESTAMP,
        'old_data', CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        'new_data', CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END
      )
    );
    RETURN COALESCE(NEW, OLD);
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Create audit triggers
  CREATE TRIGGER audit_profiles
    AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW EXECUTE FUNCTION log_table_changes();

  CREATE TRIGGER audit_depositions
    AFTER INSERT OR UPDATE OR DELETE ON depositions
    FOR EACH ROW EXECUTE FUNCTION log_table_changes();

  -- Grant execute permissions on new functions
  GRANT EXECUTE ON FUNCTION get_user_profile TO authenticated;
  GRANT EXECUTE ON FUNCTION get_user_depositions TO authenticated;
  GRANT EXECUTE ON FUNCTION create_deposition TO authenticated;

  -- Log successful completion
  UPDATE public.user_activity_logs
  SET 
    action_description = 'Successfully improved security model',
    metadata = metadata || jsonb_build_object(
      'completed_at', CURRENT_TIMESTAMP,
      'status', 'success',
      'changes', jsonb_build_array(
        'Created secure access functions',
        'Added audit triggers',
        'Updated permissions'
      )
    )
  WHERE id = v_log_id;

EXCEPTION WHEN OTHERS THEN
  -- Log failure
  UPDATE public.user_activity_logs
  SET 
    action_description = 'Failed to improve security model',
    metadata = metadata || jsonb_build_object(
      'error', SQLERRM,
      'detail', SQLSTATE,
      'failed_at', CURRENT_TIMESTAMP
    )
  WHERE id = v_log_id;
  RAISE;
END $$;