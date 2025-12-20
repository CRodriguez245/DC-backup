# Migration Deployment Verification

**Use this checklist every time you deploy a Supabase migration to production.**

---

## ✅ Pre-Deployment Checklist

### 1. Local Testing
- [ ] Migration SQL tested locally (if possible)
- [ ] Code changes tested with new schema
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] No console errors

### 2. Migration File Review
- [ ] SQL syntax correct
- [ ] No hardcoded values that need updating
- [ ] Rollback SQL documented (if needed)
- [ ] Migration file committed to git

### 3. Environment Variables
- [ ] Documented all required env vars
- [ ] Values verified (match between local/prod)
- [ ] Service role key available for production

---

## 🚀 Deployment Steps

### Step 1: Apply Migration
- [ ] Opened Supabase Dashboard → SQL Editor
- [ ] Copied migration SQL
- [ ] Reviewed SQL carefully
- [ ] Executed migration
- [ ] Received success message
- [ ] No error messages

### Step 2: Verify Tables
Run this query in SQL Editor:
```sql
-- Verify tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'research_%'
ORDER BY table_name;
```

Expected tables (for research migration):
- [ ] `research_sessions`
- [ ] `research_messages`
- [ ] `research_code_mappings`

### Step 3: Verify RLS
Run this query:
```sql
-- Verify RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE 'research_%'
ORDER BY tablename;
```

- [ ] All tables show `rowsecurity = true`

### Step 4: Verify Indexes
Run this query:
```sql
-- Verify indexes exist
SELECT 
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename LIKE 'research_%'
ORDER BY tablename, indexname;
```

- [ ] All expected indexes exist

### Step 5: Test Insert (Service Role)
- [ ] Can insert into research_sessions
- [ ] Can insert into research_messages
- [ ] Can insert into research_code_mappings
- [ ] Foreign key constraints work
- [ ] Unique constraints work

---

## 🔧 Code Deployment

### Step 6: Environment Variables (Render)
- [ ] `SUPABASE_URL` set in Render
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in Render
- [ ] Values match local `.env` file
- [ ] Service redeployed after env var changes

### Step 7: Environment Variables (Vercel)
- [ ] `REACT_APP_SUPABASE_URL` set in Vercel
- [ ] `REACT_APP_SUPABASE_ANON_KEY` set in Vercel
- [ ] Values match local `.env.local` file
- [ ] Site redeployed if needed

### Step 8: Code Push
- [ ] Code committed to git
- [ ] Git push successful
- [ ] Render deployment completed
- [ ] Vercel deployment completed
- [ ] No build errors

---

## ✅ Post-Deployment Verification

### Step 9: Backend Verification
- [ ] Backend connects to Supabase
- [ ] No connection errors in Render logs
- [ ] Research functions work (if applicable)
- [ ] Can generate research codes (if applicable)

### Step 10: Frontend Verification
- [ ] Site loads without errors
- [ ] No console errors in browser DevTools
- [ ] Authentication works
- [ ] Database operations work
- [ ] RLS policies enforced correctly

### Step 11: End-to-End Test
- [ ] Can create test data
- [ ] Can query data
- [ ] Data persists correctly
- [ ] Security policies work
- [ ] No data corruption

---

## 🎯 Verification Queries

### Quick Health Check
Run in Supabase SQL Editor:

```sql
-- 1. Check tables exist
SELECT COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'research_%';
-- Expected: 3 (or whatever number of tables you created)

-- 2. Check RLS enabled
SELECT COUNT(*) as rls_enabled_count
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE 'research_%'
  AND rowsecurity = true;
-- Expected: Same as table count

-- 3. Check indexes
SELECT COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename LIKE 'research_%';
-- Expected: At least 3-4 indexes
```

---

## 🚨 Troubleshooting

### If Tables Don't Exist
1. Re-run migration SQL
2. Check for typos in table names
3. Verify correct Supabase project

### If RLS Not Enabled
1. Re-run migration SQL (RLS should be in migration)
2. Or enable manually:
   ```sql
   ALTER TABLE research_sessions ENABLE ROW LEVEL SECURITY;
   ```

### If Environment Variables Missing
1. Check Render/Vercel dashboard
2. Verify variable names match code
3. Redeploy after adding variables

### If Code Fails in Production
1. Check deployment logs
2. Verify env vars are set
3. Verify migration ran successfully
4. Test connection with simple query

---

## 📝 Deployment Log

**Date:** _________________  
**Migration:** _________________  
**Deployed By:** _________________  

**Pre-Deployment:**
- Local tests: [ ] Pass [ ] Fail
- Migration reviewed: [ ] Yes [ ] No

**Deployment:**
- Migration executed: [ ] Success [ ] Fail
- Tables verified: [ ] Yes [ ] No
- RLS verified: [ ] Yes [ ] No
- Env vars updated: [ ] Yes [ ] No
- Code deployed: [ ] Yes [ ] No

**Post-Deployment:**
- Backend verified: [ ] Yes [ ] No
- Frontend verified: [ ] Yes [ ] No
- E2E test: [ ] Pass [ ] Fail

**Issues Encountered:**
________________________________________________________
________________________________________________________

**Resolution:**
________________________________________________________
________________________________________________________

---

**Next Steps:**
- [ ] Monitor production logs for 24 hours
- [ ] Test with real users (if applicable)
- [ ] Document any issues for future reference

