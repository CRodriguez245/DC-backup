# Supabase Deployment Checklist

**Purpose**: Prevent deployment issues when moving Supabase changes from local to production.

---

## 🔍 Pre-Deployment: Verify Local Environment

### ✅ Step 1: Test Locally First
```bash
# Test database operations locally
cd jamie-backend
node utils/test-research-session-full.js  # Example test
```

**Checklist:**
- [ ] All local tests pass
- [ ] Database operations work correctly
- [ ] No connection errors
- [ ] RLS policies work as expected
- [ ] Code compiles without errors

### ✅ Step 2: Verify Migration Files
- [ ] All migration SQL files are in `jamie-backend/migrations/`
- [ ] Migration files are complete (no partial files)
- [ ] SQL syntax is correct (tested locally if possible)
- [ ] Rollback plan documented (if needed)

### ✅ Step 3: Document Environment Variables

**Backend (.env):**
```bash
# Required Supabase variables
SUPABASE_URL=https://lcvxiasswxagwcxolzmi.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Frontend (.env.local):**
```bash
REACT_APP_SUPABASE_URL=https://lcvxiasswxagwcxolzmi.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Checklist:**
- [ ] Document all required environment variables
- [ ] Verify values match between local and production
- [ ] Service role key is secure (not in git)

---

## 📝 Pre-Deployment: Supabase Dashboard

### ✅ Step 4: Verify Current Production State

1. Go to Supabase Dashboard → **Table Editor**
2. Check existing tables and structure
3. Document current state (screenshot if needed)

**Checklist:**
- [ ] Current tables documented
- [ ] Existing RLS policies noted
- [ ] No conflicting constraints expected

### ✅ Step 5: Backup Production Data (Recommended)

**If data loss would be critical:**
1. Supabase Dashboard → **Database** → **Backups**
2. Create manual backup or verify auto-backup exists
3. Export critical data tables if needed

**Checklist:**
- [ ] Backup created (if critical data exists)
- [ ] Backup location documented

---

## 🚀 Deployment: Run Migrations

### ✅ Step 6: Apply Migrations in Production

**Method 1: Supabase SQL Editor (Recommended for Manual Migrations)**

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open new query
3. Copy migration SQL file content
4. **Review SQL carefully** before running
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. Verify success message: "Success. No rows returned" or similar

**Checklist:**
- [ ] Migration SQL copied correctly
- [ ] SQL reviewed for errors
- [ ] Migration executed successfully
- [ ] No error messages

**Method 2: Supabase CLI (If using CLI)**

```bash
# If you set up Supabase CLI
supabase db push
```

### ✅ Step 7: Verify Migration Success

**Run verification query in SQL Editor:**

```sql
-- For research tables migration
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('research_sessions', 'research_messages', 'research_code_mappings');
```

**Expected:** 3 rows returned

**Also check:**
```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('research_sessions', 'research_messages', 'research_code_mappings');
```

**Expected:** All should have `rowsecurity = true`

**Checklist:**
- [ ] Tables created successfully
- [ ] RLS enabled on all tables
- [ ] Indexes created (check with `\d table_name` or Table Editor)
- [ ] Constraints working correctly

### ✅ Step 8: Test Data Insert (Service Role Only)

**In SQL Editor, test insert with service role context:**

```sql
-- This should work (service role bypasses RLS)
-- Use actual service role connection or test via backend
```

**Or use backend test script:**
```bash
cd jamie-backend
node utils/test-research-session-full.js
```

**Checklist:**
- [ ] Can insert test data
- [ ] Data saves correctly
- [ ] RLS blocks unauthorized access (test with anon key)

---

## 🔧 Deployment: Update Application Code

### ✅ Step 9: Update Environment Variables in Production

**Render (Backend):**
1. Go to Render Dashboard → Your Service → **Environment**
2. Add/Update:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Click **Save Changes**
4. Service will automatically redeploy

**Vercel (Frontend):**
1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add/Update:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
3. Click **Save**
4. Redeploy if needed (or wait for next push)

**Checklist:**
- [ ] All environment variables set in Render
- [ ] All environment variables set in Vercel
- [ ] Values match local `.env` files
- [ ] Service role key is correct (backend only)
- [ ] Anon key is correct (frontend)

### ✅ Step 10: Deploy Code Changes

**Push to Git:**
```bash
git add .
git commit -m "Add IRB research tables migration"
git push origin main
```

**Checklist:**
- [ ] Code committed to git
- [ ] Migration files included in commit
- [ ] No sensitive data in commits (service role keys, etc.)
- [ ] Git push successful

**Wait for Auto-Deploy:**
- [ ] Render backend deployment completed
- [ ] Vercel frontend deployment completed
- [ ] No build errors in deployment logs

---

## ✅ Post-Deployment: Verification

### ✅ Step 11: Test Production Backend

**Test research code generation:**
```bash
# Use production backend URL
curl -X POST https://your-backend.onrender.com/api/test-research-code
```

**Or check logs:**
1. Render Dashboard → Your Service → **Logs**
2. Look for connection errors or Supabase errors

**Checklist:**
- [ ] Backend connects to Supabase successfully
- [ ] No connection errors in logs
- [ ] Research code functions work (if applicable)

### ✅ Step 12: Test Production Frontend

1. Visit production site: `https://decisioncoach.io`
2. Open browser DevTools (F12) → Console
3. Check for errors:
   - No "Missing Supabase environment variables"
   - No 401/403 authentication errors
   - No 500 server errors
   - No "RLS policy violation" errors

**Checklist:**
- [ ] Site loads without errors
- [ ] Authentication works
- [ ] Database operations work
- [ ] No Supabase connection errors
- [ ] RLS policies working correctly

### ✅ Step 13: Verify Data Operations

**Test end-to-end:**
1. Create test user (if safe)
2. Perform operations that use new tables/features
3. Verify data saves correctly
4. Verify data queries correctly

**Checklist:**
- [ ] Can create new records
- [ ] Can query records
- [ ] RLS policies enforce correctly
- [ ] No data corruption

---

## 🔍 Troubleshooting Common Issues

### Issue: "Table doesn't exist" Error

**Symptoms:**
- Error: `relation "research_sessions" does not exist`
- Backend logs show table missing

**Fix:**
1. Verify migration ran: Check Supabase Table Editor
2. If missing, re-run migration SQL
3. Check for typos in table names
4. Verify you're connected to correct Supabase project

**Prevention:**
- Always verify tables exist after migration
- Use verification queries before deploying code

---

### Issue: "RLS Policy Violation" Error

**Symptoms:**
- Error: `new row violates row-level security policy`
- Can't insert/update data

**Fix:**
1. Check RLS policies in Supabase Dashboard → Authentication → Policies
2. Verify service role key is used for backend (bypasses RLS)
3. Verify anon key policies are correct
4. Check policy conditions match your use case

**Prevention:**
- Test RLS policies locally first
- Use service role for backend operations
- Verify policies in production after migration

---

### Issue: "Environment Variable Missing" Error

**Symptoms:**
- Error: `Missing Supabase environment variables`
- App crashes on load

**Fix:**
1. **Render (Backend):**
   - Check Environment variables in Render dashboard
   - Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
   - Redeploy after adding variables

2. **Vercel (Frontend):**
   - Check Environment variables in Vercel dashboard
   - Ensure `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` are set
   - Redeploy after adding variables

**Prevention:**
- Document all required env vars
- Set them before deploying code that uses them
- Use verification script to check env vars

---

### Issue: "Migration Failed" Error

**Symptoms:**
- SQL Editor shows error when running migration
- Tables partially created

**Fix:**
1. Check error message for specific issue
2. Common causes:
   - Syntax error in SQL
   - Constraint violation
   - Permission issue
   - Table already exists (use `IF NOT EXISTS`)
3. Rollback if needed (use migration rollback SQL)
4. Fix SQL and retry

**Prevention:**
- Test migration SQL locally first (if possible)
- Use `IF NOT EXISTS` where appropriate
- Review SQL carefully before running
- Test with small dataset first

---

### Issue: "Different Behavior in Production vs Local"

**Symptoms:**
- Works locally, fails in production
- Different data results

**Fix:**
1. **Check Environment Variables:**
   - Verify values match between local and production
   - Service role key might be different (shouldn't be, but check)

2. **Check Database State:**
   - Verify production database has same schema as local
   - Check for data differences affecting behavior

3. **Check RLS Policies:**
   - Policies might be different between environments
   - Verify policies match

**Prevention:**
- Always use same Supabase project for both (recommended)
- Or document differences if using separate projects
- Test in production-like environment before deploying

---

## 📋 Quick Reference: Deployment Order

**Correct Order:**
1. ✅ Test locally
2. ✅ Apply database migrations in Supabase
3. ✅ Verify migrations succeeded
4. ✅ Update production environment variables
5. ✅ Deploy code changes (git push)
6. ✅ Verify production deployment
7. ✅ Test production functionality

**Wrong Order (Causes Issues):**
❌ Deploy code before running migrations
❌ Run migrations before testing locally
❌ Update env vars after code deployment

---

## 🎯 Success Criteria

After deployment, you should have:

- [ ] All migrations applied successfully
- [ ] Tables exist and have correct structure
- [ ] RLS policies enabled and working
- [ ] Environment variables set correctly
- [ ] Backend connects to Supabase
- [ ] Frontend connects to Supabase
- [ ] No errors in production logs
- [ ] All features work in production
- [ ] Data operations succeed
- [ ] Security policies enforced

---

## 📝 Notes

### Shared Database Architecture

Since you use the **SAME Supabase project** for both local and production:

✅ **Advantages:**
- Migrations apply to both environments automatically
- No schema drift between environments
- Easier to test with real data

⚠️ **Cautions:**
- Test data affects production database
- Be careful with destructive operations
- Backup before major migrations

### Migration Best Practices

1. **Always test locally first** (if possible)
2. **Review SQL carefully** before running in production
3. **Run migrations during low-traffic periods** (if applicable)
4. **Verify immediately after migration**
5. **Document rollback procedure** before migration
6. **Test end-to-end** after deployment

---

## 🚨 Emergency Rollback

If migration causes critical issues:

1. **Stop deployment** (prevent further code deployment)
2. **Rollback migration** (if safe):
   ```sql
   -- Example rollback (adjust for your migration)
   DROP TABLE IF EXISTS research_messages CASCADE;
   DROP TABLE IF EXISTS research_sessions CASCADE;
   DROP TABLE IF EXISTS research_code_mappings CASCADE;
   ```
3. **Revert code changes** (git revert)
4. **Fix issues** in local environment
5. **Retry deployment** with fixes

---

**Last Updated:** 2024-12-19  
**Maintained By:** Development Team

