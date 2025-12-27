-- Check if user profile exists in database
-- Run this in your Supabase SQL Editor

-- Check all users in the users table
SELECT * FROM public.users ORDER BY created_at DESC;

-- Check if your specific user exists
-- Replace 'your-email@example.com' with your actual email
SELECT * FROM public.users WHERE email = 'c.a.rodriguez1999@gmail.com';

-- Check auth.users table
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'c.a.rodriguez1999@gmail.com';

-- If the user exists in auth.users but not in public.users, 
-- we need to create the profile manually



