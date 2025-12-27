-- ============================================================================
-- Enable RLS on research_exports table
-- 
-- Issue: research_exports table was missing RLS policies, showing as "UNRESTRICTED"
-- Security Concern: Table contains requested_by (user_id) which could expose
--                   who is requesting data exports
-- 
-- Solution: Enable RLS and create appropriate policies
-- ============================================================================

-- Enable RLS on research_exports
ALTER TABLE research_exports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own export requests
CREATE POLICY "Users can view own export requests"
    ON research_exports
    FOR SELECT
    USING (auth.uid() = requested_by);

-- Policy: Users can create their own export requests (if needed in future)
-- Note: Currently exports are created by service role only, but this policy
--       allows users to create export requests if needed
CREATE POLICY "Users can create own export requests"
    ON research_exports
    FOR INSERT
    WITH CHECK (auth.uid() = requested_by);

-- Policy: Service role can access all export records (for admin/export processing)
-- Note: Service role bypasses RLS by default, but this documents the intent
-- Service role is used for:
--   - Processing export requests
--   - Viewing all export history
--   - Admin operations

-- No UPDATE or DELETE policies - exports should not be modified once created
-- If updates are needed, they should be done by service role only

-- ============================================================================
-- Verification
-- ============================================================================

-- Verify RLS is enabled
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' AND tablename = 'research_exports';
-- Expected: rowsecurity = true

-- Verify policies exist
-- SELECT policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'research_exports';
-- Expected: 2 policies (SELECT and INSERT)

