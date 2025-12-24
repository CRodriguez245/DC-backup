# RLS Type 1 Testing Plan - auth.uid() Optimization

## 🎯 Testing Goal

**Ensure that wrapping `auth.uid()` in `(select auth.uid())` doesn't break any RLS policies or functionality.**

---

## 📋 Pre-Migration Baseline Tests

**Before running the migration, document current behavior:**

### Test Current Functionality

**Goal:** Establish baseline - know what currently works

1. **Test as Student User:**
   - Can SELECT own user record
   - Can UPDATE own user record
   - Can SELECT own sessions
   - Can INSERT own sessions
   - Can UPDATE own sessions
   - Can SELECT own messages
   - Can INSERT own messages
   - Can SELECT own progress
   - Can INSERT/UPDATE own progress
   - Can SELECT own analytics
   - Can INSERT own analytics
   - Can SELECT classrooms enrolled in
   - Can SELECT own enrollments
   - Can INSERT own enrollments
   - **Cannot** SELECT other students' data
   - **Cannot** SELECT teachers' data (except their own teachers)

2. **Test as Teacher User:**
   - Can SELECT own user record
   - Can UPDATE own user record
   - Can SELECT own teacher record
   - Can INSERT/UPDATE own teacher record
   - Can SELECT own classrooms
   - Can INSERT/UPDATE own classrooms
   - Can SELECT students in their classrooms
   - Can SELECT student sessions in their classrooms
   - Can SELECT student messages in their classrooms
   - Can SELECT student progress in their classrooms
   - Can SELECT student analytics in their classrooms
   - Can SELECT enrollments in their classrooms
   - **Cannot** SELECT other teachers' classrooms
   - **Cannot** SELECT students not in their classrooms

---

## 🧪 Post-Migration Test Plan

### Test Strategy

**After migration, verify ALL the same functionality works.**

---

## 📊 Table-by-Table Test Plan

### 1. USERS Table Tests

#### Policy: `users_select_own`
**Test:** Student/Teacher can view their own record

```sql
-- Test as authenticated user
-- Should return 1 row (their own user record)
SELECT * FROM public.users WHERE id = auth.uid();

-- Expected: ✅ Returns own user record
-- Should fail: ❌ Returns nothing or error
```

**What to check:**
- ✅ Returns exactly 1 row (own record)
- ✅ Contains correct user data
- ❌ Does NOT return other users' records

---

#### Policy: `users_select_teacher_students`
**Test:** Teacher can view their students

```sql
-- Test as teacher
-- Should return students enrolled in teacher's classrooms
SELECT * FROM public.users 
WHERE role = 'student'
AND id IN (
    SELECT e.student_id 
    FROM enrollments e
    JOIN classrooms c ON e.classroom_id = c.id
    WHERE c.teacher_id = auth.uid()
);

-- Expected: ✅ Returns students in teacher's classrooms
-- Should fail: ❌ Returns no students or wrong students
```

**What to check:**
- ✅ Returns students enrolled in teacher's classrooms
- ✅ Only returns students (role = 'student')
- ❌ Does NOT return students from other teachers
- ❌ Does NOT return other teachers

---

#### Policy: `users_select_student_teachers`
**Test:** Student can view their teachers

```sql
-- Test as student
-- Should return teachers whose classrooms student is enrolled in
SELECT * FROM public.users 
WHERE role = 'teacher'
AND id IN (
    SELECT c.teacher_id
    FROM classrooms c
    JOIN enrollments e ON e.classroom_id = c.id
    WHERE e.student_id = auth.uid()
);

-- Expected: ✅ Returns teachers of classrooms student is in
-- Should fail: ❌ Returns no teachers or wrong teachers
```

**What to check:**
- ✅ Returns teachers whose classrooms student is enrolled in
- ✅ Only returns teachers (role = 'teacher')
- ❌ Does NOT return other teachers

---

#### Policy: `users_insert_own`
**Test:** User can insert their own record (registration)

```sql
-- Test as new user (or simulate)
-- Should allow inserting record with id = auth.uid()
INSERT INTO public.users (id, email, name, role)
VALUES (auth.uid(), 'test@example.com', 'Test User', 'student')
RETURNING *;

-- Expected: ✅ Insert succeeds
-- Should fail: ❌ Insert rejected or error
```

**What to check:**
- ✅ Insert succeeds when id = auth.uid()
- ✅ Can insert with auth.uid() IS NULL (for registration flow)
- ❌ Cannot insert record with different user_id

---

#### Policy: `users_update_own`
**Test:** User can update their own record

```sql
-- Test as authenticated user
-- Should allow updating own record
UPDATE public.users 
SET name = 'Updated Name'
WHERE id = auth.uid()
RETURNING *;

-- Expected: ✅ Update succeeds
-- Should fail: ❌ Update rejected or error
```

**What to check:**
- ✅ Update succeeds for own record
- ❌ Cannot update other users' records
- ✅ Updated data is correct

---

### 2. TEACHERS Table Tests

#### Policy: `teachers_select_own`
**Test:** Teacher can view their own teacher record

```sql
-- Test as teacher
SELECT * FROM public.teachers WHERE id = auth.uid();

-- Expected: ✅ Returns own teacher record
```

#### Policy: `teachers_insert_own`
**Test:** Teacher can insert their own record

```sql
-- Test as teacher
INSERT INTO public.teachers (id, school, department)
VALUES (auth.uid(), 'Test School', 'Test Dept')
RETURNING *;

-- Expected: ✅ Insert succeeds
```

#### Policy: `teachers_update_own`
**Test:** Teacher can update their own record

```sql
-- Test as teacher
UPDATE public.teachers 
SET school = 'Updated School'
WHERE id = auth.uid()
RETURNING *;

-- Expected: ✅ Update succeeds
```

---

### 3. CLASSROOMS Table Tests

#### Policy: `classrooms_select_own`
**Test:** Teacher can view their own classrooms

```sql
-- Test as teacher
SELECT * FROM public.classrooms WHERE teacher_id = auth.uid();

-- Expected: ✅ Returns teacher's classrooms
-- Should fail: ❌ Returns no classrooms or wrong classrooms
```

#### Policy: `classrooms_insert_own`
**Test:** Teacher can create classrooms

```sql
-- Test as teacher
INSERT INTO public.classrooms (name, teacher_id, classroom_code)
VALUES ('Test Classroom', auth.uid(), 'TEST123')
RETURNING *;

-- Expected: ✅ Insert succeeds
```

#### Policy: `classrooms_update_own`
**Test:** Teacher can update their own classrooms

```sql
-- Test as teacher
UPDATE public.classrooms 
SET name = 'Updated Name'
WHERE teacher_id = auth.uid()
RETURNING *;

-- Expected: ✅ Update succeeds
```

#### Policy: `classrooms_select_enrolled`
**Test:** Student can view classrooms they're enrolled in

```sql
-- Test as student
SELECT * FROM public.classrooms 
WHERE id IN (
    SELECT classroom_id FROM enrollments WHERE student_id = auth.uid()
);

-- Expected: ✅ Returns classrooms student is enrolled in
```

#### Policy: `classrooms_select_by_code`
**Test:** Authenticated users can view classrooms by code

```sql
-- Test as any authenticated user
SELECT * FROM public.classrooms WHERE classroom_code = 'SOMECODE';

-- Expected: ✅ Returns classroom (if authenticated)
```

---

### 4. ENROLLMENTS Table Tests

#### Policy: `enrollments_select_teacher`
**Test:** Teacher can view enrollments in their classrooms

```sql
-- Test as teacher
SELECT * FROM public.enrollments 
WHERE classroom_id IN (
    SELECT id FROM classrooms WHERE teacher_id = auth.uid()
);

-- Expected: ✅ Returns enrollments in teacher's classrooms
```

#### Policy: `enrollments_select_own`
**Test:** Student can view their own enrollments

```sql
-- Test as student
SELECT * FROM public.enrollments WHERE student_id = auth.uid();

-- Expected: ✅ Returns student's enrollments
```

#### Policy: `enrollments_insert_own`
**Test:** Student can join classrooms

```sql
-- Test as student
INSERT INTO public.enrollments (student_id, classroom_id)
VALUES (auth.uid(), 'some-classroom-uuid')
RETURNING *;

-- Expected: ✅ Insert succeeds
```

---

### 5. SESSIONS Table Tests

#### Policy: `sessions_select_own`
**Test:** Student can view their own sessions

```sql
-- Test as student
SELECT * FROM public.sessions WHERE student_id = auth.uid();

-- Expected: ✅ Returns student's sessions
```

#### Policy: `sessions_insert_own`
**Test:** Student can create sessions

```sql
-- Test as student
INSERT INTO public.sessions (student_id, character_name)
VALUES (auth.uid(), 'jamie')
RETURNING *;

-- Expected: ✅ Insert succeeds
```

#### Policy: `sessions_update_own`
**Test:** Student can update their own sessions

```sql
-- Test as student
UPDATE public.sessions 
SET session_status = 'completed'
WHERE student_id = auth.uid()
RETURNING *;

-- Expected: ✅ Update succeeds
```

#### Policy: `sessions_select_teacher`
**Test:** Teacher can view sessions of their students

```sql
-- Test as teacher
SELECT * FROM public.sessions 
WHERE student_id IN (
    SELECT e.student_id 
    FROM enrollments e
    JOIN classrooms c ON e.classroom_id = c.id
    WHERE c.teacher_id = auth.uid()
);

-- Expected: ✅ Returns sessions of teacher's students
```

---

### 6. MESSAGES Table Tests

#### Policy: `messages_select_own`
**Test:** Student can view messages in their sessions

```sql
-- Test as student
SELECT * FROM public.messages 
WHERE session_id IN (
    SELECT id FROM sessions WHERE student_id = auth.uid()
);

-- Expected: ✅ Returns messages in student's sessions
```

#### Policy: `messages_insert_own`
**Test:** Student can create messages in their sessions

```sql
-- Test as student
INSERT INTO public.messages (session_id, message_type, content)
SELECT id, 'user', 'Test message'
FROM sessions
WHERE student_id = auth.uid()
LIMIT 1
RETURNING *;

-- Expected: ✅ Insert succeeds
```

#### Policy: `messages_select_teacher`
**Test:** Teacher can view messages in their students' sessions

```sql
-- Test as teacher
SELECT * FROM public.messages 
WHERE session_id IN (
    SELECT s.id 
    FROM sessions s
    JOIN enrollments e ON e.student_id = s.student_id
    JOIN classrooms c ON e.classroom_id = c.id
    WHERE c.teacher_id = auth.uid()
);

-- Expected: ✅ Returns messages in teacher's students' sessions
```

---

### 7. STUDENT_PROGRESS Table Tests

#### Policy: `student_progress_select_own`
**Test:** Student can view their own progress

```sql
-- Test as student
SELECT * FROM public.student_progress WHERE student_id = auth.uid();

-- Expected: ✅ Returns student's progress
```

#### Policy: `student_progress_insert_own`
**Test:** Student can create progress records

```sql
-- Test as student
INSERT INTO public.student_progress (student_id, character_name, level)
VALUES (auth.uid(), 'jamie', 'level1')
RETURNING *;

-- Expected: ✅ Insert succeeds
```

#### Policy: `student_progress_update_own`
**Test:** Student can update their own progress

```sql
-- Test as student
UPDATE public.student_progress 
SET average_dq_score = 0.85
WHERE student_id = auth.uid()
RETURNING *;

-- Expected: ✅ Update succeeds
```

#### Policy: `student_progress_select_teacher`
**Test:** Teacher can view progress of their students

```sql
-- Test as teacher
SELECT * FROM public.student_progress 
WHERE student_id IN (
    SELECT e.student_id 
    FROM enrollments e
    JOIN classrooms c ON e.classroom_id = c.id
    WHERE c.teacher_id = auth.uid()
);

-- Expected: ✅ Returns progress of teacher's students
```

---

### 8. DQ_ANALYTICS Table Tests

#### Policy: `dq_analytics_select_own`
**Test:** Student can view their own analytics

```sql
-- Test as student
SELECT * FROM public.dq_analytics WHERE student_id = auth.uid();

-- Expected: ✅ Returns student's analytics
```

#### Policy: `dq_analytics_insert_own`
**Test:** Student can create analytics records

```sql
-- Test as student
INSERT INTO public.dq_analytics (student_id, ...)
VALUES (auth.uid(), ...)
RETURNING *;

-- Expected: ✅ Insert succeeds
```

#### Policy: `dq_analytics_select_teacher`
**Test:** Teacher can view analytics of their students

```sql
-- Test as teacher
SELECT * FROM public.dq_analytics 
WHERE student_id IN (
    SELECT e.student_id 
    FROM enrollments e
    JOIN classrooms c ON e.classroom_id = c.id
    WHERE c.teacher_id = auth.uid()
);

-- Expected: ✅ Returns analytics of teacher's students
```

---

### 9. RESEARCH_EXPORTS Table Tests

#### Policy: `Users can view own export requests`
**Test:** User can view their own export requests

```sql
-- Test as authenticated user
SELECT * FROM public.research_exports WHERE requested_by = auth.uid();

-- Expected: ✅ Returns user's export requests
```

#### Policy: `Users can create own export requests`
**Test:** User can create export requests

```sql
-- Test as authenticated user
INSERT INTO public.research_exports (requested_by, ...)
VALUES (auth.uid(), ...)
RETURNING *;

-- Expected: ✅ Insert succeeds
```

---

### 10. RESEARCH_CODE_MAPPINGS Table Tests

#### Policy: `Users can create research codes`
**Test:** User can create their own research code mapping

```sql
-- Test as authenticated user
INSERT INTO public.research_code_mappings (user_id, research_code, character_name)
VALUES (auth.uid(), 'RES-TEST', 'jamie')
RETURNING *;

-- Expected: ✅ Insert succeeds
```

---

## 🚨 Negative Tests (What Should FAIL)

### Test Unauthorized Access

**These should ALL fail after migration (just like before):**

1. **Student tries to access another student's data:**
   ```sql
   -- As student A, try to SELECT student B's sessions
   -- Expected: ❌ Returns no rows (0 results)
   ```

2. **Student tries to access teacher's private data:**
   ```sql
   -- As student, try to SELECT classrooms of other teachers
   -- Expected: ❌ Returns no rows or only enrolled classrooms
   ```

3. **Teacher tries to access other teachers' students:**
   ```sql
   -- As teacher A, try to SELECT students of teacher B
   -- Expected: ❌ Returns no rows (0 results)
   ```

4. **User tries to UPDATE another user's record:**
   ```sql
   -- Try to UPDATE a record with id != auth.uid()
   -- Expected: ❌ Update fails or affects 0 rows
   ```

---

## ✅ Success Criteria

**Migration is successful if:**

1. ✅ **All positive tests pass** (users can access their own/allowed data)
2. ✅ **All negative tests pass** (users cannot access unauthorized data)
3. ✅ **No new errors** in application logs
4. ✅ **Performance improved** (optional to measure)
5. ✅ **Supabase dashboard shows 0 Type 1 issues**

---

## 🔍 How to Detect Issues

### Red Flags (Things that indicate problems):

1. **Queries return 0 rows when they should return data:**
   - User can't see their own data ❌
   - Teacher can't see their students ❌

2. **Queries return too many rows:**
   - Student can see other students' data ❌
   - Teacher can see other teachers' students ❌

3. **INSERT/UPDATE fails:**
   - User can't create their own records ❌
   - User can't update their own records ❌

4. **Errors in logs:**
   - SQL errors
   - Permission denied errors
   - Unexpected errors

5. **Application breaks:**
   - Features stop working
   - Users can't log in
   - Data doesn't load

---

## 📋 Testing Checklist

### Before Migration
- [ ] Document current behavior (baseline)
- [ ] Test key user flows
- [ ] Note any current issues

### After Migration

**Quick Smoke Tests (5-10 minutes):**
- [ ] Student can log in
- [ ] Student can view their own profile
- [ ] Student can create a session
- [ ] Teacher can log in
- [ ] Teacher can view their classrooms
- [ ] Teacher can view their students

**Full Test Suite (30-45 minutes):**
- [ ] Test all policies listed above
- [ ] Test positive cases (should work)
- [ ] Test negative cases (should fail)
- [ ] Test edge cases

**Verification:**
- [ ] Check Supabase dashboard (0 Type 1 issues)
- [ ] Check application logs (no errors)
- [ ] Test application functionality

---

## 🎯 Quick Test Script (Automated)

**You can create a simple test script:**

```sql
-- Quick verification: Test that auth.uid() works in policies
-- This should work before AND after migration

-- Test 1: Can user see their own record?
SELECT COUNT(*) FROM public.users WHERE id = auth.uid();
-- Expected: 1 (if logged in)

-- Test 2: Can student see their own sessions?
SELECT COUNT(*) FROM public.sessions WHERE student_id = auth.uid();
-- Expected: >= 0 (number of their sessions)

-- Test 3: Can teacher see their classrooms?
SELECT COUNT(*) FROM public.classrooms WHERE teacher_id = auth.uid();
-- Expected: >= 0 (number of their classrooms)
```

---

## ⚠️ Rollback Plan

**If tests fail:**

1. **Immediately revert migration:**
   - Remove `(select ...)` wrappers
   - Restore original `auth.uid()` calls
   - Re-run migration to revert

2. **Or restore from backup:**
   - Supabase has automatic backups
   - Can restore previous policy definitions

3. **Investigate issue:**
   - Check which policies failed
   - Review test results
   - Fix and retry

---

## 📊 Expected Test Results

**All tests should show IDENTICAL results before and after migration:**

| Test | Before Migration | After Migration |
|------|------------------|-----------------|
| Student sees own data | ✅ Works | ✅ Works (same) |
| Teacher sees students | ✅ Works | ✅ Works (same) |
| Unauthorized access | ❌ Blocked | ❌ Blocked (same) |
| Performance | Baseline | **Better** ✅ |

**Only difference should be:** Performance improvement (optional to measure)

---

## ✅ Summary

**Testing ensures:**
- ✅ Functionality unchanged (same behavior)
- ✅ Security maintained (no unauthorized access)
- ✅ Performance improved (faster queries)
- ✅ No regressions introduced

**Time estimate for testing:** 30-45 minutes (full test suite)

