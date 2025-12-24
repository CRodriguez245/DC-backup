-- ============================================================================
-- Diagnostic Script: Check actual policy definitions
-- Purpose: See what the policies actually contain
-- ============================================================================

-- Check the actual policy definitions for teachers table
SELECT 
    tablename,
    policyname,
    cmd AS command_type,
    qual AS using_clause,
    with_check AS with_check_clause,
    CASE 
        WHEN qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%'
        THEN '✅ Has (select auth.uid())'
        WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%'
        THEN '❌ Still using auth.uid() directly'
        ELSE '⚠️ No auth.uid() found'
    END AS optimization_status
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename = 'teachers'
ORDER BY policyname;

-- Check a few more tables to see the pattern
SELECT 
    tablename,
    policyname,
    cmd AS command_type,
    CASE 
        WHEN qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%'
        THEN '✅ Optimized'
        WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%'
        THEN '❌ Not optimized'
        ELSE 'N/A'
    END AS status,
    LEFT(qual, 100) AS using_preview,
    LEFT(with_check, 100) AS with_check_preview
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('users', 'teachers', 'classrooms', 'sessions')
    AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
ORDER BY tablename, policyname
LIMIT 20;

