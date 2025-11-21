-- Comprehensive fix for teacher account issues
-- This script will:
-- 1. Create the auto-create trigger if it doesn't exist
-- 2. Fix all existing teacher accounts missing from teachers table
-- 3. Verify the setup

-- ============================================
-- STEP 1: Create auto-create trigger function
-- ============================================
CREATE OR REPLACE FUNCTION public.auto_create_teacher()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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

-- ============================================
-- STEP 2: Create trigger (drop if exists first)
-- ============================================
DROP TRIGGER IF EXISTS trigger_auto_create_teacher ON public.users;

CREATE TRIGGER trigger_auto_create_teacher
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_teacher();

-- ============================================
-- STEP 3: Grant permissions
-- ============================================
GRANT EXECUTE ON FUNCTION public.auto_create_teacher() TO authenticated, anon;

-- ============================================
-- STEP 4: Fix all existing teacher accounts
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
-- STEP 5: Verify the fix
-- ============================================
SELECT 
    COUNT(*) as total_teacher_users,
    COUNT(t.id) as teachers_with_records,
    COUNT(*) - COUNT(t.id) as missing_records
FROM public.users u
LEFT JOIN public.teachers t ON u.id = t.id
WHERE u.role = 'teacher';

-- Should show: missing_records = 0


