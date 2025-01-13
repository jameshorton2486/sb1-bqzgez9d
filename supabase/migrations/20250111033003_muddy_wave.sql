/*
  # Legal Deposition Scheduling Schema

  1. New Tables
    - `schedules` - Stores deposition schedule information
      - `id` (uuid, primary key) 
      - `case_number` (text)
      - `deposition_date` (timestamptz)
      - `deposition_type` (text) - in-person/remote
      - `location` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
    - `participants` - Stores participant information
      - `id` (uuid, primary key)
      - `schedule_id` (uuid, references schedules)
      - `user_id` (uuid, references auth.users)
      - `role` (text) - attorney/witness/court reporter/etc
      - `created_at` (timestamptz)
      
    - `notifications` - Stores notification records
      - `id` (uuid, primary key) 
      - `schedule_id` (uuid, references schedules)
      - `user_id` (uuid, references auth.users)
      - `type` (text) - email/sms
      - `status` (text)
      - `sent_at` (timestamptz)
      
  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
*/

-- Schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number text NOT NULL,
  deposition_date timestamptz NOT NULL,
  deposition_type text NOT NULL CHECK (deposition_type IN ('in-person', 'remote')),
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Participants table
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid REFERENCES schedules ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('attorney', 'witness', 'court_reporter', 'videographer')),
  created_at timestamptz DEFAULT now()
);

-- Notifications table  
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid REFERENCES schedules ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('email', 'sms')),
  status text NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at timestamptz
);

-- Enable RLS
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their schedules"
  ON schedules FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM participants WHERE schedule_id = id
    )
  );

CREATE POLICY "Users can view their participations" 
  ON participants FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);