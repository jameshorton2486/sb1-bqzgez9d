-- Create secure functions with proper syntax
DO $$ 
BEGIN
  -- Create get_profile function
  CREATE OR REPLACE FUNCTION get_profile(user_id uuid)
  RETURNS TABLE (
    id uuid,
    email text,
    full_name text,
    role text,
    organization text,
    created_at timestamptz,
    updated_at timestamptz
  ) AS $$
    SELECT p.id, p.email, p.full_name, p.role, p.organization, p.created_at, p.updated_at
    FROM profiles p
    WHERE p.id = user_id
      AND (
        auth.uid() = user_id 
        OR EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() 
          AND role = 'administrator'
        )
      );
  $$ LANGUAGE sql SECURITY DEFINER STABLE;

  -- Create update_profile function
  CREATE OR REPLACE FUNCTION update_profile(
    p_user_id uuid,
    p_full_name text,
    p_organization text
  )
  RETURNS TABLE (
    id uuid,
    email text,
    full_name text,
    role text,
    organization text,
    created_at timestamptz,
    updated_at timestamptz
  ) AS $$
    WITH updated AS (
      UPDATE profiles 
      SET 
        full_name = COALESCE(p_full_name, full_name),
        organization = COALESCE(p_organization, organization),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = p_user_id
        AND (
          auth.uid() = p_user_id 
          OR EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'administrator'
          )
        )
      RETURNING *
    )
    SELECT * FROM updated;
  $$ LANGUAGE sql SECURITY DEFINER VOLATILE;

  -- Log successful creation
  INSERT INTO public.user_activity_logs (
    action_type,
    action_description,
    metadata
  ) VALUES (
    'function_update',
    'Successfully created secure functions',
    jsonb_build_object(
      'timestamp', CURRENT_TIMESTAMP,
      'functions', jsonb_build_array('get_profile', 'update_profile')
    )
  );

END $$;