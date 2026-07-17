-- ==========================================
-- RENEW LICENSE MIGRATION
-- Copy and Paste this into Supabase SQL Editor
-- ==========================================

-- 1. Create the License Renewal Function
CREATE OR REPLACE FUNCTION public.renew_institute_license(inst_id uuid, new_key text)
RETURNS json AS $$
DECLARE
    key_record RECORD;
    current_expiry timestamp with time zone;
    new_expiry timestamp with time zone;
BEGIN
    -- Validate the new key (Check key_code and whether it is 'active')
    SELECT * INTO key_record 
    FROM public.license_keys 
    WHERE key_code = new_key AND status = 'active';

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Invalid or already used license key.');
    END IF;

    -- Get the current expiry date of the institute
    SELECT license_expiry INTO current_expiry 
    FROM public.institutes 
    WHERE id = inst_id;

    -- Calculate the new expiry date:
    -- If current expiry is in the past or NULL, we start from Now().
    -- If current expiry is in the future, we extend from that date.
    IF current_expiry IS NULL OR current_expiry < now() THEN
        new_expiry := now() + (key_record.duration_months * interval '1 month');
    ELSE
        new_expiry := current_expiry + (key_record.duration_months * interval '1 month');
    END IF;

    -- Update the Institute record
    UPDATE public.institutes 
    SET license_expiry = new_expiry,
        license_key = new_key
    WHERE id = inst_id;

    -- Mark the license key as 'used' and link it to this institute
    UPDATE public.license_keys 
    SET status = 'used',
        used_at = now(),
        used_by_institute_id = inst_id 
    WHERE key_code = new_key;

    -- Return a success message with the new date
    RETURN json_build_object(
        'success', true, 
        'message', 'License successfuly extended until ' || to_char(new_expiry, 'YYYY-MM-DD HH:MI AM'),
        'new_expiry', new_expiry
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update existing signup trigger to also set initial expiry
-- (Fixes the issue where new accounts didn't have an expiry date set)
CREATE OR REPLACE FUNCTION public.mark_license_as_used()
RETURNS trigger AS $$
DECLARE
    key_dur integer;
BEGIN
    -- Check if key exists and is available
    SELECT duration_months INTO key_dur 
    FROM public.license_keys 
    WHERE key_code = NEW.license_key AND status = 'active';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or already used License Key';
    END IF;

    -- Calculate and set the initial expiry date on the new institute
    NEW.license_expiry := now() + (key_dur * interval '1 month');

    -- Mark the key as 'used' in the license_keys table
    UPDATE public.license_keys 
    SET status = 'used',
        used_by_institute_id = NEW.id
    WHERE key_code = NEW.license_key;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Run this once to fix any institutes that currently have a NULL expiry date
-- (Gives them 12 months from their creation date as a starting point)
UPDATE public.institutes 
SET license_expiry = created_at + interval '12 months'
WHERE license_expiry IS NULL;
