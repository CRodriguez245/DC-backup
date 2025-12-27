# Search Path Migration Explained

## 📋 What This Migration Does

**This migration adds `SET search_path = ''` to 8 database functions.**

### Current State (Before Migration)

**Functions currently look like this:**
```sql
CREATE OR REPLACE FUNCTION public.get_session_student_id(session_uuid UUID)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT student_id FROM public.sessions WHERE id = session_uuid LIMIT 1;
$$;
```

**Problem:** No `search_path` is explicitly set, so PostgreSQL uses the caller's `search_path`.

### After Migration

**Functions will look like this:**
```sql
CREATE OR REPLACE FUNCTION public.get_session_student_id(session_uuid UUID)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''  -- ← THIS LINE IS ADDED
AS $$
    SELECT student_id FROM public.sessions WHERE id = session_uuid LIMIT 1;
$$;
```

**Fix:** `SET search_path = ''` forces the function to use fully qualified names only (like `public.sessions`), preventing search_path manipulation.

---

## 🔒 Why We Need This (Security Issue)

### The Security Vulnerability

**"Role mutable search_path"** means functions inherit the caller's `search_path`. This is dangerous because:

1. **Malicious users could manipulate search_path:**
   - Create a malicious function/table in a schema
   - Set `search_path` to point to that schema
   - Call your function
   - Your function might execute malicious code instead of the intended code

2. **Example attack scenario:**
   ```
   -- Attacker creates malicious table in their schema
   CREATE SCHEMA attacker_schema;
   CREATE TABLE attacker_schema.sessions (...malicious code...);
   
   -- Attacker sets search_path to their schema first
   SET search_path = attacker_schema, public;
   
   -- Now when they call your function, it might use their malicious table
   SELECT get_session_student_id(...);
   ```

3. **Why SECURITY DEFINER makes it worse:**
   - `SECURITY DEFINER` functions run with elevated privileges
   - If compromised, they can bypass RLS policies
   - Attackers could access data they shouldn't have access to

### Why Supabase Flags This

**Supabase's security scanner detects this as a high-priority issue because:**
- It's a well-known PostgreSQL security vulnerability
- It's easy to fix (just add `SET search_path = ''`)
- The risk is real, especially with `SECURITY DEFINER` functions
- Industry best practice is to always set `search_path` explicitly

---

## ✅ Why This Fix Is Safe

### 1. Functions Already Use Fully Qualified Names

**All 8 functions already use fully qualified schema names:**
- `public.sessions` ✅ (not just `sessions`)
- `public.users` ✅ (not just `users`)
- `public.classrooms` ✅ (not just `classrooms`)

**This means:**
- Functions will work exactly the same after the fix
- No behavior changes
- No risk of breaking functionality

### 2. SET search_path = '' Is Safe

**When `search_path` is empty:**
- PostgreSQL requires fully qualified names (schema.table)
- Our functions already use fully qualified names
- This is actually **more secure** and **explicit**

### 3. No Data Changes

**This migration:**
- Only modifies function definitions
- Does NOT modify any data
- Does NOT modify tables
- Does NOT modify RLS policies
- Only adds security hardening

### 4. Reversible

**If something goes wrong (unlikely):**
- Can revert by removing `SET search_path = ''`
- Original function behavior is preserved
- Easy rollback

---

## 🛡️ How We Ensure It's Safe

### Safety Checks

**1. Functions Already Use Fully Qualified Names**
- ✅ Verified: All functions use `public.table_name` format
- ✅ No unqualified names that could break
- ✅ Safe to set `search_path = ''`

**2. Migration Uses CREATE OR REPLACE**
- ✅ Won't fail if functions exist
- ✅ Updates existing functions safely
- ✅ No data loss risk

**3. No DROP Statements**
- ✅ Doesn't drop anything
- ✅ Only modifies function definitions
- ✅ Very low risk

**4. Functions Are Idempotent**
- ✅ Can run multiple times safely
- ✅ Will just update to the same state
- ✅ No side effects

---

## ✅ How We Ensure It's Successful

### Pre-Migration Checks

**Before running:**

1. **Verify functions exist:**
   ```sql
   SELECT proname 
   FROM pg_proc 
   WHERE pronamespace = 'public'::regnamespace
     AND proname IN (
       'update_research_sessions_updated_at',
       'get_session_student_id',
       'is_teacher_of_student',
       'is_classroom_owned_by_teacher',
       'is_student_enrolled_with_teacher',
       'is_user_student',
       'get_student_progress',
       'anonymize_student_data'
     );
   ```
   - Should return 8 rows
   - If any missing, investigate first

2. **Check current search_path status:**
   - Functions should NOT have `SET search_path` currently
   - This confirms they need the fix

### During Migration

**Monitor for errors:**
- ✅ Check for syntax errors
- ✅ Check for permission errors
- ✅ Verify all 8 functions updated successfully
- ✅ Migration should complete in < 1 second

### Post-Migration Verification

**1. Verify search_path is set:**

Run this query (included in migration comments):
```sql
SELECT 
    p.proname AS function_name,
    CASE 
        WHEN pg_get_functiondef(p.oid) LIKE '%SET search_path%' 
        THEN '✅ Fixed' 
        ELSE '❌ Not fixed' 
    END AS status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN (
        'update_research_sessions_updated_at',
        'get_session_student_id',
        'is_teacher_of_student',
        'is_classroom_owned_by_teacher',
        'is_student_enrolled_with_teacher',
        'is_user_student',
        'get_student_progress',
        'anonymize_student_data'
    )
ORDER BY p.proname;
```

**Expected result:** All 8 functions should show "✅ Fixed"

**2. Check Supabase Security Dashboard:**
- Go to Supabase Dashboard → Settings → Security
- Should show 0 "role mutable search_path" issues
- (Currently shows 8, should be 0 after)

**3. Test Functions (Optional but Recommended):**

**Test each function if possible:**

```sql
-- Test 1: get_session_student_id
SELECT public.get_session_student_id('00000000-0000-0000-0000-000000000000'::uuid);
-- Should return NULL (or valid UUID if session exists)

-- Test 2: is_teacher_of_student
SELECT public.is_teacher_of_student(
    '00000000-0000-0000-0000-000000000000'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
);
-- Should return false (boolean)

-- Test 3: is_user_student
SELECT public.is_user_student('00000000-0000-0000-0000-000000000000'::uuid);
-- Should return false (boolean)

-- Test 4: get_student_progress
SELECT * FROM public.get_student_progress('00000000-0000-0000-0000-000000000000'::uuid);
-- Should return empty result set (or data if student exists)
```

**4. Test Application Functionality:**

**Test that your app still works:**
- ✅ User authentication
- ✅ RLS policies (should work exactly the same)
- ✅ Teacher-student relationships
- ✅ Session creation/access
- ✅ Progress tracking
- ✅ Any features using these functions

**5. Monitor for Errors:**

**After deployment, watch for:**
- ❌ No database errors in logs
- ❌ No application errors
- ❌ No broken functionality
- ✅ Everything works normally

---

## 📊 Success Criteria

**Migration is successful if:**
1. ✅ Migration runs without errors
2. ✅ All 8 functions show "✅ Fixed" in verification query
3. ✅ Supabase security dashboard shows 0 search_path issues
4. ✅ Functions execute correctly (tested)
5. ✅ Application works normally (no broken features)
6. ✅ No errors in logs

---

## 🚨 What Could Go Wrong (And How to Handle It)

### Scenario 1: Syntax Error

**What:** Migration has a syntax error
**Risk:** Low (SQL is straightforward)
**Fix:** Check error message, fix syntax, re-run

### Scenario 2: Permission Error

**What:** Don't have permission to update functions
**Risk:** Very low (you're admin)
**Fix:** Check user permissions in Supabase

### Scenario 3: Function Breaks After Migration

**What:** Function returns error after fix
**Risk:** Very low (functions already use fully qualified names)
**Fix:** 
- Check error message
- Verify function uses `public.table_name` format
- If needed, add explicit schema qualifiers

### Scenario 4: RLS Policies Break

**What:** RLS policies stop working
**Risk:** Very low (functions are helper functions, not policy creators)
**Fix:** 
- Test RLS policies
- Functions shouldn't affect RLS

---

## 🔄 Rollback Plan

**If something goes wrong:**

**Option 1: Revert Migration**
```sql
-- Remove SET search_path = '' from functions
-- (Can copy old function definitions from git history)
```

**Option 2: Restore from Backup**
- Supabase has automatic backups
- Can restore if needed (nuclear option)

**Option 3: Fix Individual Functions**
- If one function breaks, fix just that one
- Others should be fine

---

## ✅ Confidence Level

**Why we're confident this is safe:**

1. ✅ **Functions already use fully qualified names** - No behavior change
2. ✅ **Industry best practice** - This is the recommended fix
3. ✅ **Supabase recommends it** - They're flagging it as needed
4. ✅ **No data changes** - Only function definitions
5. ✅ **Reversible** - Easy to rollback
6. ✅ **Tested pattern** - Common security fix in PostgreSQL

**Risk Level: Very Low** ⭐ (1/5)
**Confidence: High** ✅

---

## 📋 Pre-Migration Checklist

**Before running migration:**

- [ ] Reviewed migration script
- [ ] Understand what it does
- [ ] Verified functions exist (run verification query)
- [ ] Have backup/rollback plan ready
- [ ] Ready to test after migration
- [ ] Know how to verify success

**Ready to proceed?** ✅

