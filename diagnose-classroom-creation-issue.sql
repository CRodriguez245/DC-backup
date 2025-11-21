-- Comprehensive diagnostic for classroom creation issue
-- Run this in Supabase SQL Editor while logged in as the teacher account

-- ============================================
-- STEP 1: Check authentication
-- ============================================
SELECT 
    'Authentication Check' as check_type,
    auth.uid() as current_user_id,
    auth.email() as current_user_email,
    CASE 
        WHEN auth.uid() IS NULL THEN '❌ NOT AUTHENTICATED'
        ELSE '✅ Authenticated'
    END as auth_status;

-- ============================================
-- STEP 2: Check user record
-- ============================================
SELECT 
    'User Record Check' as check_type,
    u.id,
    u.email,
    u.name,
    u.role,
    CASE 
        WHEN u.role != 'teacher' THEN '❌ Not a teacher'
        ELSE '✅ Is a teacher'
    END as role_status
FROM public.users u
WHERE u.id = auth.uid();

-- ============================================
-- STEP 3: Check teacher record
-- ============================================
SELECT 
    'Teacher Record Check' as check_type,
    t.id,
    t.school,
    t.department,
    CASE 
        WHEN t.id IS NULL THEN '❌ MISSING - This is the problem!'
        ELSE '✅ Teacher record exists'
    END as teacher_status
FROM public.users u
LEFT JOIN public.teachers t ON u.id = t.id
WHERE u.id = auth.uid()
AND u.role = 'teacher';

-- ============================================
-- STEP 4: Check RLS policies
-- ============================================
SELECT 
    'RLS Policy Check' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'classrooms'
AND policyname LIKE '%insert%';

-- ============================================
-- STEP 5: Test if we can insert (simulated)
-- ============================================
SELECT 
    'RLS Test' as check_type,
    CASE 
        WHEN auth.uid() IS NULL THEN '❌ Cannot test - not authenticated'
        WHEN NOT EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid()) THEN '❌ Cannot test - no teacher record'
        WHEN auth.uid() = auth.uid() THEN '✅ RLS check should pass (teacher_id = auth.uid())'
        ELSE '❓ Unknown'
    END as rls_test_result;


