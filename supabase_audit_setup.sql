-- 1. Create the audit_logs table
-- පද්ධතියේ සිදුවන සියලුම වෙනස්කම් ගබඩා කිරීමට table එකක් සාදමු
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    user_email text,
    action text NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    table_name text NOT NULL,
    record_id text,
    old_data jsonb,
    new_data jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. Create Policy (Only authenticated users can see logs - in production restrict to Admins)
CREATE POLICY "Allow authenticated users to view logs" ON public.audit_logs
    FOR SELECT TO authenticated USING (true);

-- 4. Central Function to handle logging from triggers
-- දත්ත වෙනස් වන විට ස්වයංක්‍රීයව ලොග් එකක් සෑදීමට function එකක්
CREATE OR REPLACE FUNCTION public.proc_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id uuid;
    v_user_email text;
BEGIN
    -- Get the current user ID and Email from the request metadata
    v_user_id := auth.uid();
    -- We try to get email from jwt if possible, otherwise null
    v_user_email := auth.jwt() ->> 'email';

    IF (TG_OP = 'DELETE') THEN
        INSERT INTO public.audit_logs (user_id, user_email, action, table_name, record_id, old_data)
        VALUES (v_user_id, v_user_email, TG_OP, TG_TABLE_NAME, OLD.id::text, row_to_json(OLD)::jsonb);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.audit_logs (user_id, user_email, action, table_name, record_id, old_data, new_data)
        VALUES (v_user_id, v_user_email, TG_OP, TG_TABLE_NAME, NEW.id::text, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (user_id, user_email, action, table_name, record_id, new_data)
        VALUES (v_user_id, v_user_email, TG_OP, TG_TABLE_NAME, NEW.id::text, row_to_json(NEW)::jsonb);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach triggers to important tables
-- වැදගත් ටේබල් වලට triggers සම්බන්ධ කිරීම

-- Payments Audit
DROP TRIGGER IF EXISTS tr_audit_payments ON public.payments;
CREATE TRIGGER tr_audit_payments
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.proc_audit_log();

-- Students Audit
DROP TRIGGER IF EXISTS tr_audit_students ON public.students;
CREATE TRIGGER tr_audit_students
AFTER INSERT OR UPDATE OR DELETE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.proc_audit_log();

-- Classes Audit
DROP TRIGGER IF EXISTS tr_audit_classes ON public.classes;
CREATE TRIGGER tr_audit_classes
AFTER INSERT OR UPDATE OR DELETE ON public.classes
FOR EACH ROW EXECUTE FUNCTION public.proc_audit_log();

-- Institutes Audit
DROP TRIGGER IF EXISTS tr_audit_institutes ON public.institutes;
CREATE TRIGGER tr_audit_institutes
AFTER INSERT OR UPDATE OR DELETE ON public.institutes
FOR EACH ROW EXECUTE FUNCTION public.proc_audit_log();
