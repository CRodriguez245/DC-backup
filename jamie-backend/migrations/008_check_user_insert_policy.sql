-- Check users table INSERT policy
SELECT 
    tablename,
    policyname,
    cmd AS command_type,
    qual AS using_clause,
    with_check AS with_check_clause
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename = 'users'
    AND cmd = 'INSERT';

-- Check if create_user_profile function exists
SELECT 
    p.proname AS function_name,
    pg_get_function_arguments(p.oid) AS arguments,
    pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname = 'create_user_profile';

