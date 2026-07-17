-- materials table එකට Row Level Security (RLS) policies සැකසීම.
-- මෙය Supabase SQL Editor එකේ run කරන්න.

-- 1. materials table එක දැනට නැතිනම් එය සෑදීම
CREATE TABLE IF NOT EXISTS public.materials (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    institute_id uuid REFERENCES public.institutes(id) ON DELETE CASCADE,
    title text NOT NULL,
    subject text,
    grade text,
    teacher text,
    file_type text,
    file_size text,
    file_url text,
    download_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. RLS සක්‍රීය කිරීම
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- 3. කලින් තිබූ policies තිබේ නම් ඒවා ඉවත් කිරීම (වැරදි නිවැරදි කර ගැනීමට)
DROP POLICY IF EXISTS "Allow users to view materials from their institute" ON public.materials;
DROP POLICY IF EXISTS "Allow users to insert materials for their institute" ON public.materials;
DROP POLICY IF EXISTS "Allow users to update materials from their institute" ON public.materials;
DROP POLICY IF EXISTS "Allow users to delete materials from their institute" ON public.materials;

-- 4. දත්ත බැලීමට ඇති අවසරය (SELECT)
CREATE POLICY "Allow users to view materials from their institute"
ON public.materials
FOR SELECT
TO authenticated
USING (
    institute_id IN (
        SELECT id FROM public.institutes WHERE owner_id = auth.uid()
    )
);

-- 5. දත්ත ඇතුළත් කිරීමට ඇති අවසරය (INSERT)
CREATE POLICY "Allow users to insert materials for their institute"
ON public.materials
FOR INSERT
TO authenticated
WITH CHECK (
    institute_id IN (
        SELECT id FROM public.institutes WHERE owner_id = auth.uid()
    )
);

-- 6. දත්ත යාවත්කාලීන කිරීමට ඇති අවසරය (UPDATE)
CREATE POLICY "Allow users to update materials from their institute"
ON public.materials
FOR UPDATE
TO authenticated
USING (
    institute_id IN (
        SELECT id FROM public.institutes WHERE owner_id = auth.uid()
    )
)
WITH CHECK (
    institute_id IN (
        SELECT id FROM public.institutes WHERE owner_id = auth.uid()
    )
);

-- 7. දත්ත මැකීමට ඇති අවසරය (DELETE)
CREATE POLICY "Allow users to delete materials from their institute"
ON public.materials
FOR DELETE
TO authenticated
USING (
    institute_id IN (
        SELECT id FROM public.institutes WHERE owner_id = auth.uid()
    )
);

-- 8. Storage bucket සහ අවසරයන් සකස් කිරීම්
-- class_materials bucket එක සෑදීම
INSERT INTO storage.buckets (id, name, public) 
VALUES ('class_materials', 'class_materials', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies ඉවත් කර නැවත සෑදීම
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- Storage එකෙන් දත්ත බැලීමට (SELECT)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'class_materials' );

-- දත්ත ඇතුළත් කිරීමට (INSERT)
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'class_materials' );

-- දත්ත යාවත්කාලීන කිරීමට (UPDATE)
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'class_materials' );

-- දත්ත මැකීමට (DELETE)
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'class_materials' );
