-- Quick diagnostic: Check if current user has teacher record
-- Run this in Supabase SQL Editor while logged in as the teacher account

-- 1. Check current authenticated user
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_user_email;

-- 2. Check if user exists in users table
SELECT 
    id,
    email,
    name,
    role,
    created_at
FROM public.users
WHERE id = auth.uid();

-- 3. Check if teacher record exists
SELECT 
    t.id,
    t.school,
    t.department,
    t.created_at,
    CASE 
        WHEN t.id IS NULL THEN '❌ MISSING TEACHER RECORD'
        ELSE '✅ Teacher record exists'
    END as status
FROM public.users u
LEFT JOIN public.teachers t ON u.id = t.id
WHERE u.id = auth.uid()
AND u.role = 'teacher';

-- 4. Check if trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_create_teacher';



