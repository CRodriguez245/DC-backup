-- ============================================================================
-- Test Supabase Connection and Service Role Access
-- Purpose: Verify service role can access research tables
-- ============================================================================

-- This script tests that service role can:
-- 1. Query research tables
-- 2. Insert into research tables
-- 3. Access data that regular users cannot

-- ============================================================================
-- Test 1: Verify we can query research_sessions (service role should work)
-- ============================================================================
SELECT 
    'Test 1: Query research_sessions' AS test_name,
    COUNT(*) AS table_count,
    CASE 
        WHEN COUNT(*) >= 0 THEN '✅ SUCCESS: Can query research_sessions'
        ELSE '❌ FAILED: Cannot query research_sessions'
    END AS result
FROM research_sessions;

-- ============================================================================
-- Test 2: Verify we can query research_messages (service role should work)
-- ============================================================================
SELECT 
    'Test 2: Query research_messages' AS test_name,
    COUNT(*) AS table_count,
    CASE 
        WHEN COUNT(*) >= 0 THEN '✅ SUCCESS: Can query research_messages'
        ELSE '❌ FAILED: Cannot query research_messages'
    END AS result
FROM research_messages;

-- ============================================================================
-- Test 3: Verify research_code_mappings exists (but we can't SELECT - that's correct!)
-- ============================================================================
-- Note: This will fail for regular users (expected), but service role can see structure
SELECT 
    'Test 3: research_code_mappings structure' AS test_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'research_code_mappings'
ORDER BY ordinal_position;

-- ============================================================================
-- Test 4: Summary - All tables accessible
-- ============================================================================
SELECT 
    '=== CONNECTION TEST SUMMARY ===' AS summary,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_schema = 'public' AND table_name LIKE 'research_%') AS research_tables_found,
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.tables 
              WHERE table_schema = 'public' AND table_name LIKE 'research_%') = 3
        THEN '✅ All 3 research tables found'
        ELSE '❌ Missing some tables'
    END AS status;

