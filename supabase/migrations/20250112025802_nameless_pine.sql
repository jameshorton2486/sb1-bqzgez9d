/*
  # Transcription System Tables

  1. New Tables
    - transcriptions: Stores transcription metadata and settings
    - transcription_files: Stores file references and processing status
    - transcription_segments: Stores individual transcript segments with timing
    - transcription_speakers: Maps speakers to transcriptions
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Transcriptions table
CREATE TABLE IF NOT EXISTS transcriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  case_styling text NOT NULL,
  cause_number text NOT NULL,
  court_info text,
  proceeding_date timestamptz NOT NULL,
  proceeding_type text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'archived')),
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Transcription Files table
CREATE TABLE IF NOT EXISTS transcription_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transcription_id uuid REFERENCES transcriptions(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  duration integer,
  processing_status text NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'error')),
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Transcription Segments table
CREATE TABLE IF NOT EXISTS transcription_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transcription_id uuid REFERENCES transcriptions(id) ON DELETE CASCADE,
  speaker_id uuid,
  start_time numeric NOT NULL,
  end_time numeric NOT NULL,
  text text NOT NULL,
  confidence numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Transcription Speakers table
CREATE TABLE IF NOT EXISTS transcription_speakers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transcription_id uuid REFERENCES transcriptions(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcription_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcription_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcription_speakers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own transcriptions"
  ON transcriptions
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can access their transcription files"
  ON transcription_files
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM transcriptions
      WHERE transcriptions.id = transcription_id
      AND transcriptions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access their transcription segments"
  ON transcription_segments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM transcriptions
      WHERE transcriptions.id = transcription_id
      AND transcriptions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their transcription speakers"
  ON transcription_speakers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM transcriptions
      WHERE transcriptions.id = transcription_id
      AND transcriptions.user_id = auth.uid()
    )
  );

-- Indexes for better performance
CREATE INDEX idx_transcriptions_user_id ON transcriptions(user_id);
CREATE INDEX idx_transcription_files_transcription_id ON transcription_files(transcription_id);
CREATE INDEX idx_transcription_segments_transcription_id ON transcription_segments(transcription_id);
CREATE INDEX idx_transcription_speakers_transcription_id ON transcription_speakers(transcription_id);