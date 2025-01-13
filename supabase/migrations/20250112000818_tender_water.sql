/*
  # User Management System Enhancement

  1. New Tables
    - `user_security_settings`
      - Stores 2FA settings, session timeouts, IP whitelist
    - `user_activity_logs` 
      - Tracks all user actions and system events
    - `user_sessions`
      - Manages active user sessions and timeouts
    - `user_equipment`
      - Tracks professional equipment for videographers/reporters
    - `user_certifications`
      - Stores professional certifications and credentials
    
  2. Security
    - Enable RLS on all new tables
    - Add policies for secure access control
    - Implement audit logging
    
  3. Changes
    - Add new columns to existing profiles table
    - Update existing RLS policies
*/

-- User Security Settings
CREATE TABLE IF NOT EXISTS user_security_settings (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  two_factor_enabled boolean DEFAULT false,
  two_factor_method text CHECK (two_factor_method IN ('app', 'sms', 'email')),
  session_timeout interval DEFAULT '30 minutes'::interval,
  ip_whitelist text[],
  last_security_update timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Activity Logs
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  action_description text,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- User Sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token text NOT NULL,
  ip_address text,
  user_agent text,
  expires_at timestamptz NOT NULL,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- User Equipment
CREATE TABLE IF NOT EXISTS user_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  equipment_type text NOT NULL,
  model text NOT NULL,
  serial_number text,
  purchase_date date,
  last_maintenance_date date,
  status text CHECK (status IN ('active', 'maintenance', 'retired')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Certifications
CREATE TABLE IF NOT EXISTS user_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  certification_name text NOT NULL,
  issuing_authority text NOT NULL,
  certification_number text,
  issue_date date NOT NULL,
  expiry_date date,
  status text CHECK (status IN ('active', 'expired', 'revoked')),
  verification_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add new columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS security_level text CHECK (security_level IN ('standard', 'elevated', 'admin')),
  ADD COLUMN IF NOT EXISTS account_status text CHECK (account_status IN ('active', 'suspended', 'inactive')),
  ADD COLUMN IF NOT EXISTS last_security_training date,
  ADD COLUMN IF NOT EXISTS security_training_due date;

-- Enable RLS
ALTER TABLE user_security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_certifications ENABLE ROW LEVEL SECURITY;

-- Security Settings Policies
CREATE POLICY "Users can view their own security settings"
  ON user_security_settings
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own security settings"
  ON user_security_settings
  FOR UPDATE
  USING (auth.uid() = id);

-- Activity Logs Policies
CREATE POLICY "Users can view their own activity logs"
  ON user_activity_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs"
  ON user_activity_logs
  FOR INSERT
  WITH CHECK (true);

-- Sessions Policies
CREATE POLICY "Users can view their own sessions"
  ON user_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Equipment Policies
CREATE POLICY "Users can manage their own equipment"
  ON user_equipment
  FOR ALL
  USING (auth.uid() = user_id);

-- Certifications Policies
CREATE POLICY "Users can manage their own certifications"
  ON user_certifications
  FOR ALL
  USING (auth.uid() = user_id);

-- Functions for Security
CREATE OR REPLACE FUNCTION check_session_timeout()
RETURNS trigger AS $$
BEGIN
  DELETE FROM user_sessions
  WHERE expires_at < NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_activity_logs (user_id, action_type, action_description)
  VALUES (auth.uid(), TG_ARGV[0], TG_ARGV[1]);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
CREATE TRIGGER cleanup_expired_sessions
  BEFORE INSERT OR UPDATE ON user_sessions
  EXECUTE FUNCTION check_session_timeout();

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_equipment_user_id ON user_equipment(user_id);
CREATE INDEX IF NOT EXISTS idx_user_certifications_user_id ON user_certifications(user_id);