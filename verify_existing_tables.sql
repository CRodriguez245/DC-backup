-- Verification Query for Existing Research Tables
-- Run this in Supabase SQL Editor to verify everything is set up correctly

-- 1. Check all research tables exist
SELECT 
    'Tables Check' AS verification_step,
    table_name,
    CASE 
        WHEN table_name IN ('research_sessions', 'research_messages', 'research_code_mappings') 
        THEN '✅ REQUIRED' 
        WHEN table_name = 'research_exports'
        THEN 'ℹ️  OPTIONAL (may exist from previous migration)'
        ELSE '❓ UNKNOWN'
    END AS status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name LIKE 'research_%'
ORDER BY table_name;

-- 2. Verify RLS is enabled on required tables
SELECT 
    'RLS Check' AS verification_step,
    tablename AS table_name,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS ENABLED'
        ELSE '❌ RLS DISABLED'
    END AS status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('research_sessions', 'research_messages', 'research_code_mappings')
ORDER BY tablename;

-- 3. Check indexes exist (quick check)
SELECT 
    'Indexes Check' AS verification_step,
    tablename,
    COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('research_sessions', 'research_messages', 'research_code_mappings')
GROUP BY tablename
ORDER BY tablename;

-- 4. Check research_exports table structure (if it exists)
SELECT 
    'research_exports Table' AS check_type,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'research_exports'
ORDER BY ordinal_position;

