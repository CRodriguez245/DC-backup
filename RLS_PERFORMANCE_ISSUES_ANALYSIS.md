# RLS Performance Issues Analysis

## 📊 Overview

**61 performance issues found in Supabase:**
- **28 issues:** RLS policies using `auth.uid()` directly (re-evaluated per row)
- **33 issues:** Multiple permissive policies for same role/action (less efficient)

---

## 🔍 Issue Type 1: auth.uid() Re-evaluation (28 issues)

### What It Means

**Problem:** RLS policies use `auth.uid()` directly, which gets re-evaluated for **every row** during queries.

**Example (Current - Slow):**
```sql
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT
    USING (auth.uid() = id);  -- ❌ Evaluated for each row
```

**Impact:**
- For a query selecting 100 rows, `auth.uid()` is called 100 times
- Wastes CPU and slows down queries
- Gets worse with more rows

**Fix (Optimized):**
```sql
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT
    USING ((select auth.uid()) = id);  -- ✅ Evaluated once per query
```

### Affected Policies (28 total)

**users table (6 policies):**
1. `users_select_own`
2. `users_select_teacher_students`
3. `users_select_student_teachers`
4. `users_insert_own`
5. `users_update_own`

**teachers table (3 policies):**
6. `teachers_select_own`
7. `teachers_insert_own`
8. `teachers_update_own`

**classrooms table (4 policies):**
9. `classrooms_select_own`
10. `classrooms_insert_own`
11. `classrooms_update_own`
12. `classrooms_select_enrolled`
13. `classrooms_select_by_code`

**enrollments table (3 policies):**
14. `enrollments_select_teacher`
15. `enrollments_select_own`
16. `enrollments_insert_own`

**sessions table (4 policies):**
17. `sessions_select_own`
18. `sessions_insert_own`
19. `sessions_update_own`
20. `sessions_select_teacher`

**messages table (3 policies):**
21. `messages_select_own`
22. `messages_insert_own`
23. `messages_select_teacher`

**student_progress table (4 policies):**
24. `student_progress_select_own`
25. `student_progress_insert_own`
26. `student_progress_update_own`
27. `student_progress_select_teacher`

**dq_analytics table (3 policies):**
28. `dq_analytics_select_own`
29. `dq_analytics_insert_own`
30. `dq_analytics_select_teacher`

**research_exports table (2 policies):**
31. `Users can view own export requests`
32. `Users can create own export requests`

**research_code_mappings table (1 policy):**
33. `Users can create research codes`

**Note:** Count seems to be 33 policies, but Supabase reports 28. Some may not have `auth.uid()` or may be different patterns.

---

## 🔍 Issue Type 2: Multiple Permissive Policies (33 issues)

### What It Means

**Problem:** Multiple permissive (OR) policies for the same role/action combination. PostgreSQL evaluates all of them, which is less efficient than a single combined policy.

**Example:**
```sql
-- Current: Multiple policies (evaluates all)
CREATE POLICY "sessions_select_own" ...
CREATE POLICY "sessions_select_teacher" ...

-- Better: Single policy with OR conditions
CREATE POLICY "sessions_select_combined" ...
    USING (
        student_id = auth.uid() OR  -- Own sessions
        is_teacher_of_student(student_id, auth.uid())  -- Teacher's students
    );
```

**Impact:**
- PostgreSQL evaluates multiple policy conditions
- Slightly slower than single combined policy
- More complex query plans

**Fix Options:**
1. **Combine policies** into single policy with OR conditions
2. **Leave as-is** (functionality is fine, just slightly less optimal)

### Affected Tables

- `classrooms` - 3 SELECT policies
- `dq_analytics` - 2 SELECT policies  
- `enrollments` - 2 SELECT policies
- `messages` - 2 SELECT policies
- `sessions` - 2 SELECT policies
- `student_progress` - 2 SELECT policies
- `users` - 2-3 SELECT policies

---

## ⏱️ Timeline & Effort

### Issue Type 1: auth.uid() Optimization

**Complexity:** ⭐⭐ Medium (2/5)

**Time Estimate:**
- **Finding/reading policies:** 30-45 minutes
- **Creating migration script:** 45-60 minutes
- **Testing policies:** 30-45 minutes
- **Deployment & verification:** 15-30 minutes
- **Total:** **2-3 hours**

**Why it takes time:**
- Need to review each policy
- Replace `auth.uid()` with `(select auth.uid())`
- Need to find all occurrences
- Test that policies still work correctly

---

### Issue Type 2: Multiple Permissive Policies

**Complexity:** ⭐⭐⭐ Medium-High (3/5)

**Time Estimate:**
- **Understanding current policies:** 45-60 minutes
- **Combining policies safely:** 1-2 hours
- **Testing combined policies:** 45-60 minutes
- **Deployment & verification:** 30 minutes
- **Total:** **3-4 hours**

**Why it takes more time:**
- Need to understand each policy's logic
- Combine multiple policies into one without breaking logic
- More complex to test
- Higher risk of breaking functionality

**OR:**
- **Skip this** (leave as-is)
- **Time:** 0 hours
- **Impact:** Minimal (functionality works, just slightly less optimal)

---

## 🎯 Recommended Approach

### Option 1: Fix Type 1 Only (Recommended)

**Fix:** auth.uid() optimization (28 policies)
**Time:** 2-3 hours
**Risk:** Low
**Benefit:** Significant performance improvement

**Why recommended:**
- ✅ Clear fix (simple pattern change)
- ✅ Low risk
- ✅ Significant performance benefit
- ✅ Easy to verify

---

### Option 2: Fix Both Types

**Fix:** Both optimizations
**Time:** 5-7 hours
**Risk:** Medium
**Benefit:** Maximum performance improvement

**Why consider:**
- ✅ Maximum performance gains
- ❌ More complex
- ❌ Higher risk
- ❌ More time

---

### Option 3: Fix Type 1, Skip Type 2 (Recommended for Now)

**Fix:** auth.uid() optimization only
**Skip:** Multiple permissive policies (leave as-is)
**Time:** 2-3 hours
**Risk:** Low
**Benefit:** Good performance improvement

**Why:**
- Type 1 is the bigger performance win
- Type 2 is more complex and risky
- Can address Type 2 later if needed
- Focus on high-impact, low-risk fixes first

---

## ⚠️ Risks

### Risk Level: Low-Medium

**Low Risk (Issue Type 1):**
- Simple pattern replacement
- Easy to verify
- Functionally identical (just faster)
- Easy to revert if needed

**Medium Risk (Issue Type 2):**
- More complex changes
- Need to understand policy logic
- Could accidentally break access
- Harder to test all edge cases

---

## 🧪 Testing Strategy

### For Issue Type 1 (auth.uid() optimization)

**Test Plan:**

1. **Before Migration:**
   - Document current policy behavior
   - Test key queries (users, sessions, etc.)
   - Note query performance (optional)

2. **After Migration:**
   - **Test each affected table:**
     - Users: SELECT own record, teachers see students
     - Sessions: SELECT own sessions, teachers see student sessions
     - Messages: SELECT own messages, teachers see student messages
     - Progress: SELECT own progress, teachers see student progress
     - etc.
   
   - **Test all CRUD operations:**
     - SELECT (reading data)
     - INSERT (creating data)
     - UPDATE (updating data)
     - DELETE (if applicable)

3. **Verify Performance:**
   - Queries should be faster (optional test)
   - Functionality should work identically

---

### For Issue Type 2 (Multiple Policies)

**Test Plan:**

1. **Before Migration:**
   - Document all access patterns
   - Test all user roles (students, teachers)
   - Test all edge cases

2. **After Migration:**
   - **Test each combined policy:**
     - Students can access their own data
     - Teachers can access their students' data
     - No unauthorized access
   
   - **Test all scenarios:**
     - Students accessing their own records ✅
     - Teachers accessing student records ✅
     - Students cannot access other students' records ✅
     - Teachers cannot access other teachers' students ✅

---

## ✅ Success Criteria

**Issue Type 1 Success:**
- ✅ All 28 policies updated with `(select auth.uid())`
- ✅ Supabase dashboard shows 0 auth.uid() re-evaluation issues
- ✅ All functionality works identically
- ✅ Performance improved (optional to measure)

**Issue Type 2 Success:**
- ✅ Policies combined where appropriate
- ✅ All access patterns work correctly
- ✅ No unauthorized access
- ✅ Performance improved (optional to measure)

---

## 🎯 Recommendation

### Recommended: Fix Type 1 Only

**Priority:** High
**Time:** 2-3 hours
**Risk:** Low
**Benefit:** High

**Action:**
1. Create migration script to fix all `auth.uid()` → `(select auth.uid())`
2. Test thoroughly
3. Deploy
4. Verify Supabase dashboard shows 0 issues

**Defer Type 2:**
- Less critical performance issue
- More complex to fix
- Can address later if needed
- Current setup works fine

---

## 📋 Next Steps

**If proceeding with Type 1 fix:**

1. **Review current RLS policies**
2. **Create migration script** to update all policies
3. **Test policies** work correctly
4. **Deploy to production**
5. **Verify in Supabase dashboard**

**Would you like me to:**
- Create the migration script for Type 1 fixes?
- Review the current policies first?
- Create a detailed test plan?

---

## 📊 Summary

| Issue Type | Count | Complexity | Time | Risk | Priority |
|------------|-------|-----------|------|------|----------|
| **auth.uid() re-evaluation** | 28 | ⭐⭐ Medium | 2-3 hrs | Low | **High** ✅ |
| **Multiple permissive policies** | 33 | ⭐⭐⭐ Med-High | 3-4 hrs | Medium | Low ⏸️ |

**Recommendation:** Fix Type 1 now, defer Type 2 for later.

