-- Law Firms table
CREATE TABLE IF NOT EXISTS public.law_firms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  primary_address text NOT NULL,
  billing_address text NOT NULL,
  phone text NOT NULL,
  website text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Client Numbers table
CREATE TABLE IF NOT EXISTS public.client_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  law_firm_id uuid REFERENCES public.law_firms(id),
  client_number text NOT NULL,
  description text,
  billing_contact text NOT NULL,
  billing_email text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(law_firm_id, client_number)
);

-- Firm Attorneys junction table
CREATE TABLE IF NOT EXISTS public.firm_attorneys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  law_firm_id uuid REFERENCES public.law_firms(id),
  attorney_id uuid REFERENCES auth.users(id),
  role text CHECK (role IN ('partner', 'associate', 'of_counsel')),
  start_date date NOT NULL,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(law_firm_id, attorney_id)
);

-- Availability Schedules table
CREATE TABLE IF NOT EXISTS public.availability_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  recurring_availability jsonb NOT NULL DEFAULT '[]'::jsonb,
  blackout_dates jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Service Rates table
CREATE TABLE IF NOT EXISTS public.service_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  service_type text NOT NULL,
  rate decimal(10,2) NOT NULL,
  rate_type text CHECK (rate_type IN ('hourly', 'per_page', 'flat_rate')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add new columns to profiles table
DO $$ 
BEGIN
  ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS email text,
    ADD COLUMN IF NOT EXISTS phone text,
    ADD COLUMN IF NOT EXISTS address text,
    ADD COLUMN IF NOT EXISTS website text,
    ADD COLUMN IF NOT EXISTS professional_id text,
    ADD COLUMN IF NOT EXISTS certifications text[],
    ADD COLUMN IF NOT EXISTS practice_areas text[],
    ADD COLUMN IF NOT EXISTS equipment_details text,
    ADD COLUMN IF NOT EXISTS service_regions text[],
    ADD COLUMN IF NOT EXISTS specialties text[],
    ADD COLUMN IF NOT EXISTS two_factor_enabled boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS last_login timestamptz,
    ADD COLUMN IF NOT EXISTS ip_whitelist text[];
END $$;

-- Enable RLS
ALTER TABLE public.law_firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.firm_attorneys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_rates ENABLE ROW LEVEL SECURITY;

-- Safely create policies
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view their associated law firms" ON public.law_firms;
  DROP POLICY IF EXISTS "Users can view their firm's client numbers" ON public.client_numbers;
  DROP POLICY IF EXISTS "Users can manage their own availability" ON public.availability_schedules;
  DROP POLICY IF EXISTS "Users can manage their own rates" ON public.service_rates;

  -- Create new policies
  CREATE POLICY "Users can view their associated law firms"
    ON public.law_firms
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.firm_attorneys
        WHERE firm_attorneys.law_firm_id = law_firms.id
        AND firm_attorneys.attorney_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'administrator'
      )
    );

  CREATE POLICY "Users can view their firm's client numbers"
    ON public.client_numbers
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.firm_attorneys
        WHERE firm_attorneys.law_firm_id = client_numbers.law_firm_id
        AND firm_attorneys.attorney_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'administrator'
      )
    );

  CREATE POLICY "Users can manage their own availability"
    ON public.availability_schedules
    FOR ALL
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can manage their own rates"
    ON public.service_rates
    FOR ALL
    USING (auth.uid() = user_id);

END $$;