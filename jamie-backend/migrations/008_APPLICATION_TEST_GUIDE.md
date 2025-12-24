# Application-Level Test Guide for RLS Performance Fix

**Date:** 2024-12-21  
**Purpose:** Manual testing checklist for verifying RLS policies work correctly after optimization

## Prerequisites

1. ✅ Automated SQL tests pass (run `008_test_rls_performance_fix.sql`)
2. ✅ Have test accounts: student account, teacher account
3. ✅ Have test data: sessions, messages, progress records

---

## Test Checklist

### TEST 1: Student Can Access Own Data ✅

**Setup:**
- Log in as a test student
- Note the student's user ID

**Tests:**
- [ ] Can SELECT own user record from `users` table
- [ ] Can SELECT own sessions from `sessions` table
- [ ] Can SELECT own messages from `messages` table
- [ ] Can SELECT own progress from `student_progress` table
- [ ] Can SELECT own analytics from `dq_analytics` table
- [ ] Can INSERT new session (with own student_id)
- [ ] Can INSERT new message (in own session)
- [ ] Can UPDATE own user record

**Expected:** All operations succeed (200 OK or success)

**How to Test:**
```javascript
// Example: Test student accessing own data
const { data: ownUser, error: userError } = await supabase
  .from('users')
  .select('*')
  .eq('id', currentUserId)
  .single();

// Should succeed: ownUser should contain data, userError should be null
```

---

### TEST 2: Student Cannot Access Other Students' Data ❌

**Setup:**
- Log in as a test student (Student A)
- Get ID of another student (Student B) from database

**Tests:**
- [ ] Cannot SELECT Student B's user record
- [ ] Cannot SELECT Student B's sessions
- [ ] Cannot SELECT Student B's messages
- [ ] Cannot SELECT Student B's progress
- [ ] Cannot SELECT Student B's analytics
- [ ] Cannot INSERT session for Student B (student_id = Student B's ID)
- [ ] Cannot UPDATE Student B's user record

**Expected:** All operations fail with permission denied (42501) or empty results

**How to Test:**
```javascript
// Example: Test student trying to access another student's data
const { data: otherUser, error: accessError } = await supabase
  .from('users')
  .select('*')
  .eq('id', otherStudentId)
  .single();

// Should fail: otherUser should be null, accessError should indicate permission denied
```

---

### TEST 3: Teacher Can Access Own Students' Data ✅

**Setup:**
- Log in as a test teacher
- Ensure you have students enrolled in your classrooms

**Tests:**
- [ ] Can SELECT students enrolled in own classrooms
- [ ] Can SELECT sessions of own students
- [ ] Can SELECT messages of own students
- [ ] Can SELECT progress/analytics of own students
- [ ] Can SELECT own teacher record
- [ ] Can SELECT own classrooms
- [ ] Can SELECT enrollments in own classrooms
- [ ] Can UPDATE own teacher record
- [ ] Can UPDATE own classrooms

**Expected:** All operations succeed

**How to Test:**
```javascript
// Example: Teacher accessing their students
const { data: students, error: studentsError } = await supabase
  .from('users')
  .select('*')
  .eq('role', 'student');
  // Should return students enrolled in teacher's classrooms

// Example: Teacher accessing student sessions
const { data: sessions, error: sessionsError } = await supabase
  .from('sessions')
  .select('*');
  // Should return sessions of students in teacher's classrooms
```

---

### TEST 4: Teacher Cannot Access Other Teachers' Students ❌

**Setup:**
- Log in as Teacher A
- Get ID of a student enrolled in Teacher B's classroom

**Tests:**
- [ ] Cannot SELECT students not in own classrooms
- [ ] Cannot SELECT sessions of other teachers' students
- [ ] Cannot SELECT messages of other teachers' students
- [ ] Cannot SELECT progress/analytics of other teachers' students
- [ ] Cannot UPDATE other teachers' classrooms
- [ ] Cannot SELECT other teachers' teacher records

**Expected:** Operations return empty results or fail with permission denied

**How to Test:**
```javascript
// Example: Teacher A trying to access Teacher B's student
const { data: otherStudent, error: accessError } = await supabase
  .from('users')
  .select('*')
  .eq('id', studentFromOtherTeacher)
  .single();

// Should fail or return null (student not in Teacher A's classrooms)
```

---

### TEST 5: Unauthenticated User Access ❌

**Setup:**
- Use Supabase client without authentication (anon key only)

**Tests:**
- [ ] Cannot SELECT user records (except maybe public registration)
- [ ] Cannot SELECT sessions
- [ ] Cannot SELECT messages
- [ ] Cannot SELECT progress/analytics
- [ ] Cannot INSERT most data (except maybe user registration)
- [ ] Cannot UPDATE any data

**Expected:** All operations fail with permission denied (42501)

**How to Test:**
```javascript
// Example: Unauthenticated access attempt
const { createClient } = require('@supabase/supabase-js');
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// Note: No auth session

const { data, error } = await supabaseAnon
  .from('users')
  .select('*');

// Should fail: error should indicate permission denied
```

---

### TEST 6: Research Code Mapping Access Control 🔒

**Setup:**
- Log in as authenticated user
- User should have a user_id

**Tests:**
- [ ] Can INSERT into `research_code_mappings` with own `user_id`
- [ ] Cannot INSERT into `research_code_mappings` with different `user_id`
- [ ] Cannot SELECT from `research_code_mappings` (reverse lookup prevention)

**Expected:** 
- INSERT with own user_id: ✅ Success
- INSERT with different user_id: ❌ Permission denied
- SELECT: ❌ Permission denied

**How to Test:**
```javascript
// Example: Insert own research code mapping (should work)
const { data: insertOwn, error: insertOwnError } = await supabase
  .from('research_code_mappings')
  .insert({
    user_id: currentUserId,
    research_code: 'RES-TEST01',
    character_name: 'jamie'
  });

// Should succeed

// Example: Try to select research_code_mappings (should fail)
const { data: mappings, error: selectError } = await supabase
  .from('research_code_mappings')
  .select('*');

// Should fail: selectError should indicate permission denied
```

---

### TEST 7: Performance Verification ⚡

**Setup:**
- Have a teacher with many students (10+)
- Have sessions/messages for these students

**Tests:**
- [ ] Query: Teacher viewing all student sessions (measure execution time)
- [ ] Query: Teacher viewing all student messages (measure execution time)
- [ ] Query: Teacher viewing all student progress (measure execution time)
- [ ] Compare with baseline (if available)

**Expected:** 
- Performance should be equal or better than before
- Should scale well with larger datasets
- No significant slowdown

**How to Test:**
```javascript
// Example: Performance test
const startTime = performance.now();

const { data: sessions, error } = await supabase
  .from('sessions')
  .select('*, student:users(*)')
  // This should use optimized RLS policies

const endTime = performance.now();
const executionTime = endTime - startTime;

console.log(`Query executed in ${executionTime}ms`);
// Compare with baseline or expected time
```

---

## Test Results Template

```
RLS Performance Fix - Application Test Results
Date: ___________
Tester: ___________

Automated Tests:
  [ ] All SQL tests passed

Application Tests:
  [ ] TEST 1: Student can access own data
  [ ] TEST 2: Student cannot access other students' data
  [ ] TEST 3: Teacher can access own students' data
  [ ] TEST 4: Teacher cannot access other teachers' students
  [ ] TEST 5: Unauthenticated user access blocked
  [ ] TEST 6: Research code mapping access control
  [ ] TEST 7: Performance verification

Issues Found:
  - 

Notes:
  - 

Overall Status: [ ] PASS  [ ] FAIL  [ ] PARTIAL
```

---

## Troubleshooting

### If tests fail:

1. **Check Supabase logs** for detailed error messages
2. **Verify policies exist** using verification query
3. **Check authentication** - ensure user is properly authenticated
4. **Verify user roles** - ensure test users have correct roles (student/teacher)
5. **Check helper functions** - ensure all helper functions exist
6. **Review policy definitions** - verify policies match expected patterns

### Common Issues:

- **Permission denied (42501)**: RLS policy blocking access (expected for unauthorized access)
- **Empty results**: Policy working correctly, filtering out unauthorized data
- **Function not found**: Helper function missing, re-run migration if needed
- **Performance issues**: Check query execution plans, verify optimization is active

---

## Quick Test Script

If you want to create automated application tests, here's a template:

```javascript
// test-rls-policies.js
const { createClient } = require('@supabase/supabase-js');

async function testRLSPolicies() {
  // Test with student account
  const studentSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  await studentSupabase.auth.signInWithPassword({
    email: 'student@test.com',
    password: 'password'
  });

  // Test 1: Student can access own data
  const { data: ownData, error: ownError } = await studentSupabase
    .from('users')
    .select('*')
    .eq('id', studentSupabase.auth.user().id)
    .single();
  
  console.log('Test 1:', ownError ? 'FAIL' : 'PASS');

  // Test 2: Student cannot access other data
  // ... add more tests
}

testRLSPolicies();
```

---

**Status:** Ready for testing  
**Next:** Run automated SQL tests first, then proceed with application tests

