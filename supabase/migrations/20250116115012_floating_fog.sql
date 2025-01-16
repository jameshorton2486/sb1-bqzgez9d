-- Create secure functions for data access
CREATE OR REPLACE FUNCTION check_user_access(
  p_user_id uuid,
  p_required_roles text[]
)
RETURNS boolean
SECURITY DEFINER
STABLE
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND (
      id = p_user_id 
      OR role = ANY(p_required_roles)
    )
  );
END;
$$;

-- Create secure CRUD functions
CREATE OR REPLACE FUNCTION update_user_profile(
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
)
SECURITY DEFINER
VOLATILE
LANGUAGE plpgsql
AS $$
BEGIN
  IF check_user_access(p_user_id, ARRAY['administrator']) THEN
    UPDATE profiles 
    SET 
      full_name = COALESCE(p_full_name, full_name),
      organization = COALESCE(p_organization, organization),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = p_user_id
    RETURNING id, email, full_name, role, organization, created_at, updated_at;
  ELSE
    RAISE EXCEPTION 'Unauthorized profile update';
  END IF;
END;
$$;

-- Create secure views
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

-- Drop rls_enabled columns if they exist
ALTER TABLE public.profiles DROP COLUMN IF EXISTS rls_enabled;
ALTER TABLE public.depositions DROP COLUMN IF EXISTS rls_enabled;
ALTER TABLE public.transcripts DROP COLUMN IF EXISTS rls_enabled;
ALTER TABLE public.exhibits DROP COLUMN IF EXISTS rls_enabled;

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_user_access TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_profile TO authenticated;

-- Log changes
INSERT INTO public.user_activity_logs (
  action_type,
  action_description,
  metadata
) VALUES (
  'security_cleanup',
  'Successfully cleaned up security model',
  jsonb_build_object(
    'timestamp', CURRENT_TIMESTAMP,
    'changes', jsonb_build_array(
      'Removed rls_enabled columns',
      'Updated secure views', 
      'Added permission check function',
      'Created secure CRUD functions'
    )
  )
);