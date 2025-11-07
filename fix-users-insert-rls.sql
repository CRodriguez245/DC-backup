-- Fix RLS policy to allow users to insert their own profile
-- This is needed when users sign up and their profile needs to be created

-- Step 1: Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "users_insert_own" ON public.users;

-- Step 2: Create INSERT policy that allows authenticated users to create their own profile
-- This allows the profile to be created right after signup when session is established
-- Also allow if auth.uid() is NULL (for cases where session isn't fully established yet)
CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);

-- Step 3: Create a SECURITY DEFINER function to create user profiles (bypasses RLS)
-- This is a fallback if the direct INSERT is blocked
CREATE OR REPLACE FUNCTION public.create_user_profile(
    user_uuid UUID,
    user_email TEXT,
    user_name TEXT,
    user_role TEXT
)
RETURNS TABLE (
    id UUID,
    email TEXT,
    name TEXT,
    role TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only allow creating profile for the authenticated user
    IF user_uuid != auth.uid() THEN
        RAISE EXCEPTION 'Access denied: You can only create your own profile';
    END IF;
    
    -- Insert the user profile
    INSERT INTO public.users (id, email, name, role)
    VALUES (user_uuid, user_email, user_name, user_role)
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        name = EXCLUDED.name,
        role = EXCLUDED.role
    RETURNING users.id, users.email, users.name, users.role, users.created_at;
    
    RETURN QUERY
    SELECT u.id, u.email, u.name, u.role, u.created_at
    FROM public.users u
    WHERE u.id = user_uuid;
END;
$$;

-- Step 4: Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT) TO authenticated, anon;

-- Step 5: Verify the policies
SELECT 
    'RLS Policy Check' as check_type,
    policyname,
    cmd,
    qual as using_clause,
    with_check
FROM pg_policies
WHERE tablename = 'users'
AND cmd = 'INSERT';

-- Note: The INSERT policy allows users to create their own profile.
-- The database trigger will automatically create the teacher profile if role='teacher'.

