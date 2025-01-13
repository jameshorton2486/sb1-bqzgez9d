-- Restore RLS configuration with proper policies
DO $$ 
BEGIN
  -- Enable RLS on all tables
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.depositions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.exhibits ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Administrators can manage all profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Users can view depositions they are involved in" ON public.depositions;
  DROP POLICY IF EXISTS "Users can view transcripts they have access to" ON public.transcripts;
  DROP POLICY IF EXISTS "Users can view exhibits they have access to" ON public.exhibits;

  -- Recreate policies for profiles
  CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

  CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

  CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

  CREATE POLICY "Administrators can manage all profiles"
    ON public.profiles
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'administrator'
      )
    );

  -- Recreate policies for depositions
  CREATE POLICY "Users can view depositions they are involved in"
    ON public.depositions
    FOR SELECT
    TO authenticated
    USING (
      auth.uid() = created_by OR
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('administrator', 'court_reporter')
      )
    );

  -- Recreate policies for transcripts
  CREATE POLICY "Users can view transcripts they have access to"
    ON public.transcripts
    FOR SELECT
    TO authenticated
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

  -- Recreate policies for exhibits
  CREATE POLICY "Users can view exhibits they have access to"
    ON public.exhibits
    FOR SELECT
    TO authenticated
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

END $$;