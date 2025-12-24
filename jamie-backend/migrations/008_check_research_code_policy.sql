-- Check research_code_mappings policies
SELECT 
    tablename,
    policyname,
    cmd AS command_type,
    qual AS using_clause,
    with_check AS with_check_clause
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename = 'research_code_mappings'
ORDER BY cmd, policyname;

-- Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename = 'research_code_mappings';

