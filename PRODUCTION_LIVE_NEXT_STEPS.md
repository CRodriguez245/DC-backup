# Production Live - Next Steps

**Status:** ✅ Deployment is live!  
**Next:** Verify and test integration

---

## ✅ Step 1: Verify Backend is Working

**Test Backend Endpoint:**
```bash
curl -X POST https://jamie-backend.onrender.com/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "user_id": "test-user",
    "session_id": "test-session",
    "character": "jamie"
  }'
```

**Expected:** Should return 200 status with chat response

---

## 📊 Step 2: Run Database Migrations (CRITICAL)

**If you haven't run migrations yet in production Supabase, do this now:**

### Quick Steps:

1. **Go to Supabase Production Dashboard:**
   - https://supabase.com/dashboard
   - Select your production project

2. **Open SQL Editor:**
   - Click **SQL Editor** in left sidebar
   - Click **New query**

3. **Copy and Run Migration:**
   - Open: `jamie-backend/migrations/001_create_research_tables.sql`
   - Copy **entire contents** (225 lines)
   - Paste into SQL Editor
   - Click **Run** (Cmd/Ctrl + Enter)
   - ✅ Should see: "Success. No rows returned"

4. **Verify Migration:**
   - Run this query:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
     AND table_name LIKE 'research_%'
   ORDER BY table_name;
   ```
   - **Expected:** Should return 3 rows:
     - `research_sessions`
     - `research_messages`
     - `research_code_mappings`

---

## 🔍 Step 3: Verify Environment Variables

**In Render Dashboard:**

1. Go to your `jamie-backend` service → **Environment** tab
2. Verify these are set:
   - [ ] `SUPABASE_URL` = Your production Supabase URL
   - [ ] `SUPABASE_SERVICE_ROLE_KEY` = Your production service role key

**If not set, add them now** (service will auto-redeploy)

---

## 🧪 Step 4: Test Full Integration

### Option A: Test Through Production Frontend

1. **Go to production frontend site**
2. **Create/Login as a NEW test user** (first time user)
3. **Start a Jamie session**
4. **Complete the session** (reach DQ complete or turn limit)
5. **Check Browser DevTools:**
   - Open DevTools (F12)
   - Go to **Network** tab
   - Find the last `/chat` request (when session completed)
   - Click on it → **Response** tab
   - Look for `researchCode` field
   - Should see: `"researchCode": "RES-XXXXXX"`

### Option B: Verify in Supabase Dashboard

**After completing a session:**

1. **Check `research_sessions` table:**
   - Go to Supabase Dashboard → **Table Editor** → `research_sessions`
   - Should see new entry with your test session
   - Verify:
     - Research code matches API response
     - Status is `completed`
     - Turn counts are correct

2. **Check `research_messages` table:**
   - Go to **Table Editor** → `research_messages`
   - Filter by the session ID from step 1
   - Should see all conversation messages
   - Verify user messages have DQ scores

3. **Check `research_code_mappings` table:**
   - Go to **Table Editor** → `research_code_mappings`
   - Should see mapping for your test user
   - Verify code matches API response

---

## 📋 Verification Checklist

- [x] Backend deployment is live
- [ ] Backend endpoint responding (test curl)
- [ ] Database migrations run in production Supabase
- [ ] Research tables exist (3 tables)
- [ ] Environment variables set in Render
- [ ] Complete first Jamie session in production
- [ ] Research code appears in API response
- [ ] Research session saved in database
- [ ] Research messages saved with DQ scores
- [ ] Research code mapping created

---

## 🚨 Troubleshooting

### Issue: Research code not in API response

**Check:**
- Is this the user's **first** Jamie session?
- Did the session **complete** (conversationStatus !== 'in-progress')?
- Are environment variables set in Render?
- Check Render logs for errors

**Fix:**
- Verify session completed
- Check backend logs in Render
- Verify Supabase connection

### Issue: Research session not saved

**Check:**
- Are database migrations run?
- Are environment variables set correctly?
- Check Render logs for errors

**Fix:**
- Run migrations if tables don't exist
- Verify SUPABASE_URL and SERVICE_ROLE_KEY in Render
- Check Render logs for specific errors

### Issue: Tables don't exist

**Fix:**
1. Go to Supabase dashboard → SQL Editor
2. Run `001_create_research_tables.sql`
3. Verify with query from Step 2

---

## ✅ Success Criteria

Everything is working when:
- [x] Backend is live and responding
- [ ] Database migrations completed
- [ ] First Jamie session returns `researchCode` in response
- [ ] Research session saved to `research_sessions` table
- [ ] All messages saved to `research_messages` table
- [ ] User messages have DQ scores stored
- [ ] Research code mapping exists

---

## 🎯 Next Steps

1. **Run database migrations** (if not done)
2. **Test a complete session** in production
3. **Verify data is saved** in Supabase
4. **Confirm research code** appears in API response

---

**Ready?** Start with Step 2 (Run migrations) if not done yet!

