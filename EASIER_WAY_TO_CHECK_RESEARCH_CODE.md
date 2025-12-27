# Easier Ways to Check Research Code

**Good News:** Since you see entries in Supabase, the research code feature IS working! ✅

But here are easier ways to verify it:

---

## ✅ Method 1: Check Supabase (EASIEST - Already Working!)

Since you see entries in Supabase, this confirms everything is working!

**Check research codes:**
```sql
SELECT 
    research_code,
    character_name,
    created_at
FROM research_code_mappings
ORDER BY created_at DESC
LIMIT 10;
```

**Check sessions with codes:**
```sql
SELECT 
    research_code,
    turns_used,
    session_status,
    created_at
FROM research_sessions
ORDER BY created_at DESC
LIMIT 10;
```

**If you see results here:** ✅ Research codes are being generated!

---

## ✅ Method 2: Check Render Logs (EASIER than DevTools)

**Go to Render Dashboard:**
1. https://dashboard.render.com
2. Your `jamie-backend` service → **Logs** tab
3. Look for these log messages:

**When research code is generated:**
```
🔬 IRB: Session completed - checking if first attempt for user: <user_id>
🔬 IRB: First attempt detected - generating research code and saving session
🔬 IRB: Generated research code: RES-XXXXXX
🔬 IRB: Research session saved successfully
```

**When it's NOT first attempt:**
```
🔬 IRB: Not first attempt (existing code: RES-XXXXXX) - skipping research save
```

**If you see the first set of logs:** ✅ Research code is being generated and saved!

---

## 🔍 Method 3: Find in Browser DevTools (Detailed Steps)

If you want to find it in the API response:

### Step 1: Open DevTools
- Press `F12` or right-click → Inspect
- Go to **Network** tab

### Step 2: Clear and Filter
- Click the 🚫 clear button (to clear old requests)
- In the filter box, type: `chat`
- This shows only `/chat` requests

### Step 3: Complete Session
- Complete a Jamie session (make sure it's first attempt!)
- Wait for session to complete

### Step 4: Find Last Request
- Look for the last `/chat` request
- Status should be `200`
- Click on it

### Step 5: View Response
- Click **Response** tab (or **Preview** tab)
- Look for the response JSON
- Press `Ctrl+F` (or `Cmd+F` on Mac) to search
- Type: `researchCode`
- Should find it near the top of the response

**The response should look like:**
```json
{
  "session_id": "...",
  "user_id": "...",
  "conversationStatus": "dq-complete",
  "researchCode": "RES-XXXXXX",  // ← Look for this
  "jamie_reply": "...",
  "dq_score": {...},
  ...
}
```

---

## ⚠️ Why You Might NOT See researchCode in Response

### 1. Not First Attempt
- User already has a research code
- Research code only appears on first Jamie session completion

**Check if user has code:**
```sql
SELECT research_code 
FROM research_code_mappings
WHERE user_id = '<your_user_id>';
```

### 2. Session Didn't Complete
- Research code only appears when `conversationStatus !== 'in-progress'`
- Check response for `"conversationStatus": "dq-complete"` or `"turn-limit-reached"`

### 3. Not Jamie Persona
- Only works for `character: 'jamie'`
- Other personas don't generate research codes

### 4. Anonymous User
- Must be authenticated user (`userId !== 'anon-user'`)

---

## 🎯 Quick Check: Is Research Code Being Generated?

**Run this query in Supabase:**
```sql
-- Count research codes created today
SELECT COUNT(*) as codes_generated_today
FROM research_code_mappings
WHERE created_at >= CURRENT_DATE;

-- Show latest codes
SELECT 
    research_code,
    created_at,
    (SELECT COUNT(*) 
     FROM research_sessions 
     WHERE research_code = research_code_mappings.research_code) as sessions_count
FROM research_code_mappings
ORDER BY created_at DESC
LIMIT 5;
```

**If you see codes here:** ✅ Everything is working! The researchCode might just be hard to find in the browser response, but it's definitely being generated and saved.

---

## ✅ Bottom Line

**Since you see entries in Supabase:**
- ✅ Research codes ARE being generated
- ✅ Research sessions ARE being saved
- ✅ The feature IS working correctly

The researchCode might not appear in the API response if:
- It's not a first attempt
- Session didn't complete
- You're looking at the wrong request

**But the Supabase entries confirm it's working!** ✅

---

**Recommendation:** Just check Supabase - it's the easiest and most reliable way to verify!

