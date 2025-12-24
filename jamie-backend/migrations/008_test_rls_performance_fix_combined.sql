-- ============================================================================
-- Combined Test Suite: RLS Performance Fix Verification
-- Purpose: All tests in a single result set for easy viewing
-- Date: 2024-12-21
-- ============================================================================

-- Combined test results - run this query to see all tests at once
SELECT 
    'TEST 1: Policy Optimization Check' AS test_name,
    COUNT(*) FILTER (
        WHERE qual::text LIKE '%( SELECT auth.uid()%' OR with_check::text LIKE '%( SELECT auth.uid()%'
           OR qual::text LIKE '%(select auth.uid()%' OR with_check::text LIKE '%(select auth.uid()%'
    ) AS optimized_count,
    COUNT(*) FILTER (WHERE qual::text LIKE '%auth.uid()%' OR with_check::text LIKE '%auth.uid()%') AS total_count,
    CASE 
        WHEN COUNT(*) FILTER (
            WHERE qual::text LIKE '%( SELECT auth.uid()%' OR with_check::text LIKE '%( SELECT auth.uid()%'
               OR qual::text LIKE '%(select auth.uid()%' OR with_check::text LIKE '%(select auth.uid()%'
        ) = COUNT(*) FILTER (WHERE qual::text LIKE '%auth.uid()%' OR with_check::text LIKE '%auth.uid()%')
        THEN '✅ PASS'
        ELSE '❌ FAIL'
    END AS result
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN (
        'users', 'teachers', 'classrooms', 'enrollments', 
        'sessions', 'messages', 'student_progress', 'dq_analytics',
        'research_exports', 'research_code_mappings'
    )
    AND (qual::text LIKE '%auth.uid()%' OR with_check::text LIKE '%auth.uid()%')

UNION ALL

SELECT 
    'TEST 2: Required Policies Exist' AS test_name,
    COUNT(*) AS optimized_count,
    NULL AS total_count,
    CASE 
        WHEN COUNT(*) >= 28 THEN '✅ PASS'
        ELSE '❌ FAIL - Missing policies'
    END AS result
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN (
        'users', 'teachers', 'classrooms', 'enrollments', 
        'sessions', 'messages', 'student_progress', 'dq_analytics',
        'research_exports', 'research_code_mappings'
    )
    AND (qual::text LIKE '%auth.uid()%' OR with_check::text LIKE '%auth.uid()%')

UNION ALL

SELECT 
    'TEST 3: RLS Enabled On All Tables' AS test_name,
    COUNT(*) AS optimized_count,
    NULL AS total_count,
    CASE 
        WHEN COUNT(*) >= 10 THEN '✅ PASS'
        ELSE '❌ FAIL - Some tables missing RLS'
    END AS result
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN (
        'users', 'teachers', 'classrooms', 'enrollments', 
        'sessions', 'messages', 'student_progress', 'dq_analytics',
        'research_exports', 'research_code_mappings'
    )
    AND rowsecurity = true

UNION ALL

SELECT 
    'TEST 4: Policy Naming Pattern' AS test_name,
    COUNT(*) AS optimized_count,
    NULL AS total_count,
    CASE 
        WHEN COUNT(*) >= 20 THEN '✅ PASS'
        ELSE '⚠️ WARN - Some policies may have non-standard names'
    END AS result
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN (
        'users', 'teachers', 'classrooms', 'enrollments', 
        'sessions', 'messages', 'student_progress', 'dq_analytics'
    )
    AND (
        policyname LIKE '%_select_%' 
        OR policyname LIKE '%_insert_%' 
        OR policyname LIKE '%_update_%'
        OR policyname LIKE '%own%'
        OR policyname LIKE '%teacher%'
    )

UNION ALL

SELECT 
    'TEST 5: Helper Functions Exist' AS test_name,
    COUNT(*) AS optimized_count,
    NULL AS total_count,
    CASE 
        WHEN COUNT(*) >= 5 THEN '✅ PASS'
        ELSE '⚠️ WARN - Some helper functions missing'
    END AS result
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN (
        'is_teacher_of_student',
        'get_session_student_id',
        'is_classroom_owned_by_teacher',
        'is_student_enrolled_with_teacher',
        'is_user_student'
    )

ORDER BY test_name;

-- ============================================================================
-- Expected Results:
-- ============================================================================
-- TEST 1: optimized_count = 28, total_count = 28, result = ✅ PASS
-- TEST 2: optimized_count >= 28, result = ✅ PASS
-- TEST 3: optimized_count >= 10, result = ✅ PASS
-- TEST 4: optimized_count >= 20, result = ✅ PASS
-- TEST 5: optimized_count >= 5, result = ✅ PASS
-- ============================================================================

