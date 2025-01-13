/*
  # Enhanced Legal Deposition Schema

  1. New Tables
    - `availability` - Stores participant availability schedules
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `day_of_week` (int) - 0-6 for Sunday-Saturday
      - `start_time` (time)
      - `end_time` (time)
      - `timezone` (text)
      
    - `documents` - Stores deposition-related documents
      - `id` (uuid, primary key)
      - `schedule_id` (uuid, references schedules)
      - `name` (text)
      - `file_path` (text)
      - `uploaded_by` (uuid, references auth.users)
      - `uploaded_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
*/

-- Availability table
CREATE TABLE IF NOT EXISTS availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  timezone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid REFERENCES schedules ON DELETE CASCADE,
  name text NOT NULL,
  file_path text NOT NULL,
  uploaded_by uuid REFERENCES auth.users ON DELETE SET NULL,
  uploaded_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own availability"
  ON availability FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own availability"
  ON availability FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view documents for their depositions"
  ON documents FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM participants WHERE schedule_id = documents.schedule_id
    )
  );