-- Fix missing user profile
-- Run this in your Supabase SQL Editor

-- Get the user ID from auth.users
-- Replace 'your-email@example.com' with your actual email
INSERT INTO public.users (id, email, name, role, created_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', 'User'),
    COALESCE(au.raw_user_meta_data->>'role', 'student'),
    au.created_at
FROM auth.users au
WHERE au.email = 'c.a.rodriguez1999@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
);

-- If the user is a teacher, also create teacher profile
INSERT INTO public.teachers (id, school, department)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'school', ''),
    COALESCE(au.raw_user_meta_data->>'department', '')
FROM auth.users au
WHERE au.email = 'c.a.rodriguez1999@gmail.com'
AND au.raw_user_meta_data->>'role' = 'teacher'
AND NOT EXISTS (
    SELECT 1 FROM public.teachers pt WHERE pt.id = au.id
);


