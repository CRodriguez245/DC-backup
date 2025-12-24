-- ============================================================================
-- Verification Script: 008_verify_rls_performance_fix.sql
-- Purpose: Verify that RLS performance fix (Type 1) was applied correctly
-- Date: 2024-12-21
-- ============================================================================

-- ============================================================================
-- VERIFICATION 1: Check if policies use (select auth.uid())
-- ============================================================================

-- Check policies that should now use (select auth.uid())
-- Note: PostgreSQL normalizes to ( SELECT auth.uid() AS uid)
SELECT 
    schemaname,
    tablename,
    policyname,
    CASE 
        WHEN qual::text LIKE '%( SELECT auth.uid()%' OR with_check::text LIKE '%( SELECT auth.uid()%'
           OR qual::text LIKE '%(select auth.uid()%' OR with_check::text LIKE '%(select auth.uid()%'
        THEN '✅ Optimized'
        WHEN qual::text LIKE '%auth.uid()%' OR with_check::text LIKE '%auth.uid()%'
        THEN '❌ Not optimized (direct auth.uid())'
        ELSE '⚠️ No auth.uid() found'
    END AS optimization_status,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN (
        'users', 'teachers', 'classrooms', 'enrollments', 
        'sessions', 'messages', 'student_progress', 'dq_analytics',
        'research_exports', 'research_code_mappings'
    )
ORDER BY tablename, policyname;

-- ============================================================================
-- VERIFICATION 2: Count optimized policies
-- ============================================================================

-- Count policies with optimization
-- Note: PostgreSQL normalizes to ( SELECT auth.uid() AS uid)
SELECT 
    COUNT(*) FILTER (
        WHERE qual::text LIKE '%( SELECT auth.uid()%' OR with_check::text LIKE '%( SELECT auth.uid()%'
           OR qual::text LIKE '%(select auth.uid()%' OR with_check::text LIKE '%(select auth.uid()%'
    ) AS optimized_policies,
    COUNT(*) FILTER (WHERE qual::text LIKE '%auth.uid()%' OR with_check::text LIKE '%auth.uid()%') AS total_policies_with_auth_uid,
    COUNT(*) AS total_policies_checked
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN (
        'users', 'teachers', 'classrooms', 'enrollments', 
        'sessions', 'messages', 'student_progress', 'dq_analytics',
        'research_exports', 'research_code_mappings'
    )
    AND (qual::text LIKE '%auth.uid()%' OR with_check::text LIKE '%auth.uid()%');

-- Expected: optimized_policies should equal total_policies_with_auth_uid
-- (All policies using auth.uid() should be optimized)

-- ============================================================================
-- VERIFICATION 3: Check specific tables (detailed)
-- ============================================================================

-- Users table policies
SELECT 
    'users' AS table_name,
    policyname,
    cmd AS command_type,
    CASE 
        WHEN qual::text LIKE '%( SELECT auth.uid()%' OR with_check::text LIKE '%( SELECT auth.uid()%'
           OR qual::text LIKE '%(select auth.uid()%' OR with_check::text LIKE '%(select auth.uid()%'
        THEN '✅ Optimized'
        WHEN qual::text LIKE '%auth.uid()%' OR with_check::text LIKE '%auth.uid()%'
        THEN '❌ Not optimized'
        ELSE '⚠️ No auth.uid()'
    END AS status
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY policyname;

-- Teachers table policies
SELECT 
    'teachers' AS table_name,
    policyname,
    cmd AS command_type,
    CASE 
        WHEN qual::text LIKE '%( SELECT auth.uid()%' OR with_check::text LIKE '%( SELECT auth.uid()%'
           OR qual::text LIKE '%(select auth.uid()%' OR with_check::text LIKE '%(select auth.uid()%'
        THEN '✅ Optimized'
        WHEN qual::text LIKE '%auth.uid()%' OR with_check::text LIKE '%auth.uid()%'
        THEN '❌ Not optimized'
        ELSE '⚠️ No auth.uid()'
    END AS status
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'teachers'
ORDER BY policyname;

-- ============================================================================
-- VERIFICATION 4: Check Supabase security dashboard
-- ============================================================================

-- Note: The Supabase security dashboard should now show 0 Type 1 issues
-- (28 issues should be resolved)
-- 
-- To verify:
-- 1. Go to Supabase Dashboard
-- 2. Navigate to Database → Security
-- 3. Check for "RLS Performance" issues
-- 4. Should see 0 Type 1 issues (re-evaluation of auth.uid())

-- ============================================================================
-- VERIFICATION 5: Functional test queries (manual testing required)
-- ============================================================================

-- These should work the same as before (functionally identical):

-- Test 1: User can access their own record
-- (Run as authenticated user)
-- SELECT * FROM users WHERE id = auth.uid();

-- Test 2: Teacher can access their students
-- (Run as authenticated teacher)
-- SELECT * FROM users WHERE role = 'student';

-- Test 3: Student can access their own sessions
-- (Run as authenticated student)
-- SELECT * FROM sessions WHERE student_id = auth.uid();

-- Note: These tests require actual authentication context
-- Run them from your application or Supabase client

-- ============================================================================
-- SUMMARY
-- ============================================================================

-- Expected Results:
-- ✅ All 28 policies should show '✅ Optimized'
-- ✅ optimized_policies count should equal total_policies_with_auth_uid
-- ✅ Supabase security dashboard should show 0 Type 1 issues
-- ✅ Application should function identically (just faster)
--
-- Note: PostgreSQL normalizes expressions to ( SELECT auth.uid() AS uid)
-- The verification checks for both formats to handle normalization

-- If any policy shows '❌ Not optimized', re-run migration 008

-- ============================================================================

