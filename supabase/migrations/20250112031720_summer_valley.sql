/*
  # Enhanced User Profiles Security System

  1. New Tables
    - `login_attempts`: Track failed login attempts for rate limiting
    - `security_questions`: Store security questions for account recovery
    - `password_history`: Track password changes for password policies
    
  2. Changes
    - Add security-related columns to existing profiles table
    - Add additional constraints and validations
    
  3. Security
    - Enable RLS on all new tables
    - Add security-focused policies
    - Add security-related functions
*/

-- Login Attempts tracking
CREATE TABLE IF NOT EXISTS login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    ip_address TEXT,
    attempt_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT FALSE,
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Security Questions
CREATE TABLE IF NOT EXISTS security_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Password History
CREATE TABLE IF NOT EXISTS password_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add new security columns to profiles if they don't exist
DO $$ 
BEGIN
    ALTER TABLE profiles
        ADD COLUMN IF NOT EXISTS security_questions_enabled BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS password_last_changed TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS security_audit_log JSONB DEFAULT '[]'::jsonb;
END $$;

-- Enable RLS
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_history ENABLE ROW LEVEL SECURITY;

-- Security Policies
CREATE POLICY "No direct access to login_attempts"
    ON login_attempts
    FOR ALL
    USING (false);

CREATE POLICY "Users can manage their own security questions"
    ON security_questions
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own password history"
    ON password_history
    FOR SELECT
    USING (auth.uid() = user_id);

-- Function to check login attempts and implement rate limiting
CREATE OR REPLACE FUNCTION check_login_attempts(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_attempts INTEGER;
    v_locked_until TIMESTAMPTZ;
BEGIN
    -- Get recent failed attempts
    SELECT COUNT(*)
    INTO v_attempts
    FROM login_attempts
    WHERE email = p_email
    AND success = FALSE
    AND attempt_time > CURRENT_TIMESTAMP - INTERVAL '15 minutes';
    
    -- Check if account is locked
    SELECT account_locked_until
    INTO v_locked_until
    FROM profiles
    WHERE email = p_email;
    
    IF v_locked_until IS NOT NULL AND v_locked_until > CURRENT_TIMESTAMP THEN
        RETURN FALSE;
    END IF;
    
    -- Lock account if too many attempts
    IF v_attempts >= 5 THEN
        UPDATE profiles
        SET 
            account_locked_until = CURRENT_TIMESTAMP + INTERVAL '30 minutes',
            security_audit_log = security_audit_log || jsonb_build_object(
                'event', 'account_locked',
                'timestamp', CURRENT_TIMESTAMP,
                'reason', 'too_many_attempts'
            )
        WHERE email = p_email;
        
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$;

-- Function to validate password history
CREATE OR REPLACE FUNCTION validate_password_history(p_user_id UUID, p_new_password_hash TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    -- Check if password was used in the last 5 changes
    SELECT EXISTS (
        SELECT 1
        FROM password_history
        WHERE user_id = p_user_id
        AND password_hash = p_new_password_hash
        ORDER BY created_at DESC
        LIMIT 5
    ) INTO v_exists;
    
    RETURN NOT v_exists;
END;
$$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time 
    ON login_attempts(email, attempt_time);
CREATE INDEX IF NOT EXISTS idx_security_questions_user_id 
    ON security_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_password_history_user_id_created 
    ON password_history(user_id, created_at);