-- ============================================================================
-- Complete Verification: All 28 RLS Policies
-- Purpose: Show optimization status for all policies across all tables
-- Date: 2024-12-21
-- ============================================================================

-- Complete list of all policies with optimization status
SELECT 
    tablename,
    policyname,
    cmd AS command_type,
    CASE 
        WHEN qual::text LIKE '%( SELECT auth.uid()%' OR with_check::text LIKE '%( SELECT auth.uid()%'
           OR qual::text LIKE '%(select auth.uid()%' OR with_check::text LIKE '%(select auth.uid()%'
        THEN '✅ Optimized'
        WHEN qual::text LIKE '%auth.uid()%' OR with_check::text LIKE '%auth.uid()%'
        THEN '❌ Not optimized (direct auth.uid())'
        ELSE '⚠️ No auth.uid() found'
    END AS optimization_status
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN (
        'users', 'teachers', 'classrooms', 'enrollments', 
        'sessions', 'messages', 'student_progress', 'dq_analytics',
        'research_exports', 'research_code_mappings'
    )
    AND (qual::text LIKE '%auth.uid()%' OR with_check::text LIKE '%auth.uid()%')
ORDER BY tablename, policyname;

-- ============================================================================
-- Summary Count
-- ============================================================================

SELECT 
    COUNT(*) FILTER (
        WHERE qual::text LIKE '%( SELECT auth.uid()%' OR with_check::text LIKE '%( SELECT auth.uid()%'
           OR qual::text LIKE '%(select auth.uid()%' OR with_check::text LIKE '%(select auth.uid()%'
    ) AS optimized_policies,
    COUNT(*) FILTER (WHERE qual::text LIKE '%auth.uid()%' OR with_check::text LIKE '%auth.uid()%') AS total_policies_with_auth_uid,
    COUNT(*) AS total_policies_checked,
    CASE 
        WHEN COUNT(*) FILTER (
            WHERE qual::text LIKE '%( SELECT auth.uid()%' OR with_check::text LIKE '%( SELECT auth.uid()%'
               OR qual::text LIKE '%(select auth.uid()%' OR with_check::text LIKE '%(select auth.uid()%'
        ) = COUNT(*) FILTER (WHERE qual::text LIKE '%auth.uid()%' OR with_check::text LIKE '%auth.uid()%')
        THEN '✅ ALL OPTIMIZED'
        ELSE '❌ SOME NOT OPTIMIZED'
    END AS overall_status
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN (
        'users', 'teachers', 'classrooms', 'enrollments', 
        'sessions', 'messages', 'student_progress', 'dq_analytics',
        'research_exports', 'research_code_mappings'
    )
    AND (qual::text LIKE '%auth.uid()%' OR with_check::text LIKE '%auth.uid()%');

-- Expected Result:
-- optimized_policies: 28
-- total_policies_with_auth_uid: 28
-- overall_status: ✅ ALL OPTIMIZED

