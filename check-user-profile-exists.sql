-- Check if user profile exists and RLS access
-- Replace USER_ID_HERE with the actual user ID from the error

-- Check 1: Does the profile exist in the users table?
SELECT 
    'Profile Exists Check' as check_type,
    id,
    email,
    name,
    role,
    created_at
FROM public.users
WHERE id = '38d483c4-2596-4fb0-8a1d-eab031e08e73'; -- Replace with actual user ID

-- Check 2: What does auth.uid() return? (Run this while logged in as that user)
SELECT 
    'Auth Check' as check_type,
    auth.uid() as current_auth_uid,
    '38d483c4-2596-4fb0-8a1d-eab031e08e73' as expected_user_id,
    CASE 
        WHEN auth.uid() = '38d483c4-2596-4fb0-8a1d-eab031e08e73' THEN '✅ IDs match'
        WHEN auth.uid() IS NULL THEN '❌ Not authenticated'
        ELSE '❌ IDs do not match'
    END as auth_status;

-- Check 3: Can the current user see their own profile? (Run while logged in)
SELECT 
    'RLS Access Check' as check_type,
    u.id,
    u.email,
    u.name,
    CASE 
        WHEN u.id = auth.uid() THEN '✅ RLS should allow access'
        ELSE '❌ RLS will block (IDs do not match)'
    END as rls_status
FROM public.users u
WHERE u.id = auth.uid()
LIMIT 1;

-- Check 4: Verify RLS policy exists
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
WHERE tablename = 'users'
AND policyname LIKE '%select%';


