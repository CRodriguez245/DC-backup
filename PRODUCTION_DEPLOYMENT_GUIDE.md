# Production Deployment Guide for Jamie AI

This guide ensures all changes (especially RLS policies) are properly deployed to production.

## 🎯 Important: Your Setup

**You use a SINGLE Supabase project for both local development and production!**

- **Local**: `localhost:3000` → connects to Supabase
- **Production**: `https://decisioncoach.io` → connects to the SAME Supabase
- **Supabase Project**: `https://lcvxiasswxagwcxolzmi.supabase.co`

This means:
- ✅ RLS policies applied once work in both environments
- ✅ Data is shared (test data appears in production and vice versa)
- ⚠️ When testing locally, you're using the same database as production
- ⚠️ Be careful not to accidentally delete/modify production data during testing

## Prerequisites Checklist

- [ ] All local changes tested and working
- [ ] Code committed to git
- [ ] Production Supabase project identified
- [ ] Vercel project identified

---

## Step 1: Apply RLS Policies to Supabase

**⚠️ IMPORTANT: You use a SINGLE Supabase project for both local and production**

Since your local environment and production (`https://decisioncoach.io`) both use the same Supabase project (`https://lcvxiasswxagwcxolzmi.supabase.co`), RLS policies you apply are immediately live in both environments.

### 1.1 Access Supabase Dashboard
1. Go to https://supabase.com
2. **Log in and select your project** (the one with URL ending in `lcvxiasswxagwcxolzmi.supabase.co`)
3. Navigate to **SQL Editor**

### 1.2 Apply RLS Policies
1. Open `setup-rls-policies-safe.sql` from your project
2. **Copy the ENTIRE file** (all 375+ lines)
3. Paste into Supabase SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. Verify success: Should see "Success. No rows returned" or similar

**✅ These policies are now active in BOTH local dev and production!**

### 1.3 Verify Policies Applied
1. Go to **Authentication** → **Policies** in Supabase dashboard
2. Check that policies exist for:
   - `users`
   - `teachers`
   - `classrooms`
   - `enrollments`
   - `sessions`
   - `messages`
   - `student_progress`
   - `dq_analytics`

### 1.4 Verify Helper Functions Created
1. Go to **Database** → **Functions** in Supabase dashboard
2. Verify these functions exist:
   - `is_teacher_of_student(UUID, UUID)`
   - `get_session_student_id(UUID)`
   - `is_classroom_owned_by_teacher(UUID, UUID)`
   - `is_student_enrolled_with_teacher(UUID, UUID)`
   - `is_user_student(UUID)`

---

## Step 2: Verify Production Environment Variables

### 2.1 Check Supabase Credentials
1. In Supabase dashboard, go to **Project Settings** → **API**
2. Your credentials are:
   - **Project URL**: `https://lcvxiasswxagwcxolzmi.supabase.co`
   - **anon/public key**: (in your `.env.local` file)
   
**These are the SAME for both local and production!**

### 2.2 Verify Vercel Environment Variables
1. Go to https://vercel.com
2. Select your **production project** (`dc-backup-uipw` or `jamie-ai-frontend`)
3. Go to **Settings** → **Environment Variables**
4. Verify these are set for **Production** environment:
   - `REACT_APP_SUPABASE_URL` = Your Supabase Project URL
   - `REACT_APP_SUPABASE_ANON_KEY` = Your Supabase anon key
   - `REACT_APP_API_URL` = Your backend API URL (if different from local)

### 2.3 Verify Backend Environment Variables (Render.com or similar)
If your backend is deployed separately:
1. Go to your backend hosting (e.g., Render.com)
2. Verify environment variables:
   - `OPENAI_API_KEY` = Your OpenAI API key
   - `PORT` = 3001 (or your port)
   - Any other backend-specific variables

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Push Code to Git
```bash
# Make sure all changes are committed
git add .
git commit -m "Add RLS policies and fix teacher name display"
git push origin main
```

### 3.2 Trigger Vercel Deployment
1. **Automatic**: Vercel will auto-deploy when you push to main
2. **Manual**: Go to Vercel dashboard → Your project → **Deployments** → **Redeploy**

### 3.3 Verify Deployment
1. Wait for build to complete (check **Deployments** tab)
2. Verify build succeeded (no errors)
3. Click on the deployment to see the preview/production URL

---

## Step 4: Test Production Deployment

### 4.1 Test as Student
1. Visit production URL (e.g., `https://decisioncoach.io`)
2. Log in as a **student account**
3. Test:
   - [ ] Can join a classroom
   - [ ] Sees teacher's first name (not "Teacher")
   - [ ] No student count displayed
   - [ ] Can view own progress
   - [ ] Can start/view sessions
   - [ ] Check browser console for errors

### 4.2 Test as Teacher
1. Log in as a **teacher account**
2. Test:
   - [ ] Can create classrooms
   - [ ] Can view all classrooms
   - [ ] Can click "View Students" on a classroom
   - [ ] Can view student sessions
   - [ ] Can view student progress
   - [ ] Check browser console for errors

### 4.3 Check for Common Issues
- [ ] No 500 errors in console
- [ ] No 403 errors in console
- [ ] No "infinite recursion" errors
- [ ] No "policy already exists" errors
- [ ] No "null" errors when loading student data
- [ ] All data loads correctly

---

## Step 5: Monitor Production

### 5.1 Supabase Logs
1. Go to Supabase dashboard → **Logs** → **Postgres Logs**
2. Check for any RLS policy errors
3. Check for query performance issues

### 5.2 Browser Console
1. Open browser DevTools (F12)
2. Check **Console** tab for errors
3. Check **Network** tab for failed requests

### 5.3 Vercel Logs
1. Go to Vercel dashboard → Your project → **Deployments**
2. Click on latest deployment → **View Build Logs**
3. Check for build errors or warnings

---

## Quick Reference: Environment Variables

### Frontend (Vercel) - Production Environment
```
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_API_URL=https://your-backend-url.com (if needed)
```

### Backend (Render.com or similar)
```
OPENAI_API_KEY=your-openai-key
PORT=3001
NODE_ENV=production
```

---

## Troubleshooting Common Production Issues

### Issue: RLS policies not working
**Solution**: 
- Verify you ran the SQL script in your Supabase dashboard
- Check that all helper functions were created
- Verify grants were applied
- Remember: Since you use one database, policies apply to both local and production

### Issue: Environment variables not working
**Solution**:
- Verify variables are set for **Production** environment (not Preview)
- Redeploy after setting variables
- Clear Vercel build cache and redeploy

### Issue: Infinite recursion errors
**Solution**:
- Re-run the `setup-rls-policies-safe.sql` script
- Verify all helper functions exist
- Check that functions have `SECURITY DEFINER`

### Issue: Teacher name shows "Teacher" instead of actual name
**Solution**:
- Verify `users_select_student_teachers` policy exists
- Check that `is_student_enrolled_with_teacher` function exists
- Verify helper functions have grants

### Issue: Students can't see teacher names
**Solution**:
- Check that `is_user_student` function exists
- Verify the policy `users_select_student_teachers` is active
- Check browser console for RLS errors

---

## Pre-Deployment Checklist

Before deploying, ensure:
- [ ] All code changes committed to git
- [ ] Local testing completed successfully
- [ ] RLS SQL script ready (`setup-rls-policies-safe.sql`)
- [ ] Production Supabase credentials noted
- [ ] Production Vercel project identified
- [ ] Environment variables documented

---

## Post-Deployment Checklist

After deploying, verify:
- [ ] RLS policies applied to production Supabase
- [ ] Helper functions created in production
- [ ] Frontend deployed successfully to Vercel
- [ ] Environment variables set correctly
- [ ] Student login works
- [ ] Teacher login works
- [ ] Classroom joining works
- [ ] Teacher name displays correctly
- [ ] No console errors
- [ ] All features tested in production

---

## Rollback Plan

If something goes wrong:

1. **RLS Issues**: 
   - Go to Supabase → SQL Editor
   - Run: `ALTER TABLE [table_name] DISABLE ROW LEVEL SECURITY;`
   - (Temporary - reapply policies after fixing)

2. **Frontend Issues**:
   - Go to Vercel → Deployments
   - Click on previous working deployment
   - Click "Promote to Production"

3. **Environment Variables**:
   - Verify in Vercel settings
   - Update if incorrect
   - Redeploy

---

## Maintenance

### Regular Checks
- Monitor Supabase logs weekly
- Check Vercel deployments for errors
- Review user feedback for issues
- Test critical paths monthly

### When Adding New Features
1. Test locally first
2. Update RLS policies if adding new tables/queries
3. Test in staging/preview environment
4. Deploy to production
5. Verify in production

