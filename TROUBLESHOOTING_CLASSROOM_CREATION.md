# Troubleshooting Classroom Creation Issue

## The Problem
Getting `401 Unauthorized` and `new row violates row-level security policy` when trying to create a classroom.

## Root Causes
1. **Missing teacher record** - User has `role='teacher'` in `users` table but no record in `teachers` table
2. **Authentication issue** - Supabase client not properly authenticated
3. **RLS policy issue** - Policy not correctly configured

## Step-by-Step Fix

### Step 1: Run SQL Fix
Run `fix-classroom-creation-simple.sql` in Supabase SQL Editor. This will:
- Create teacher records for all teacher users
- Update the RLS policy
- Verify your account is ready

### Step 2: Verify Authentication in Browser
Open browser console (F12) and run:
```javascript
// Check if Supabase client is initialized
console.log('Supabase URL:', window.location.origin.includes('decisioncoach.io') ? 'Production' : 'Local');

// Check authentication (if you have access to supabase client)
// In your React app, you can add this temporarily:
import { supabase } from './lib/supabase';
supabase.auth.getUser().then(({ data, error }) => {
  console.log('Current user:', data?.user?.id);
  console.log('Auth error:', error);
});
```

### Step 3: Check Teacher Record
Run this in Supabase SQL Editor (while logged in as the teacher):
```sql
SELECT 
    u.id as user_id,
    u.email,
    u.role,
    t.id as teacher_id,
    CASE 
        WHEN t.id IS NULL THEN '❌ MISSING TEACHER RECORD'
        ELSE '✅ OK'
    END as status
FROM public.users u
LEFT JOIN public.teachers t ON u.id = t.id
WHERE u.id = auth.uid();
```

### Step 4: Test Classroom Creation
After running the SQL fix, try creating a classroom again.

## If Still Not Working

### Check 1: Verify RLS is Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'classrooms';
-- Should show: rowsecurity = true
```

### Check 2: Verify Policy Exists
```sql
SELECT policyname, cmd, with_check
FROM pg_policies
WHERE tablename = 'classrooms'
AND policyname = 'classrooms_insert_own';
-- Should show the policy with WITH CHECK clause
```

### Check 3: Test Insert Manually
```sql
-- This should work if everything is set up correctly
-- Replace 'YOUR_USER_ID' with your actual user ID
INSERT INTO public.classrooms (teacher_id, name, description, classroom_code)
VALUES (auth.uid(), 'Test Classroom', 'Test', 'TEST123')
RETURNING id, name;
```

## Common Issues

### Issue: "401 Unauthorized"
**Cause**: Supabase client not authenticated
**Fix**: 
1. Log out and log back in
2. Check browser console for auth errors
3. Verify environment variables are set correctly

### Issue: "Foreign key constraint violation"
**Cause**: Teacher record doesn't exist in `teachers` table
**Fix**: Run `fix-classroom-creation-simple.sql` Step 1

### Issue: "RLS policy violation"
**Cause**: RLS policy not matching or user not authenticated
**Fix**: 
1. Run `fix-classroom-creation-simple.sql` Step 2
2. Verify authentication
3. Check that `teacher_id = auth.uid()` in the insert


