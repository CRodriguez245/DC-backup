-- Detailed check of research_code_mappings policies

-- Check 1: List all policies
SELECT 
    'Policy List' AS check_type,
    tablename,
    policyname,
    cmd AS command_type,
    qual AS using_clause,
    with_check AS with_check_clause
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename = 'research_code_mappings'
ORDER BY cmd, policyname;

-- Check 2: Count policies
SELECT 
    'Policy Count' AS check_type,
    COUNT(*) AS policy_count,
    COUNT(*) FILTER (WHERE cmd = 'INSERT') AS insert_policy_count,
    COUNT(*) FILTER (WHERE cmd = 'SELECT') AS select_policy_count
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename = 'research_code_mappings';

-- Check 3: RLS status
SELECT 
    'RLS Status' AS check_type,
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename = 'research_code_mappings';

