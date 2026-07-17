-- 1. Create Profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  role text DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student', 'parent')),
  institute_id uuid REFERENCES public.institutes(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add institute_id to profiles if not already there
-- (Already included in create table, but for safety if it exists)
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institute_id uuid REFERENCES public.institutes(id);

-- 3. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
-- Users can read their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Owners can view all profiles in their institute
CREATE POLICY "Owners can view institute profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.institutes 
    WHERE institutes.id = profiles.institute_id 
    AND institutes.owner_id = auth.uid()
  )
);

-- 5. Trigger for new user signup
-- Automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'student');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
