/*
  # Enhanced User Profiles and Activity Logging

  1. New Tables
    - `email_verification_codes`
      - For managing email verification process
      - Includes code, expiry, and verification status
    
  2. Changes
    - Add new columns to `profiles` table:
      - `verified_email`
      - `verification_sent_at`
      - `verification_attempts`
      - `last_verification_attempt`
    
  3. Security
    - Enable RLS on new tables
    - Add policies for secure access
    - Add verification-related functions
*/

-- Email Verification Codes
CREATE TABLE IF NOT EXISTS email_verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    attempts INTEGER DEFAULT 0,
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Add new columns to profiles if they don't exist
DO $$ 
BEGIN
    ALTER TABLE profiles
        ADD COLUMN IF NOT EXISTS verified_email BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS verification_sent_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS verification_attempts INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS last_verification_attempt TIMESTAMPTZ;
END $$;

-- Enable RLS
ALTER TABLE email_verification_codes ENABLE ROW LEVEL SECURITY;

-- Policies for email_verification_codes
CREATE POLICY "Users can view their own verification codes"
    ON email_verification_codes
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Function to generate verification code
CREATE OR REPLACE FUNCTION generate_verification_code(p_user_id UUID, p_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_code TEXT;
BEGIN
    -- Generate a random 6-digit code
    v_code := floor(random() * (999999 - 100000 + 1) + 100000)::TEXT;
    
    -- Insert the code
    INSERT INTO email_verification_codes (
        user_id,
        email,
        code,
        expires_at
    ) VALUES (
        p_user_id,
        p_email,
        v_code,
        CURRENT_TIMESTAMP + INTERVAL '15 minutes'
    );
    
    -- Update profile verification attempt info
    UPDATE profiles
    SET 
        verification_sent_at = CURRENT_TIMESTAMP,
        verification_attempts = COALESCE(verification_attempts, 0) + 1,
        last_verification_attempt = CURRENT_TIMESTAMP
    WHERE id = p_user_id;
    
    RETURN v_code;
END;
$$;

-- Function to verify email
CREATE OR REPLACE FUNCTION verify_email(p_user_id UUID, p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_valid BOOLEAN;
BEGIN
    -- Check if code is valid and not expired
    SELECT EXISTS (
        SELECT 1
        FROM email_verification_codes
        WHERE user_id = p_user_id
        AND code = p_code
        AND verified_at IS NULL
        AND expires_at > CURRENT_TIMESTAMP
    ) INTO v_valid;
    
    IF v_valid THEN
        -- Mark code as verified
        UPDATE email_verification_codes
        SET 
            verified_at = CURRENT_TIMESTAMP,
            attempts = attempts + 1
        WHERE user_id = p_user_id
        AND code = p_code;
        
        -- Update profile
        UPDATE profiles
        SET verified_email = TRUE
        WHERE id = p_user_id;
        
        -- Log verification
        INSERT INTO user_activity_logs (
            user_id,
            action_type,
            action_description,
            metadata
        ) VALUES (
            p_user_id,
            'email_verification',
            'Email verified successfully',
            jsonb_build_object('verified_at', CURRENT_TIMESTAMP)
        );
        
        RETURN TRUE;
    END IF;
    
    -- Log failed attempt
    UPDATE email_verification_codes
    SET attempts = attempts + 1
    WHERE user_id = p_user_id
    AND code = p_code;
    
    RETURN FALSE;
END;
$$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_user_id 
    ON email_verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_email 
    ON email_verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_expires_at 
    ON email_verification_codes(expires_at);