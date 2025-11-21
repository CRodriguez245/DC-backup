-- Fix: Create missing teacher record for Ali's account
-- Run this in Supabase SQL Editor

-- First, find Ali's user ID
-- SELECT id, email, name, role FROM public.users WHERE email LIKE '%ali%' OR name ILIKE '%ali%';

-- Then insert the teacher record (replace USER_ID_HERE with Ali's actual user ID)
-- Or use this to find and fix all teacher accounts missing from teachers table:
INSERT INTO public.teachers (id, school, department)
SELECT u.id, '', ''
FROM public.users u
WHERE u.role = 'teacher'
AND NOT EXISTS (
  SELECT 1 FROM public.teachers t WHERE t.id = u.id
)
ON CONFLICT (id) DO NOTHING;


