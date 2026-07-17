-- 1. Create the license_keys table
-- මුලින්ම පරණ table එකක් තිබේ නම් එය ඉවත් කර අලුතින්ම නිවැරදි තීරු (columns) සමග සාදමු
DROP TABLE IF EXISTS public.license_keys;

CREATE TABLE public.license_keys (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key_code text NOT NULL UNIQUE,
    plan_type text NOT NULL CHECK (plan_type IN ('monthly', 'quarterly', 'yearly')),
    duration_months integer NOT NULL,
    status text DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
    used_by_institute_id uuid, -- මෙය පසුව institutes table එකට link වේ
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Add License Key column to Institutes table
ALTER TABLE public.institutes ADD COLUMN IF NOT EXISTS license_key text;

-- 3. Enable RLS (Security)
ALTER TABLE public.license_keys ENABLE ROW LEVEL SECURITY;

-- ඕනෑම login වුනු user කෙනෙකුට keys බැලීමට සහ generate කිරීමට අවසර ලබා දීම
-- (පසුව මෙය SuperAdmin ට පමණක් සීමා කළ හැක)
CREATE POLICY "Full access to authenticated users" ON public.license_keys
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Create RPC Function to check availability
CREATE OR REPLACE FUNCTION check_license_key(lookup_key text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.license_keys
    WHERE key_code = lookup_key
    AND status = 'active'
  );
END;
$$;

-- 5. Create Trigger to automatically mark key as used
CREATE OR REPLACE FUNCTION mark_license_as_used()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (
      SELECT 1 FROM public.license_keys
      WHERE key_code = NEW.license_key
      AND status = 'active'
  ) THEN
      RAISE EXCEPTION 'Invalid or already used License Key';
  END IF;

  UPDATE public.license_keys
  SET status = 'used',
      used_by_institute_id = NEW.id
  WHERE key_code = NEW.license_key;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_institute_created ON public.institutes;
CREATE TRIGGER on_institute_created
  BEFORE INSERT ON public.institutes
  FOR EACH ROW EXECUTE PROCEDURE mark_license_as_used();

-- 6. Insert Dummy Data (Testing purposes)
-- පරීක්ෂා කිරීම සඳහා උදාහරණ Keys කිහිපයක්
INSERT INTO public.license_keys (key_code) VALUES 
('ANW-TEST-2024'),
('PREM-USER-001'),
('START-UP-KEY');
