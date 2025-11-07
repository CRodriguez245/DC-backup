-- Fix RLS blocking user profile access
-- This creates a SECURITY DEFINER function to read user profiles without RLS blocking

-- Step 1: Create helper function to get user profile (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_user_profile(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    email TEXT,
    name TEXT,
    role TEXT,
    created_at TIMESTAMPTZ,
    last_login TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only allow users to read their own profile
    IF user_uuid != auth.uid() THEN
        RAISE EXCEPTION 'Access denied: You can only read your own profile';
    END IF;
    
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        u.created_at,
        u.last_login
    FROM public.users u
    WHERE u.id = user_uuid;
END;
$$;

-- Step 2: Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated, anon;

-- Step 3: Verify the function works
-- Test: SELECT * FROM public.get_user_profile(auth.uid());

-- Step 4: Ensure the RLS policy exists and is correct
-- Drop and recreate to ensure it's correct
DROP POLICY IF EXISTS "users_select_own" ON public.users;

CREATE POLICY "users_select_own" ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Step 5: Verify the policy
SELECT 
    'RLS Policy Check' as check_type,
    policyname,
    cmd,
    qual as using_clause
FROM pg_policies
WHERE tablename = 'users'
AND policyname = 'users_select_own';

-- Step 6: Test the function (replace with actual user ID)
-- SELECT * FROM public.get_user_profile(auth.uid());

-- Note: The frontend code will try the direct query first,
-- and if it gets a 406 error, it will fall back to using this function.

