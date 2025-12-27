# How to Run Search Path Migration

## 📋 Steps to Run Migration in Supabase

### Step 1: Open Supabase SQL Editor

1. **Go to:** Supabase Dashboard
2. **Navigate to:** SQL Editor (left sidebar)
3. **Click:** "New query" or use the SQL Editor

---

### Step 2: Copy Migration Script

1. **Open the migration file:**
   - File: `jamie-backend/migrations/007_fix_search_path_security.sql`
   - Copy the entire contents (all 199 lines)

2. **Paste into Supabase SQL Editor**

---

### Step 3: Run the Migration

1. **Review the SQL** (make sure it looks correct)
2. **Click "Run"** or press `Ctrl+Enter` (or `Cmd+Enter` on Mac)
3. **Wait for execution** (should complete in < 1 second)

---

### Step 4: Check for Errors

**Look for:**
- ✅ Success message: "Success. No rows returned" or similar
- ❌ Any error messages (shouldn't be any)

**If you see errors:**
- Note the error message
- Check which function failed
- Let me know and we'll fix it

---

### Step 5: Verify the Fix

**Run this verification query:**

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

**Expected result:**
- Should return 8 rows
- All should show "✅ Fixed"

---

### Step 6: Check Supabase Security Dashboard

1. **Go to:** Supabase Dashboard → Settings → Security (or Security Advisor)
2. **Check for:** "role mutable search_path" issues
3. **Expected:** Should show 0 issues (currently shows 8)

---

### Step 7: Quick Function Test (Optional)

**Test that functions still work:**

```sql
-- Test 1: Should return NULL or valid UUID
SELECT public.get_session_student_id('00000000-0000-0000-0000-000000000000'::uuid);

-- Test 2: Should return false (boolean)
SELECT public.is_user_student('00000000-0000-0000-0000-000000000000'::uuid);

-- Test 3: Should return empty or data
SELECT * FROM public.get_student_progress('00000000-0000-0000-0000-000000000000'::uuid) LIMIT 1;
```

**If these run without errors:** Functions are working! ✅

---

## ✅ Success Checklist

After running migration:

- [ ] Migration ran without errors
- [ ] Verification query shows all 8 functions "✅ Fixed"
- [ ] Supabase security dashboard shows 0 search_path issues
- [ ] Test queries run successfully (optional)
- [ ] Application still works normally

---

## 🚨 If Something Goes Wrong

**If you see errors:**

1. **Note the error message** (copy it)
2. **Check which function failed**
3. **Stop and let me know** - we'll fix it

**Common issues:**
- Permission errors: Very unlikely (you're admin)
- Syntax errors: Very unlikely (SQL is validated)
- Function not found: Function might not exist (we'll verify first)

---

## 📋 Quick Reference

**Migration file location:**
```
jamie-backend/migrations/007_fix_search_path_security.sql
```

**What it does:**
- Adds `SET search_path = ''` to 8 functions
- Makes functions more secure
- No behavior changes

**Expected time:**
- Running migration: 5-10 seconds
- Verification: 2-3 minutes
- Total: ~5 minutes

---

**Ready to run? Follow the steps above!** 🚀

