-- ============================================================================
-- Check Raw Policy Definitions from pg_policy system catalog
-- Purpose: See exactly what PostgreSQL stores for policies
-- ============================================================================

-- Method 1: Check pg_policies view (what Supabase shows)
SELECT 
    tablename,
    policyname,
    cmd AS command_type,
    qual AS using_expression,
    with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename = 'teachers'
ORDER BY policyname;

-- Method 2: Check raw pg_policy catalog (more detailed)
SELECT 
    p.polname AS policy_name,
    t.relname AS table_name,
    CASE p.polcmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        ELSE 'ALL'
    END AS command_type,
    pg_get_expr(p.polqual, p.polrelid) AS using_clause,
    pg_get_expr(p.polwithcheck, p.polrelid) AS with_check_clause
FROM pg_policy p
JOIN pg_class t ON p.polrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE n.nspname = 'public'
    AND t.relname = 'teachers'
ORDER BY p.polname;

-- Method 3: Check if (select auth.uid()) exists in actual expressions
SELECT 
    t.relname AS table_name,
    p.polname AS policy_name,
    CASE p.polcmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        ELSE 'ALL'
    END AS command_type,
    pg_get_expr(p.polqual, p.polrelid) LIKE '%(select auth.uid())%' OR 
    pg_get_expr(p.polwithcheck, p.polrelid) LIKE '%(select auth.uid())%' AS has_optimization,
    pg_get_expr(p.polqual, p.polrelid) LIKE '%auth.uid()%' OR 
    pg_get_expr(p.polwithcheck, p.polrelid) LIKE '%auth.uid()%' AS has_auth_uid,
    LEFT(pg_get_expr(p.polqual, p.polrelid), 150) AS using_expr_preview,
    LEFT(pg_get_expr(p.polwithcheck, p.polrelid), 150) AS with_check_expr_preview
FROM pg_policy p
JOIN pg_class t ON p.polrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE n.nspname = 'public'
    AND t.relname IN ('users', 'teachers', 'classrooms', 'sessions')
    AND (
        pg_get_expr(p.polqual, p.polrelid) LIKE '%auth.uid()%' OR 
        pg_get_expr(p.polwithcheck, p.polrelid) LIKE '%auth.uid()%'
    )
ORDER BY t.relname, p.polname;

