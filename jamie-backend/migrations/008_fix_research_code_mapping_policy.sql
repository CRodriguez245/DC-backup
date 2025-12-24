-- ============================================================================
-- Fix: Add missing INSERT policy for research_code_mappings
-- Purpose: Allow users to INSERT their own research code mappings
-- Date: 2024-12-21
-- ============================================================================

-- Check if policy already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'research_code_mappings'
        AND policyname = 'Users can create research codes'
    ) THEN
        -- Create the INSERT policy with optimized auth.uid()
        CREATE POLICY "Users can create research codes" ON public.research_code_mappings
            FOR INSERT
            WITH CHECK ((select auth.uid()) = user_id);
        
        RAISE NOTICE 'Policy "Users can create research codes" created successfully';
    ELSE
        RAISE NOTICE 'Policy "Users can create research codes" already exists';
    END IF;
END $$;

-- Verify the policy was created
SELECT 
    tablename,
    policyname,
    cmd AS command_type,
    with_check AS with_check_clause
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename = 'research_code_mappings'
    AND policyname = 'Users can create research codes';

