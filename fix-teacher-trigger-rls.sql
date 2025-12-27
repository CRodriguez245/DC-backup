-- Fix teacher auto-create trigger to bypass RLS
-- This ensures the trigger can create teacher records even if RLS blocks direct inserts

-- Step 1: Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS trigger_auto_create_teacher ON public.users;
DROP FUNCTION IF EXISTS public.auto_create_teacher();

-- Step 2: Create the trigger function with SECURITY DEFINER
-- This allows it to bypass RLS when creating teacher records
CREATE OR REPLACE FUNCTION public.auto_create_teacher()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Step 3: Create the trigger
CREATE TRIGGER trigger_auto_create_teacher
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_teacher();

-- Step 4: Grant execute permission
GRANT EXECUTE ON FUNCTION public.auto_create_teacher() TO authenticated, anon;

-- Step 5: Verify the trigger exists
SELECT 
    'Trigger Check' as check_type,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_create_teacher';

-- Step 6: Test by checking if any teachers are missing
SELECT 
    'Missing Teachers Check' as check_type,
    COUNT(*) as total_teacher_users,
    COUNT(t.id) as teachers_with_records,
    COUNT(*) - COUNT(t.id) as missing_records
FROM public.users u
LEFT JOIN public.teachers t ON u.id = t.id
WHERE u.role = 'teacher';



