# Deployment Steps - In Progress

**Status:** Code pushed to repository ✅  
**Next:** Run database migrations and verify deployment

---

## ✅ Step 1: Code Deployment - COMPLETE

- [x] Code committed to git
- [x] Code pushed to repository
- [ ] Render deployment completed (check Render dashboard)

**What was deployed:**
- STEP 5 integration code (`chat.js`)
- Research code generation utilities
- Research session storage utilities
- Database migrations
- Testing and verification scripts
- Documentation

---

## 🔄 Step 2: Wait for Render Deployment

**Check Render Dashboard:**
1. Go to https://dashboard.render.com
2. Find your `jamie-backend` service
3. Click on it → Go to **Deploys** tab
4. Look for the latest deploy (should show your commit message)
5. Wait for status to change to **"Live"** (usually 2-3 minutes)

**What to look for:**
- Status: "Live" ✅
- Commit: Should show "Add STEP 5: IRB-compliant research session integration"
- Build: Should complete without errors

---

## 📊 Step 3: Run Database Migrations in Production

**IMPORTANT:** This must be done in your **production Supabase** instance.

### Option A: Supabase Dashboard (Recommended)

1. **Go to Supabase Production Dashboard:**
   - https://supabase.com/dashboard
   - Select your production project

2. **Open SQL Editor:**
   - Click **SQL Editor** in left sidebar
   - Click **New query**

3. **Run Migration:**
   - Open file: `jamie-backend/migrations/001_create_research_tables.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click **Run** (or press Cmd/Ctrl + Enter)
   - ✅ Should see "Success. No rows returned"

4. **Verify Migration:**
   - Run verification query:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
     AND table_name LIKE 'research_%'
   ORDER BY table_name;
   ```
   - Should return 3 rows: `research_sessions`, `research_messages`, `research_code_mappings`

---

## ✅ Step 4: Verify Environment Variables in Render

**Check Render Dashboard:**

1. Go to Render Dashboard → Your `jamie-backend` service
2. Click **Environment** tab
3. Verify these are set:
   - `SUPABASE_URL` = Your production Supabase URL
   - `SUPABASE_SERVICE_ROLE_KEY` = Your production service role key

**If missing:**
- Add them
- Click **Save Changes**
- Service will auto-redeploy

---

## 🧪 Step 5: Verify Deployment

### Quick Verification

**Check Render Logs:**
1. Render Dashboard → Your service → **Logs** tab
2. Look for:
   - No errors related to `researchCode` or `researchSession`
   - No Supabase connection errors
   - Service started successfully

**Test Backend Endpoint:**
```bash
curl -X POST https://jamie-backend.onrender.com/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "test",
    "user_id": "test-user",
    "session_id": "test-session",
    "character": "jamie"
  }'
```

**Expected:** Should return 200 status with chat response

---

## 🎯 Step 6: Test Full Integration

**In Production Frontend:**

1. **Create/Login as test user** (first time user)
2. **Start Jamie session**
3. **Complete the session** (reach DQ complete or turn limit)
4. **Check API Response:**
   - Open browser DevTools (F12)
   - Go to **Network** tab
   - Find the `/chat` request (last one when session completed)
   - Click on it → **Response** tab
   - Look for `researchCode` field
   - Should see: `"researchCode": "RES-XXXXXX"`

5. **Verify in Supabase:**
   - Go to Supabase Dashboard → **Table Editor**
   - Check `research_sessions` table (should have new entry)
   - Check `research_messages` table (should have messages)
   - Check `research_code_mappings` table (should have mapping)

---

## 📋 Deployment Checklist

- [x] Code committed and pushed
- [ ] Render deployment completed (check dashboard)
- [ ] Database migrations run in production Supabase
- [ ] Environment variables verified in Render
- [ ] Backend endpoint responding
- [ ] Full integration test passed
- [ ] Research code appears in API response
- [ ] Research session saved in database

---

## 🚨 Troubleshooting

### Render Deployment Not Starting

**Check:**
- Is Render connected to your GitHub repository?
- Did the push complete successfully?
- Check Render dashboard → Settings → Build & Deploy

**Fix:**
- Manually trigger deploy: Render Dashboard → Your service → Manual Deploy

### Migration Errors

**If migration fails:**
- Check error message in Supabase SQL Editor
- Common issues:
  - Tables already exist (use `IF NOT EXISTS` or drop first)
  - Permission errors (check service role key)
  - Syntax errors (verify SQL file)

**Fix:**
- Review error message
- Check migration SQL file for issues
- Re-run if needed

### Research Code Not Appearing

**Check:**
- Is this the user's first Jamie session?
- Did the session complete (conversationStatus !== 'in-progress')?
- Check Render logs for errors
- Verify environment variables are set

**Fix:**
- Verify session completed
- Check backend logs
- Verify Supabase connection

---

## ✅ Success Criteria

Deployment is successful when:
- [x] Code is pushed to repository
- [ ] Render shows "Live" status
- [ ] Database migrations completed
- [ ] Environment variables set
- [ ] Backend responding
- [ ] Research code appears in first session
- [ ] Research session saved in database

---

**Next:** Monitor Render deployment and run migrations when ready!

