-- Fix RLS policy for classroom creation
-- This ensures teachers can create classrooms even if there are timing issues

-- ============================================
-- STEP 1: Drop existing insert policy
-- ============================================
DROP POLICY IF EXISTS "classrooms_insert_own" ON public.classrooms;

-- ============================================
-- STEP 2: Create improved insert policy
-- ============================================
-- This policy explicitly checks:
-- 1. teacher_id matches auth.uid()
-- 2. User has role='teacher' in users table
-- 3. User exists in teachers table (for foreign key)
CREATE POLICY "classrooms_insert_own" ON public.classrooms
    FOR INSERT
    WITH CHECK (
        teacher_id = auth.uid()
        AND EXISTS (
            SELECT 1 
            FROM public.users u
            WHERE u.id = auth.uid()
            AND u.role = 'teacher'
        )
        AND EXISTS (
            SELECT 1 
            FROM public.teachers t
            WHERE t.id = auth.uid()
        )
    );

-- ============================================
-- STEP 3: Ensure all teacher accounts have records
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
-- STEP 4: Verify the fix
-- ============================================
SELECT 
    'Policy Check' as check_type,
    policyname,
    cmd,
    with_check
FROM pg_policies
WHERE tablename = 'classrooms'
AND policyname = 'classrooms_insert_own';

SELECT 
    'Teacher Records Check' as check_type,
    COUNT(*) as total_teachers,
    COUNT(t.id) as with_records,
    COUNT(*) - COUNT(t.id) as missing
FROM public.users u
LEFT JOIN public.teachers t ON u.id = t.id
WHERE u.role = 'teacher';


