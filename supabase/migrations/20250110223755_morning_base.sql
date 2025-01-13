/*
  # Initial Schema Setup for LegalDepo Pro

  1. Tables
    - users (extends Supabase auth.users)
      - profile information
      - role-based access control
    - depositions
      - deposition details and metadata
    - transcripts
      - transcript content and metadata
    - exhibits
      - document storage metadata
    
  2. Security
    - Enable RLS on all tables
    - Set up access policies based on user roles
*/

-- Users table extending auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  organization text,
  role text CHECK (role IN ('attorney', 'court_reporter', 'legal_staff', 'witness', 'administrator')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Depositions table
CREATE TABLE IF NOT EXISTS public.depositions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  case_number text,
  scheduled_date timestamptz NOT NULL,
  status text CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Transcripts table
CREATE TABLE IF NOT EXISTS public.transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deposition_id uuid REFERENCES public.depositions(id) ON DELETE CASCADE,
  content text,
  status text CHECK (status IN ('draft', 'under_review', 'final')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Exhibits table
CREATE TABLE IF NOT EXISTS public.exhibits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deposition_id uuid REFERENCES public.depositions(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  storage_path text NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depositions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exhibits ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Depositions policies
CREATE POLICY "Users can view depositions they are involved in"
  ON public.depositions
  FOR SELECT
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('administrator', 'court_reporter')
    )
  );

-- Transcripts policies
CREATE POLICY "Users can view transcripts they have access to"
  ON public.transcripts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.depositions
      WHERE depositions.id = transcripts.deposition_id
      AND (depositions.created_by = auth.uid() OR
           EXISTS (
             SELECT 1 FROM public.profiles
             WHERE id = auth.uid() AND role IN ('administrator', 'court_reporter')
           ))
    )
  );

-- Exhibits policies
CREATE POLICY "Users can view exhibits they have access to"
  ON public.exhibits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.depositions
      WHERE depositions.id = exhibits.deposition_id
      AND (depositions.created_by = auth.uid() OR
           EXISTS (
             SELECT 1 FROM public.profiles
             WHERE id = auth.uid() AND role IN ('administrator', 'court_reporter')
           ))
    )
  );