-- Verify and fix teacher auto-create trigger
-- This ensures the trigger is working correctly

-- ============================================
-- STEP 1: Verify trigger exists
-- ============================================
SELECT 
    'Trigger Check' as check_type,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_create_teacher';

-- ============================================
-- STEP 2: Verify function exists
-- ============================================
SELECT 
    'Function Check' as check_type,
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_name = 'auto_create_teacher'
AND routine_schema = 'public';

-- ============================================
-- STEP 3: Recreate trigger if needed (idempotent)
-- ============================================
CREATE OR REPLACE FUNCTION public.auto_create_teacher()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER  -- This is critical - allows bypassing RLS
AS $$
BEGIN
  -- If user role is 'teacher', create corresponding teachers record
  IF NEW.role = 'teacher' THEN
    INSERT INTO public.teachers (id, school, department)
    VALUES (NEW.id, '', '')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS trigger_auto_create_teacher ON public.users;

CREATE TRIGGER trigger_auto_create_teacher
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_teacher();

-- ============================================
-- STEP 4: Grant permissions
-- ============================================
GRANT EXECUTE ON FUNCTION public.auto_create_teacher() TO authenticated, anon;

-- ============================================
-- STEP 5: Fix all existing teacher accounts
-- ============================================
INSERT INTO public.teachers (id, school, department)
SELECT u.id, '', ''
FROM public.users u
WHERE u.role = 'teacher'
AND NOT EXISTS (
    SELECT 1 FROM public.teachers t WHERE t.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 6: Verify all teachers have records
-- ============================================
SELECT 
    'Verification' as check_type,
    COUNT(*) as total_teacher_users,
    COUNT(t.id) as teachers_with_records,
    COUNT(*) - COUNT(t.id) as missing_records
FROM public.users u
LEFT JOIN public.teachers t ON u.id = t.id
WHERE u.role = 'teacher';

-- Should show: missing_records = 0



