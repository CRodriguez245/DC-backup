# Production Verification Checklist

**Purpose:** Verify STEP 5 integration is working in production

---

## ⚠️ Pre-Deployment Checklist

Before verifying production, ensure these are done:

- [ ] Code changes committed to git
- [ ] Code pushed to repository  
- [ ] Render backend deployment completed successfully
- [ ] Database migrations run in production Supabase (STEP 1)
- [ ] Environment variables set in Render:
  - [ ] `SUPABASE_URL` (production Supabase URL)
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (production service role key)

---

## 🔍 Production Verification Steps

### Step 1: Verify Database Migrations in Production

**In Supabase Production Dashboard:**

1. Go to **SQL Editor**
2. Run verification query:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
     AND table_name LIKE 'research_%'
   ORDER BY table_name;
   ```

**Expected:** Should see 3 tables:
- `research_sessions`
- `research_messages`
- `research_code_mappings`

If tables are missing, run migration:
- Copy `jamie-backend/migrations/001_create_research_tables.sql`
- Paste and run in Supabase SQL Editor

---

### Step 2: Verify Environment Variables in Render

**In Render Dashboard:**

1. Go to your backend service → **Environment**
2. Verify these are set:
   - `SUPABASE_URL` = Your production Supabase URL
   - `SUPABASE_SERVICE_ROLE_KEY` = Your production service role key
3. If missing, add them and redeploy

---

### Step 3: Test Backend Connectivity

**Option A: Using Verification Script**

```bash
cd jamie-backend

# Set production backend URL (replace with your actual URL)
export PRODUCTION_BACKEND_URL=https://your-backend.onrender.com

# Run verification
node utils/verify-production-integration.js
```

**Option B: Manual Test**

```bash
# Test backend endpoint
curl -X POST https://your-backend.onrender.com/chat \
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

### Step 4: Test Full Session Flow (First Attempt)

**In Production Frontend:**

1. Create a new test user account (or use existing)
2. Start a Jamie chat session
3. Complete the session (reach DQ complete or turn limit)
4. **Check API response** (in browser DevTools → Network tab):
   - Look for chat endpoint response
   - Verify `researchCode` field is present
   - Verify format: `RES-XXXXXX` (e.g., `RES-A68A6B`)

**Expected Response:**
```json
{
  "session_id": "...",
  "user_id": "...",
  "conversationStatus": "dq-complete",
  "researchCode": "RES-A68A6B",
  ...
}
```

---

### Step 5: Verify Research Session Saved in Database

**In Supabase Production Dashboard:**

1. Go to **Table Editor** → `research_sessions`
2. Find the latest session (should match your test)
3. Verify:
   - [ ] Research code matches the one in API response
   - [ ] Session status is `completed`
   - [ ] Turn counts are correct
   - [ ] Start/end times are reasonable

**Or run SQL query:**
```sql
SELECT 
    research_code,
    turns_used,
    max_turns,
    session_status,
    started_at,
    completed_at,
    duration_seconds
FROM research_sessions
ORDER BY created_at DESC
LIMIT 1;
```

---

### Step 6: Verify Research Messages Saved

**In Supabase Production Dashboard:**

1. Get the session ID from Step 5
2. Go to **Table Editor** → `research_messages`
3. Filter by `research_session_id` = session ID from Step 5
4. Verify:
   - [ ] All conversation messages are saved
   - [ ] User messages have DQ scores
   - [ ] Coach messages exist
   - [ ] Turn numbers are correct (1, 2, 3, etc.)

**Or run SQL query:**
```sql
SELECT 
    message_type,
    turn_number,
    dq_scores IS NOT NULL as has_dq_score,
    length(content) as message_length
FROM research_messages
WHERE research_session_id = '<session_id_from_step_5>'
ORDER BY turn_number, timestamp;
```

---

### Step 7: Test Second Attempt (Should NOT Save)

**In Production Frontend:**

1. With the same user, start a SECOND Jamie session
2. Complete the session
3. **Check API response:**
   - `researchCode` field should be **missing** (not first attempt)
   - Or if present, should be the same code from first attempt

**In Supabase:**
- Verify only ONE research session exists for this user
- Second session should NOT create a new research session

---

### Step 8: Verify Research Code Mapping

**In Supabase Production Dashboard:**

1. Go to **Table Editor** → `research_code_mappings`
2. Find entry for your test user
3. Verify:
   - [ ] `user_id` matches your test user
   - [ ] `character_name` is `jamie`
   - [ ] `research_code` matches code from API response

**Or run SQL query:**
```sql
SELECT 
    research_code,
    character_name,
    created_at
FROM research_code_mappings
WHERE user_id = '<your_test_user_id>';
```

---

## ✅ Success Criteria

All of these should be true:

- [ ] Backend is reachable and responding
- [ ] Database migrations are applied in production
- [ ] Environment variables are set correctly
- [ ] First Jamie session returns `researchCode` in API response
- [ ] Research session is saved to `research_sessions` table
- [ ] All messages are saved to `research_messages` table
- [ ] User messages have DQ scores stored
- [ ] Research code mapping exists in `research_code_mappings`
- [ ] Second attempt does NOT create new research session
- [ ] Research code format is correct (RES-XXXXXX)

---

## 🚨 Troubleshooting

### Issue: Backend not reachable

**Check:**
- Is Render service deployed and running?
- Is the URL correct?
- Check Render logs for errors

**Fix:**
- Verify deployment status in Render dashboard
- Check deployment logs
- Redeploy if needed

---

### Issue: Research code not in response

**Check:**
- Is this the user's first Jamie session?
- Did the session complete (not in-progress)?
- Check backend logs for errors

**Fix:**
- Verify session completed (conversationStatus !== 'in-progress')
- Check backend logs for research save errors
- Verify Supabase connection in Render environment variables

---

### Issue: Research session not saved

**Check:**
- Are database migrations run in production?
- Are environment variables set correctly?
- Check backend logs for errors

**Fix:**
- Run migrations if tables don't exist
- Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Render
- Check backend logs for specific errors

---

### Issue: Tables don't exist

**Fix:**
1. Go to Supabase production dashboard → SQL Editor
2. Copy `jamie-backend/migrations/001_create_research_tables.sql`
3. Paste and run
4. Verify with `002_verify_research_tables.sql`

---

## 📝 Verification Log

**Date:** _________________  
**Verified By:** _________________  

**Pre-Deployment:**
- [ ] Code committed and pushed
- [ ] Migrations run in production
- [ ] Environment variables set

**Backend:**
- [ ] Backend reachable: [ ] Pass [ ] Fail
- [ ] API responds correctly: [ ] Pass [ ] Fail

**Database:**
- [ ] Tables exist: [ ] Pass [ ] Fail
- [ ] Session saved: [ ] Pass [ ] Fail
- [ ] Messages saved: [ ] Pass [ ] Fail

**Integration:**
- [ ] Research code returned: [ ] Pass [ ] Fail
- [ ] First attempt works: [ ] Pass [ ] Fail
- [ ] Second attempt skips: [ ] Pass [ ] Fail

**Notes:**
________________________________________________________
________________________________________________________

---

**Status:** [ ] ✅ All Verified [ ] ⚠️ Issues Found

---

**Last Updated:** 2024-12-20

