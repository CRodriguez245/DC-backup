-- ============================================================================
-- Quick Check: Do policies exist and what do they contain?
-- ============================================================================

-- Simple check: List all policies and their expressions
SELECT 
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename = 'teachers'
ORDER BY policyname;

-- Check if we can see (select auth.uid()) in the text
SELECT 
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual::text LIKE '%(select auth.uid())%' OR with_check::text LIKE '%(select auth.uid())%'
        THEN '✅ Has (select auth.uid())'
        WHEN qual::text LIKE '%auth.uid()%' OR with_check::text LIKE '%auth.uid()%'
        THEN '❌ Has auth.uid() directly'
        ELSE '⚠️ No match'
    END AS status,
    qual::text AS using_clause,
    with_check::text AS with_check_clause
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename IN ('teachers', 'users', 'sessions')
    AND (qual::text LIKE '%auth.uid()%' OR with_check::text LIKE '%auth.uid()%')
ORDER BY tablename, policyname;

