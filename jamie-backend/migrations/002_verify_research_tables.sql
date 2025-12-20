-- ============================================================================
-- Verification Script for Research Tables Migration
-- Purpose: Verify that all tables, indexes, and RLS policies were created correctly
-- Run this AFTER running 001_create_research_tables.sql
-- ============================================================================

-- ============================================================================
-- 1. VERIFY TABLES EXIST
-- ============================================================================
SELECT 
    'Tables Check' AS verification_step,
    table_name,
    CASE 
        WHEN table_name IN ('research_sessions', 'research_messages', 'research_code_mappings') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END AS status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name LIKE 'research_%'
ORDER BY table_name;

-- Expected: 3 rows (research_sessions, research_messages, research_code_mappings)

-- ============================================================================
-- 2. VERIFY RLS IS ENABLED
-- ============================================================================
SELECT 
    'RLS Check' AS verification_step,
    tablename AS table_name,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS ENABLED'
        ELSE '❌ RLS DISABLED'
    END AS status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename LIKE 'research_%'
ORDER BY tablename;

-- Expected: All 3 tables should show "✅ RLS ENABLED"

-- ============================================================================
-- 3. VERIFY INDEXES WERE CREATED
-- ============================================================================
SELECT 
    'Indexes Check' AS verification_step,
    tablename AS table_name,
    indexname AS index_name,
    '✅ EXISTS' AS status
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename LIKE 'research_%'
ORDER BY tablename, indexname;

-- Expected: Multiple indexes (one per table at minimum)

-- Count of indexes per table (for quick check):
SELECT 
    'Index Count' AS verification_step,
    tablename AS table_name,
    COUNT(*) AS index_count,
    CASE 
        WHEN tablename = 'research_sessions' AND COUNT(*) >= 4 THEN '✅ SUFFICIENT'
        WHEN tablename = 'research_messages' AND COUNT(*) >= 4 THEN '✅ SUFFICIENT'
        WHEN tablename = 'research_code_mappings' AND COUNT(*) >= 1 THEN '✅ SUFFICIENT'
        ELSE '⚠️ CHECK MANUALLY'
    END AS status
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename LIKE 'research_%'
GROUP BY tablename
ORDER BY tablename;

-- ============================================================================
-- 4. VERIFY CONSTRAINTS AND CHECKS
-- ============================================================================
SELECT 
    'Constraints Check' AS verification_step,
    table_name,
    constraint_name,
    constraint_type,
    '✅ EXISTS' AS status
FROM information_schema.table_constraints
WHERE table_schema = 'public'
    AND table_name LIKE 'research_%'
ORDER BY table_name, constraint_type;

-- ============================================================================
-- 5. VERIFY FOREIGN KEY RELATIONSHIPS
-- ============================================================================
SELECT 
    'Foreign Keys Check' AS verification_step,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    '✅ EXISTS' AS status
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name LIKE 'research_%'
ORDER BY tc.table_name;

-- Expected: research_messages should have FK to research_sessions

-- ============================================================================
-- 6. VERIFY RLS POLICIES
-- ============================================================================
SELECT 
    'RLS Policies Check' AS verification_step,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    '✅ EXISTS' AS status
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename LIKE 'research_%'
ORDER BY tablename, policyname;

-- Expected: Policies for each table

-- ============================================================================
-- 7. TEST INSERT (Using Service Role - This will work if RLS is correct)
-- ============================================================================
-- NOTE: This test requires service role key. If running as regular user, this will fail (expected).

-- Test 1: Try to insert into research_code_mappings (should work for authenticated users)
-- This simulates what happens when a user completes their first session
-- You'll need to replace '00000000-0000-0000-0000-000000000000' with an actual user_id from your users table

DO $$
DECLARE
    test_user_id UUID;
    test_code VARCHAR(20) := 'RES-TEST01';
BEGIN
    -- Get first user ID (for testing only)
    SELECT id INTO test_user_id FROM users LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE NOTICE '⚠️ No users found in database - skipping insert test';
    ELSE
        -- Try to insert a test research code
        BEGIN
            INSERT INTO research_code_mappings (user_id, research_code, character_name)
            VALUES (test_user_id, test_code, 'jamie');
            
            RAISE NOTICE '✅ SUCCESS: Can INSERT into research_code_mappings';
            
            -- Clean up test data
            DELETE FROM research_code_mappings WHERE research_code = test_code;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ FAILED: Cannot INSERT into research_code_mappings - %', SQLERRM;
        END;
    END IF;
END $$;

-- ============================================================================
-- 8. VERIFY CANNOT SELECT FROM research_code_mappings (Security Test)
-- ============================================================================
-- This should return 0 rows or an error if RLS is working correctly
-- Regular users should NOT be able to query this table

DO $$
BEGIN
    BEGIN
        PERFORM 1 FROM research_code_mappings LIMIT 1;
        RAISE NOTICE '⚠️ WARNING: Can SELECT from research_code_mappings - RLS may not be working correctly';
    EXCEPTION WHEN insufficient_privilege THEN
        RAISE NOTICE '✅ SECURITY: Cannot SELECT from research_code_mappings (RLS blocking as expected)';
    WHEN OTHERS THEN
        RAISE NOTICE 'ℹ️ INFO: SELECT test result - %', SQLERRM;
    END;
END $$;

-- ============================================================================
-- 9. SUMMARY REPORT
-- ============================================================================
SELECT 
    '=== VERIFICATION SUMMARY ===' AS summary,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_schema = 'public' AND table_name LIKE 'research_%') AS tables_found,
    (SELECT COUNT(*) FROM pg_tables 
     WHERE schemaname = 'public' AND tablename LIKE 'research_%' AND rowsecurity = true) AS tables_with_rls,
    (SELECT COUNT(*) FROM pg_indexes 
     WHERE schemaname = 'public' AND tablename LIKE 'research_%') AS indexes_found,
    (SELECT COUNT(*) FROM pg_policies 
     WHERE schemaname = 'public' AND tablename LIKE 'research_%') AS policies_found;

-- Expected results:
-- tables_found: 3
-- tables_with_rls: 3
-- indexes_found: 9+ (multiple indexes per table)
-- policies_found: 6+ (multiple policies per table)

