-- Simple fix for classroom creation issue
-- This ensures teacher records exist and RLS policy works

-- ============================================
-- STEP 1: Fix all missing teacher records
-- ============================================
INSERT INTO public.teachers (id, school, department)
SELECT u.id, '', ''
FROM public.users u
WHERE u.role = 'teacher'
AND NOT EXISTS (
    SELECT 1 FROM public.teachers t WHERE t.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 2: Update RLS policy to be simpler
-- ============================================
DROP POLICY IF EXISTS "classrooms_insert_own" ON public.classrooms;

-- Simple policy: teacher_id must match auth.uid()
-- The foreign key constraint ensures teacher exists in teachers table
CREATE POLICY "classrooms_insert_own" ON public.classrooms
    FOR INSERT
    WITH CHECK (teacher_id = auth.uid());

-- ============================================
-- STEP 3: Verify current user can create
-- ============================================
SELECT 
    'Current User Check' as check_type,
    auth.uid() as user_id,
    u.role,
    CASE 
        WHEN t.id IS NOT NULL THEN '✅ Ready to create classrooms'
        WHEN u.role = 'teacher' THEN '❌ Missing teacher record - run STEP 1 again'
        ELSE '❌ Not a teacher'
    END as status
FROM public.users u
LEFT JOIN public.teachers t ON u.id = t.id
WHERE u.id = auth.uid();


