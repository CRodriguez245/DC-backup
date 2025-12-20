# Quick Supabase Deployment Guide

**TL;DR**: Follow these steps to prevent deployment issues when moving Supabase changes from local to production.

---

## 🚀 The 3-Step Deployment Process

### Step 1: Run Migration in Supabase Dashboard ⚠️ **DO THIS FIRST**

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open migration file (e.g., `001_create_research_tables.sql`)
3. Copy entire SQL content
4. Paste into SQL Editor
5. Click **Run** (Cmd/Ctrl + Enter)
6. ✅ Verify success message

**Why first?** Your code expects these tables to exist. Deploying code before migration = errors.

---

### Step 2: Update Environment Variables

**Render (Backend):**
1. Render Dashboard → Your Service → **Environment**
2. Add/Update:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Click **Save** (auto-redeploys)

**Vercel (Frontend):**
1. Vercel Dashboard → Project → **Settings** → **Environment Variables**
2. Add/Update:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
3. Click **Save**

**Why?** Code needs these to connect to Supabase.

---

### Step 3: Deploy Code

```bash
git add .
git commit -m "Add research tables feature"
git push origin main
```

Render and Vercel will auto-deploy.

---

## ✅ Quick Verification

### Verify Migration Success
Run in Supabase SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'research_%';
```

Expected: See your new tables listed.

### Verify Production Backend
```bash
cd jamie-backend
node utils/verify-production-deployment.js
```

Expected: All checks pass ✅

### Verify Production Frontend
1. Visit production site
2. Open DevTools (F12) → Console
3. Check for errors:
   - ❌ No "Missing Supabase environment variables"
   - ❌ No 401/403 errors
   - ❌ No connection errors

---

## 🚨 Common Mistakes to Avoid

### ❌ Wrong Order
```
❌ Deploy code → Run migration
✅ Run migration → Deploy code
```

### ❌ Missing Environment Variables
```
❌ Code deployed but env vars not set
✅ Set env vars BEFORE deploying code
```

### ❌ Wrong Supabase Project
```
❌ Migration in Project A, code connects to Project B
✅ Use same Supabase project for local and production
```

### ❌ Forgetting to Verify
```
❌ Assuming it worked without checking
✅ Always verify after deployment
```

---

## 📋 Deployment Checklist

Use this quick checklist for every deployment:

- [ ] **Migration SQL reviewed** (no errors)
- [ ] **Migration executed** in Supabase SQL Editor
- [ ] **Tables verified** exist
- [ ] **RLS policies** enabled (if applicable)
- [ ] **Environment variables** set in Render
- [ ] **Environment variables** set in Vercel
- [ ] **Code committed** to git
- [ ] **Git push** successful
- [ ] **Deployment completed** (Render + Vercel)
- [ ] **Production verified** (backend + frontend)

---

## 🔍 Quick Troubleshooting

### "Table doesn't exist" Error
→ Migration didn't run. Go back to Step 1.

### "Missing environment variables" Error
→ Env vars not set. Go back to Step 2.

### "RLS policy violation" Error
→ Check RLS policies in Supabase Dashboard → Authentication → Policies

### Works locally but fails in production
→ Verify env vars match between local and production

---

## 📚 Full Documentation

For detailed information, see:
- **Full Checklist**: `SUPABASE_DEPLOYMENT_CHECKLIST.md`
- **Verification Steps**: `jamie-backend/migrations/DEPLOYMENT_VERIFICATION.md`
- **Migration Guide**: `jamie-backend/migrations/README.md`

---

## 💡 Pro Tips

1. **Test locally first** - Catch issues before production
2. **Run migrations during low traffic** - If possible
3. **Verify immediately** - Don't wait to check if it worked
4. **Use verification script** - `verify-production-deployment.js`
5. **Document issues** - Learn from mistakes

---

**Remember**: Migration → Env Vars → Code Deployment

