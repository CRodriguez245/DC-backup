-- Auto-create teacher record when user with role='teacher' is created
-- This ensures every teacher user automatically gets a teachers table record

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

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS trigger_auto_create_teacher ON public.users;

-- Create trigger
CREATE TRIGGER trigger_auto_create_teacher
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_teacher();

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.auto_create_teacher() TO authenticated, anon;


