-- Test INSERT into research_code_mappings
-- This helps debug the RLS policy issue

-- First, check current policy
SELECT 
    policyname,
    cmd,
    with_check AS current_with_check
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename = 'research_code_mappings'
    AND policyname = 'Users can create research codes';

-- Note: This test would need to be run as an authenticated user
-- to properly test the RLS policy

