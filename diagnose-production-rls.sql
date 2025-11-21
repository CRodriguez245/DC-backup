-- Diagnose RLS policy issue on production
-- Run this in Supabase SQL Editor while logged in as the affected user

-- Step 1: Check if profile exists
SELECT 
    'Profile Exists Check' as check_type,
    id,
    email,
    name,
    role,
    created_at
FROM public.users
WHERE id = 'fc44bd2c-b5f1-4d49-a3a4-2ac3406b6dd4'; -- Replace with actual user ID from error

-- Step 2: Check auth.uid() vs profile ID
SELECT 
    'Auth Match Check' as check_type,
    auth.uid() as current_auth_uid,
    'fc44bd2c-b5f1-4d49-a3a4-2ac3406b6dd4' as profile_id,
    CASE 
        WHEN auth.uid() = 'fc44bd2c-b5f1-4d49-a3a4-2ac3406b6dd4' THEN '✅ IDs match - RLS should allow'
        WHEN auth.uid() IS NULL THEN '❌ Not authenticated'
        ELSE '❌ IDs do not match - RLS will block'
    END as status;

-- Step 3: Test RLS policy directly (this should work if policy is correct)
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
WHERE u.id = 'fc44bd2c-b5f1-4d49-a3a4-2ac3406b6dd4'
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
    qual as using_clause
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

-- Step 6: Test if we can read our own profile (should return 1 row)
SELECT COUNT(*) as can_read_own_profile
FROM public.users
WHERE id = auth.uid();


