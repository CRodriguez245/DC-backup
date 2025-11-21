-- Diagnose why RLS is blocking profile access
-- Run this in Supabase SQL Editor while logged in as the affected user

-- Step 1: Check if profile exists
SELECT 
    'Profile Exists' as check_type,
    id,
    email,
    name,
    role,
    created_at
FROM public.users
WHERE id = '38d483c4-2596-4fb0-8a1d-eab031e08e73'; -- Replace with actual user ID

-- Step 2: Check auth.uid() vs profile ID
SELECT 
    'Auth Match Check' as check_type,
    auth.uid() as current_auth_uid,
    '38d483c4-2596-4fb0-8a1d-eab031e08e73' as profile_id,
    CASE 
        WHEN auth.uid() = '38d483c4-2596-4fb0-8a1d-eab031e08e73' THEN '✅ IDs match - RLS should allow'
        WHEN auth.uid() IS NULL THEN '❌ Not authenticated'
        ELSE '❌ IDs do not match - RLS will block'
    END as status;

-- Step 3: Test RLS policy directly
SELECT 
    'RLS Policy Test' as check_type,
    u.id,
    u.email,
    u.name,
    CASE 
        WHEN u.id = auth.uid() THEN '✅ RLS allows access'
        ELSE '❌ RLS blocks access'
    END as rls_result
FROM public.users u
WHERE u.id = '38d483c4-2596-4fb0-8a1d-eab031e08e73'
AND u.id = auth.uid();

-- Step 4: Check RLS policy definition
SELECT 
    'RLS Policy Definition' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual as using_clause,
    with_check
FROM pg_policies
WHERE tablename = 'users'
AND policyname = 'users_select_own';

-- Step 5: Check if RLS is enabled
SELECT 
    'RLS Enabled Check' as check_type,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'users';


