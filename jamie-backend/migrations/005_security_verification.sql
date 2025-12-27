-- ============================================================================
-- STEP 7: Security Verification Queries for IRB Compliance
-- Purpose: Verify that research data is anonymous and cannot be linked to users
-- ============================================================================

-- ============================================================================
-- TEST 1: Verify Schema - No User Identifiers in Research Tables
-- ============================================================================

-- Check that research_sessions does NOT have user_id column
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'research_sessions'
  AND column_name = 'user_id';
-- Expected: 0 rows (user_id should not exist)

-- Check that research_messages does NOT have user_id column
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'research_messages'
  AND column_name = 'user_id';
-- Expected: 0 rows (user_id should not exist)

-- Verify research_code exists in research_sessions
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'research_sessions'
  AND column_name = 'research_code';
-- Expected: 1 row (research_code should exist)

-- ============================================================================
-- TEST 2: Verify RLS is Enabled
-- ============================================================================

-- Check that RLS is enabled on all research tables
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'research_%'
ORDER BY tablename;
-- Expected: All tables should have rowsecurity = true

-- ============================================================================
-- TEST 3: Verify RLS Policies
-- ============================================================================

-- List all RLS policies on research tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename LIKE 'research_%'
ORDER BY tablename, policyname;
-- Expected: 
--   research_sessions: Policies should deny all (service role bypasses RLS)
--   research_messages: Policies should deny all (service role bypasses RLS)
--   research_code_mappings: INSERT allowed, SELECT/UPDATE/DELETE denied

-- ============================================================================
-- TEST 4: Verify No Foreign Keys to Users Table (from research data)
-- ============================================================================

-- Check for foreign keys from research tables to users table
SELECT 
    tc.table_name AS source_table,
    kcu.column_name AS source_column,
    ccu.table_name AS target_table,
    ccu.column_name AS target_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('research_sessions', 'research_messages')
  AND ccu.table_name = 'users';
-- Expected: 0 rows (research_sessions and research_messages should NOT reference users)

-- Note: research_code_mappings CAN have foreign key to users (for code generation only)

-- ============================================================================
-- TEST 5: Verify Data Anonymization (Sample Check)
-- ============================================================================

-- Check sample research sessions (should have NO user_id)
-- Run as service role only
SELECT 
    id,
    research_code,
    character_name,
    started_at,
    session_status
FROM research_sessions
LIMIT 5;
-- Expected: Columns should NOT include user_id
-- Verify manually: No user_id column in results

-- Check sample research messages (should have NO user_id)
SELECT 
    id,
    research_session_id,
    message_type,
    content,
    turn_number
FROM research_messages
LIMIT 5;
-- Expected: Columns should NOT include user_id
-- Verify manually: No user_id column in results

-- ============================================================================
-- TEST 6: Verify Research Code Mappings Structure
-- ============================================================================

-- Check that research_code_mappings has user_id (for code generation only)
-- This is OK - users cannot SELECT from this table (RLS blocks it)
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'research_code_mappings'
  AND column_name IN ('user_id', 'research_code')
ORDER BY column_name;
-- Expected: Both user_id and research_code should exist
-- Security: Users cannot SELECT from this table (prevents reverse lookup)

-- ============================================================================
-- TEST 7: Verify Indexes (No Index on user_id in research_code_mappings)
-- ============================================================================

-- Check indexes on research_code_mappings
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'research_code_mappings';
-- Expected: Should have index on research_code
-- Should NOT have index on user_id (prevents efficient reverse lookup)

-- ============================================================================
-- TEST 8: Export Capability Verification
-- ============================================================================

-- Verify that research data can be exported by research_code (anonymous)
-- This query shows what data is available for export
SELECT 
    rs.research_code,
    rs.character_name,
    rs.started_at,
    rs.completed_at,
    rs.duration_seconds,
    rs.turns_used,
    rs.session_status,
    COUNT(rm.id) AS message_count
FROM research_sessions rs
LEFT JOIN research_messages rm ON rm.research_session_id = rs.id
GROUP BY 
    rs.id,
    rs.research_code,
    rs.character_name,
    rs.started_at,
    rs.completed_at,
    rs.duration_seconds,
    rs.turns_used,
    rs.session_status
ORDER BY rs.started_at DESC
LIMIT 10;
-- Expected: Data should be grouped by research_code (anonymous identifier)
-- Should NOT include any user identifiers

-- ============================================================================
-- Summary Verification Query
-- ============================================================================

-- Quick summary check
SELECT 
    'research_sessions' AS table_name,
    COUNT(*) AS row_count,
    'No user_id column' AS security_check
FROM research_sessions
UNION ALL
SELECT 
    'research_messages' AS table_name,
    COUNT(*) AS row_count,
    'No user_id column' AS security_check
FROM research_messages
UNION ALL
SELECT 
    'research_code_mappings' AS table_name,
    COUNT(*) AS row_count,
    'RLS blocks SELECT (prevents reverse lookup)' AS security_check
FROM research_code_mappings;

-- ============================================================================
-- IMPORTANT SECURITY NOTES
-- ============================================================================

-- 1. Users CANNOT query research_sessions (RLS blocks all access)
-- 2. Users CANNOT query research_messages (RLS blocks all access)
-- 3. Users CANNOT query research_code_mappings (RLS blocks SELECT)
-- 4. Users CAN INSERT into research_code_mappings (to create codes)
-- 5. Service role can access all tables (for code generation and export)
-- 6. Research data contains NO user identifiers (user_id, email, name, etc.)
-- 7. Research data is linked only by research_code (anonymous identifier)
-- 8. Reverse lookup (code → user_id) is prevented by RLS blocking SELECT on mappings

