-- Diagnostic script to check teacher account setup
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check if trigger exists
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_create_teacher';

-- 2. Check if function exists
SELECT 
    routine_name, 
    routine_type
FROM information_schema.routines
WHERE routine_name = 'auto_create_teacher'
AND routine_schema = 'public';

-- 3. Find all teacher users missing from teachers table
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    CASE 
        WHEN t.id IS NULL THEN 'MISSING TEACHER RECORD'
        ELSE 'OK'
    END as status
FROM public.users u
LEFT JOIN public.teachers t ON u.id = t.id
WHERE u.role = 'teacher'
ORDER BY u.created_at DESC
LIMIT 10;

-- 4. Check foreign key constraint on classrooms
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'classrooms'
    AND kcu.column_name = 'teacher_id';


