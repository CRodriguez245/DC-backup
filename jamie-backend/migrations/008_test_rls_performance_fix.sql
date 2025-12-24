-- ============================================================================
-- Test Suite: RLS Performance Fix Verification
-- Purpose: Comprehensive tests to ensure RLS policies work correctly after optimization
-- Date: 2024-12-21
-- ============================================================================
--
-- NOTE: Some tests require authenticated context and should be run from the application
-- Tests marked with [APP TEST] need to be run via application/API with actual user sessions
--
-- ============================================================================

-- ============================================================================
-- TEST 1: Verify All Policies Are Optimized
-- ============================================================================

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
    AND (qual::text LIKE '%auth.uid()%' OR with_check::text LIKE '%auth.uid()%');

-- Expected: optimized_count = total_count = 28, result = ✅ PASS

-- ============================================================================
-- TEST 2: Verify All Required Policies Exist
-- ============================================================================

SELECT 
    'TEST 2: Required Policies Exist' AS test_name,
    COUNT(*) AS existing_policies,
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
    AND (qual::text LIKE '%auth.uid()%' OR with_check::text LIKE '%auth.uid()%');

-- Expected: existing_policies = 28, result = ✅ PASS

-- ============================================================================
-- TEST 3: Verify RLS Is Enabled On All Tables
-- ============================================================================

SELECT 
    'TEST 3: RLS Enabled On All Tables' AS test_name,
    COUNT(*) AS tables_with_rls,
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
    AND rowsecurity = true;

-- Expected: tables_with_rls = 10, result = ✅ PASS

-- ============================================================================
-- TEST 4: Verify Policy Names Match Expected Pattern
-- ============================================================================

SELECT 
    'TEST 4: Policy Naming Pattern' AS test_name,
    COUNT(*) AS matching_policies,
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
    );

-- Expected: matching_policies >= 20, result = ✅ PASS

-- ============================================================================
-- TEST 5: Verify Helper Functions Still Exist (used by some policies)
-- ============================================================================

SELECT 
    'TEST 5: Helper Functions Exist' AS test_name,
    COUNT(*) AS helper_functions,
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
    );

-- Expected: helper_functions = 5, result = ✅ PASS

-- ============================================================================
-- APPLICATION-LEVEL TESTS (Must be run from application with authenticated users)
-- ============================================================================

-- NOTE: The following tests require authenticated user context
-- Run these from your application/API with actual user sessions

/*
[APP TEST] TEST 6: Student Can Access Own Data
-----------------------------------------------
Test: As an authenticated student, verify they can:
  - SELECT their own user record
  - SELECT their own sessions
  - SELECT their own messages
  - SELECT their own student_progress
  - SELECT their own dq_analytics
  - INSERT their own sessions
  - INSERT their own messages
  - UPDATE their own user record
  
Expected: All operations succeed

[APP TEST] TEST 7: Student Cannot Access Other Students' Data
-------------------------------------------------------------
Test: As an authenticated student, verify they CANNOT:
  - SELECT other students' user records
  - SELECT other students' sessions
  - SELECT other students' messages
  - SELECT other students' progress/analytics
  - INSERT sessions for other students
  - UPDATE other students' records
  
Expected: All operations fail with permission denied (42501)

[APP TEST] TEST 8: Teacher Can Access Own Students' Data
--------------------------------------------------------
Test: As an authenticated teacher, verify they can:
  - SELECT students enrolled in their classrooms
  - SELECT sessions of their students
  - SELECT messages of their students
  - SELECT progress/analytics of their students
  - SELECT their own teacher record
  - SELECT their own classrooms
  - SELECT enrollments in their classrooms
  
Expected: All operations succeed

[APP TEST] TEST 9: Teacher Cannot Access Other Teachers' Students
-----------------------------------------------------------------
Test: As an authenticated teacher, verify they CANNOT:
  - SELECT students not in their classrooms
  - SELECT sessions of other teachers' students
  - SELECT messages of other teachers' students
  - SELECT progress/analytics of other teachers' students
  - UPDATE other teachers' classrooms
  - SELECT other teachers' teacher records
  
Expected: All operations fail with permission denied (42501)

[APP TEST] TEST 10: Unauthenticated User Access
------------------------------------------------
Test: As an unauthenticated user, verify they CANNOT:
  - SELECT any user records (except maybe public ones)
  - SELECT any sessions
  - SELECT any messages
  - SELECT any progress/analytics
  - INSERT any data (except maybe registration)
  
Expected: All operations fail with permission denied (42501)

[APP TEST] TEST 11: Performance Verification
---------------------------------------------
Test: Compare query performance before/after optimization:
  - Run a query that returns many rows (e.g., teacher viewing all student sessions)
  - Measure execution time
  - Compare with baseline (if available)
  
Expected: Performance should be equal or better than before
Note: May not see significant improvement with small datasets, but should scale better

[APP TEST] TEST 12: Research Code Mapping Access
------------------------------------------------
Test: As an authenticated user, verify:
  - Can INSERT into research_code_mappings (for their own user_id)
  - CANNOT SELECT from research_code_mappings (reverse lookup prevention)
  
Expected: INSERT succeeds, SELECT fails with permission denied (42501)
*/

-- ============================================================================
-- SUMMARY TEST QUERY
-- ============================================================================

-- Run all automated tests at once
SELECT 
    '=== RLS PERFORMANCE FIX TEST SUMMARY ===' AS summary;

-- Test 1: Optimization Check
SELECT 
    'TEST 1: Policy Optimization' AS test,
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
    AND (qual::text LIKE '%auth.uid()%' OR with_check::text LIKE '%auth.uid()%');

-- Test 2: RLS Enabled
SELECT 
    'TEST 2: RLS Enabled' AS test,
    CASE 
        WHEN COUNT(*) >= 10 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END AS result
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN (
        'users', 'teachers', 'classrooms', 'enrollments', 
        'sessions', 'messages', 'student_progress', 'dq_analytics',
        'research_exports', 'research_code_mappings'
    )
    AND rowsecurity = true;

-- Test 3: Helper Functions
SELECT 
    'TEST 3: Helper Functions' AS test,
    CASE 
        WHEN COUNT(*) >= 5 THEN '✅ PASS'
        ELSE '⚠️ WARN'
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
    );

-- ============================================================================
-- NOTES
-- ============================================================================

/*
COMPLETE TEST CHECKLIST:

✅ Automated Tests (run in SQL Editor):
  1. Policy optimization check
  2. All policies exist
  3. RLS enabled on all tables
  4. Policy naming pattern
  5. Helper functions exist

⏳ Application Tests (run from your app/API):
  6. Student can access own data
  7. Student cannot access other students' data
  8. Teacher can access own students' data
  9. Teacher cannot access other teachers' students
  10. Unauthenticated user access blocked
  11. Performance verification
  12. Research code mapping access control

RECOMMENDED: Run automated tests first, then application tests
*/

