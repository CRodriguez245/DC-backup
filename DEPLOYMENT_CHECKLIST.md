# Quick Deployment Checklist for Jamie AI

Since you use the **SAME Supabase project** for both local and production, deployment is simplified!

## Your Architecture

```
Local Dev (localhost:3000)
         ↓
         ↓ (same credentials)
         ↓
   Supabase Database
         ↓
         ↓ (same database)
         ↓
Production (decisioncoach.io)
```

**Single Supabase Project**: `https://lcvxiasswxagwcxolzmi.supabase.co`  
**Local .env.local**: `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`  
**Production Vercel**: Should have the SAME values

---

## Pre-Deployment Checklist

### ✅ Code Changes
- [ ] All code changes committed to git
- [ ] Code tested locally and working
- [ ] No console errors during local testing

### ✅ RLS Policies (if changed)
- [ ] `setup-rls-policies-safe.sql` ready
- [ ] Policies applied in Supabase SQL Editor
- [ ] Helper functions verified in Supabase → Database → Functions

### ✅ Environment Variables
- [ ] Local `.env.local` has correct Supabase credentials
- [ ] Vercel Production environment has same Supabase credentials

---

## Deployment Steps

### Step 1: Apply RLS Policies (if you modified them)
**Only needed if you changed RLS policies!**

1. Go to https://supabase.com → Your project
2. SQL Editor
3. Copy/paste entire `setup-rls-policies-safe.sql`
4. Run → Verify success
5. **Done!** Policies are now active in both local and production

### Step 2: Push Code to Git
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

### Step 3: Verify Vercel Deployment
1. Go to https://vercel.com
2. Find your project deployment
3. Wait for "Ready" status
4. Click to visit live site

### Step 4: Test Production
1. Visit `https://decisioncoach.io`
2. Test student login
3. Test teacher login
4. Check browser console for errors
5. Verify all features work

---

## ⚠️ Important Notes

### Shared Database
- **Data is shared**: Test data you create locally appears in production
- **Be careful**: Deleting data locally affects production too
- **Users are shared**: Same user accounts work in both environments

### What's Different?
- **Frontend code**: Deployed via Vercel
- **Build process**: Vercel builds from git
- **Environment variables**: Vercel uses its own .env settings

### What's the Same?
- **Supabase credentials**: Identical in both
- **Database**: Single shared database
- **RLS policies**: Applied once, work everywhere
- **Data**: All data is shared

---

## Quick Health Check

After deployment, verify:

### ✅ No Console Errors
Open browser DevTools (F12) → Console
- No 500 errors
- No 403 errors  
- No "infinite recursion" errors
- No "null" errors

### ✅ Features Work
- [ ] Students can login
- [ ] Teachers can login
- [ ] Students can join classrooms
- [ ] Teacher names display correctly
- [ ] Teachers can view student data
- [ ] Sessions work correctly

### ✅ Database Access
- [ ] Students can see their own data
- [ ] Teachers can see their students
- [ ] Students can't see other students' data
- [ ] RLS policies enforcing correctly

---

## Common Issues & Quick Fixes

### "RLS not working"
→ Check Supabase dashboard → Authentication → Policies

### "Environment variables missing"
→ Check Vercel Settings → Environment Variables → Production

### "Feature broken in production but works locally"
→ Check Vercel build logs for errors
→ Verify environment variables match

### "Data missing in production"
→ Remember: Data is shared! If missing locally, missing in production too

---

## Next Deployment

For future deployments, you only need to:
1. ✅ Test locally
2. ✅ Push to git
3. ✅ Vercel auto-deploys
4. ✅ Test production

**RLS policies are persistent** - you only need to update them if you change the policies file.



