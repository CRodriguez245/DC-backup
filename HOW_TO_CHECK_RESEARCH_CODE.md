# How to Check Research Code in API Response

**Question:** How do I verify the research code is being returned in the API response?

---

## 🔍 Method 1: Browser DevTools Network Tab

### Step-by-Step:

1. **Open Browser DevTools:**
   - Press `F12` (or right-click → Inspect)
   - Go to **Network** tab

2. **Filter Requests:**
   - In the filter box, type: `chat`
   - This shows only `/chat` requests

3. **Complete a Jamie Session:**
   - Start and complete a Jamie session
   - Make sure it's the user's **first attempt**

4. **Find the Last Request:**
   - Look for the last `/chat` request (when session completed)
   - It should have status `200` (success)

5. **View Response:**
   - Click on the request
   - Go to **Response** tab (or **Preview** tab)
   - Look for `researchCode` field

6. **Search in Response:**
   - Press `Ctrl+F` (or `Cmd+F` on Mac)
   - Search for: `researchCode`
   - Should find: `"researchCode": "RES-XXXXXX"`

---

## 🔍 Method 2: Check Console Logs

The backend logs research code generation. Check Render logs:

1. **Go to Render Dashboard:**
   - https://dashboard.render.com
   - Your service → **Logs** tab

2. **Look for:**
   ```
   🔬 IRB: Generated research code: RES-XXXXXX
   🔬 IRB: Research session saved successfully
   ```

3. **If you see these logs:** Research code is being generated and saved!

---

## 🔍 Method 3: Check Supabase Directly

**Easier method - Check database directly:**

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Select your project

2. **Check `research_code_mappings` table:**
   ```sql
   SELECT * FROM research_code_mappings
   ORDER BY created_at DESC
   LIMIT 5;
   ```
   - Should see research codes for users who completed first Jamie session

3. **Check `research_sessions` table:**
   ```sql
   SELECT research_code, turns_used, session_status, created_at
   FROM research_sessions
   ORDER BY created_at DESC
   LIMIT 5;
   ```
   - Should see sessions with research codes

---

## ⚠️ Important Notes

### Research Code Only Appears When:

1. **Session completes:**
   - `conversationStatus !== 'in-progress'`
   - Session reached completion (DQ complete or turn limit)

2. **First attempt only:**
   - User has never completed a Jamie session before
   - No existing research code for this user

3. **Jamie persona only:**
   - Only works for `character: 'jamie'`
   - Not for other personas (Kavya, Andres, etc.)

4. **Valid user ID:**
   - `userId !== 'anon-user'`
   - Must be a real authenticated user

---

## 🔍 What If Research Code is NOT in Response?

### Check These:

1. **Was it a first attempt?**
   - Check if user already has research code:
   ```sql
   SELECT research_code 
   FROM research_code_mappings
   WHERE user_id = '<your_user_id>';
   ```
   - If returns a row, user already has code (not first attempt)

2. **Did session complete?**
   - Check `conversationStatus` in response
   - Should be `'dq-complete'` or `'turn-limit-reached'`
   - NOT `'in-progress'`

3. **Check backend logs:**
   - Render Dashboard → Logs
   - Look for:
     - `🔬 IRB: Session completed - checking if first attempt`
     - `🔬 IRB: First attempt detected`
     - `🔬 IRB: Generated research code`
     - `🔬 IRB: Research session saved successfully`

4. **Check for errors:**
   - Look for errors in Render logs
   - Common issues:
     - Supabase connection errors
     - Missing environment variables
     - Database table errors

---

## ✅ Quick Verification Query

**Run this in Supabase SQL Editor to check if research codes are being generated:**

```sql
-- Check recent research codes
SELECT 
    rcm.research_code,
    rcm.character_name,
    rcm.created_at as code_created,
    rs.turns_used,
    rs.session_status,
    rs.created_at as session_created
FROM research_code_mappings rcm
LEFT JOIN research_sessions rs ON rs.research_code = rcm.research_code
ORDER BY rcm.created_at DESC
LIMIT 10;
```

**If you see results:** Research codes ARE being generated! ✅

---

## 🎯 Alternative: Check Response Structure

**The research code should be at the top level of the response:**

```json
{
  "session_id": "...",
  "user_id": "...",
  "conversationStatus": "dq-complete",
  "researchCode": "RES-XXXXXX",  // ← HERE
  "jamie_reply": "...",
  "dq_score": {...},
  ...
}
```

**If it's missing:**
- Check backend logs for errors
- Verify session completed
- Verify it's a first attempt

---

**Easiest way:** Just check Supabase tables - if you see entries, it's working! ✅

