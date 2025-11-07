-- Immediate fix for users table RLS blocking profile access
-- This ensures authenticated users can read their own profile

-- Step 1: Drop existing policy if it exists
DROP POLICY IF EXISTS "users_select_own" ON public.users;

-- Step 2: Create a more permissive policy that definitely works
-- This allows authenticated users to read their own profile
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Step 3: Also create the SECURITY DEFINER function as a backup
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

-- Step 4: Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated, anon;

-- Step 5: Verify RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 6: Test query (should work now)
-- SELECT * FROM public.users WHERE id = auth.uid();

