-- Quick fix: Create teacher record for current authenticated user
-- Run this in Supabase SQL Editor while logged in as the teacher account

-- This will create a teacher record for the currently authenticated user
-- if they have role='teacher' and don't already have a record

INSERT INTO public.teachers (id, school, department)
SELECT 
    u.id,
    '',
    ''
FROM public.users u
WHERE u.id = auth.uid()
AND u.role = 'teacher'
AND NOT EXISTS (
    SELECT 1 FROM public.teachers t WHERE t.id = u.id
)
ON CONFLICT (id) DO NOTHING
RETURNING id, school, department;

-- Verify it was created
SELECT 
    '✅ Teacher record created!' as status,
    t.id,
    t.school,
    t.department
FROM public.teachers t
WHERE t.id = auth.uid();


