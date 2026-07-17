-- 1. Create License Keys Table
CREATE TABLE IF NOT EXISTS public.license_keys (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key text UNIQUE NOT NULL,
    plan_type text CHECK (plan_type IN ('monthly', 'quarterly', 'yearly')) NOT NULL,
    duration_months integer NOT NULL,
    status text DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
    used_at timestamp with time zone,
    used_by_institute_id uuid, -- We'll link this manually or via trigger
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Function for the frontend to check if a key is valid
CREATE OR REPLACE FUNCTION public.check_license_key(lookup_key text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.license_keys 
        WHERE key = lookup_key AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger/Logic to consume the key when an institute is created
-- This function will run whenever a new institute is inserted
CREATE OR REPLACE FUNCTION public.consume_license_on_signup()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the license key exists and is active
    IF EXISTS (SELECT 1 FROM public.license_keys WHERE key = NEW.license_key AND status = 'active') THEN
        -- Update the license key status to 'used'
        UPDATE public.license_keys 
        SET status = 'used', 
            used_at = now(), 
            used_by_institute_id = NEW.id 
        WHERE key = NEW.license_key;
        
        -- Set the expiry date on the institute record
        -- Duration is fetched from the license_keys table
        NEW.license_expiry := now() + (SELECT duration_months FROM public.license_keys WHERE key = NEW.license_key) * interval '1 month';
        
        RETURN NEW;
    ELSE
        RAISE EXCEPTION 'Invalid or already used license key.';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 4. Attach the trigger to the institutes table
DROP TRIGGER IF EXISTS tr_consume_license ON public.institutes;
CREATE TRIGGER tr_consume_license
BEFORE INSERT ON public.institutes
FOR EACH ROW
EXECUTE FUNCTION public.consume_license_on_signup();

-- 5. Add license_expiry column to institutes table if not exists
ALTER TABLE public.institutes 
ADD COLUMN IF NOT EXISTS license_expiry timestamp with time zone;
