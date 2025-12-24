# RLS Policy Application-Level Test Suite

## Overview

This test suite verifies that RLS (Row Level Security) policies work correctly after the performance optimization fix. It tests:

1. ✅ Students can access their own data
2. ❌ Students cannot access other students' data
3. ✅ Teachers can access their own students' data
4. ❌ Unauthenticated users cannot access data
5. 🔒 Research code mapping access control

---

## Prerequisites

### 1. Environment Variables

Ensure your `.env` file in `jamie-backend/` contains:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Test Accounts

You need test accounts in your Supabase database:

**Student Account:**
- Email: `student@test.com` (or set `TEST_STUDENT_EMAIL`)
- Password: `password123` (or set `TEST_STUDENT_PASSWORD`)
- Role: `student`

**Teacher Account:**
- Email: `teacher@test.com` (or set `TEST_TEACHER_EMAIL`)
- Password: `password123` (or set `TEST_TEACHER_PASSWORD`)
- Role: `teacher`
- Should have at least one classroom with enrolled students

### 3. Test Data (Optional but Recommended)

For comprehensive testing, have:
- At least one student enrolled in teacher's classroom
- Some sessions and messages for the test student
- Some progress/analytics records

---

## Running the Tests

### Option 1: Using Environment Variables for Credentials

```bash
# Set test account credentials
export TEST_STUDENT_EMAIL=student@test.com
export TEST_STUDENT_PASSWORD=password123
export TEST_TEACHER_EMAIL=teacher@test.com
export TEST_TEACHER_PASSWORD=password123

# Run tests
cd jamie-backend
node utils/test-rls-policies.js
```

### Option 2: Edit Credentials in Script

Edit `test-rls-policies.js` and update the `CONFIG` object:

```javascript
const CONFIG = {
  STUDENT_EMAIL: 'your-student@example.com',
  STUDENT_PASSWORD: 'your-password',
  TEACHER_EMAIL: 'your-teacher@example.com',
  TEACHER_PASSWORD: 'your-password',
};
```

Then run:

```bash
cd jamie-backend
node utils/test-rls-policies.js
```

### Option 3: Use .env File

Add to your `.env` file:

```bash
TEST_STUDENT_EMAIL=student@test.com
TEST_STUDENT_PASSWORD=password123
TEST_TEACHER_EMAIL=teacher@test.com
TEST_TEACHER_PASSWORD=password123
```

Then run:

```bash
cd jamie-backend
node utils/test-rls-policies.js
```

---

## Test Output

The test suite will output:

- ✅ **PASS**: Test passed successfully
- ❌ **FAIL**: Test failed (should be fixed)
- ⚠️  **WARN**: Warning (may be expected, review)

### Example Output

```
====================================================================
RLS Policy Application-Level Tests
Testing RLS policies after performance optimization

====================================================================
Initializing Test Clients
====================================================================

  ✅ PASS: Anonymous client initialized
  ℹ️  INFO: Signing in as student: student@test.com
  ✅ PASS: Student signed in: abc123-def456-...
  ℹ️  INFO: Signing in as teacher: teacher@test.com
  ✅ PASS: Teacher signed in: xyz789-uvw012-...

====================================================================
TEST 1: Student Can Access Own Data
====================================================================

🧪 Testing: Student SELECT own user record
  ✅ PASS: Can SELECT own user record
🧪 Testing: Student SELECT own sessions
  ✅ PASS: Can SELECT own sessions (3 sessions)
...

====================================================================
Test Summary
====================================================================

Total Tests: 15
✅ Passed: 14
❌ Failed: 0
⚠️  Warnings: 1

✅ All critical tests passed!
```

---

## Creating Test Accounts

If you don't have test accounts, you can create them:

### Method 1: Via Supabase Dashboard

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Create student account:
   - Email: `student@test.com`
   - Password: `password123`
   - After creation, update `users` table:
     - Set `role = 'student'`
4. Create teacher account:
   - Email: `teacher@test.com`
   - Password: `password123`
   - After creation, update `users` table:
     - Set `role = 'teacher'`
   - Insert into `teachers` table with same ID

### Method 2: Via Application Sign-Up

1. Use your application's sign-up flow
2. Sign up as student
3. Sign up as teacher
4. Use those credentials for testing

---

## Troubleshooting

### "Failed to sign in as student/teacher"

**Possible causes:**
- Account doesn't exist
- Wrong email/password
- Email not confirmed (if email confirmation is enabled)

**Solutions:**
- Verify account exists in Supabase Dashboard
- Check credentials
- Disable email confirmation in Supabase Auth settings (for testing)

### "Cannot SELECT own data" (Unexpected)

**Possible causes:**
- RLS policies not working correctly
- User role not set correctly

**Solutions:**
- Check user's role in `users` table
- Verify RLS policies are active
- Check Supabase logs for detailed errors

### "Can SELECT other users' data" (Should be blocked)

**Possible causes:**
- RLS policies not working
- Test user has admin/service role privileges

**Solutions:**
- Verify RLS is enabled on the table
- Check RLS policies in Supabase Dashboard
- Ensure test user is using `anon` key, not `service_role` key

---

## Expected Behavior

### ✅ Should Work (PASS)

- Students can SELECT their own records
- Teachers can SELECT their students' records
- Users can INSERT their own records
- Users can UPDATE their own records

### ❌ Should Be Blocked (PASS if blocked)

- Students cannot SELECT other students' records
- Teachers cannot SELECT other teachers' students
- Unauthenticated users cannot SELECT any data
- Users cannot SELECT `research_code_mappings` (reverse lookup prevention)

---

## Next Steps

After running tests:

1. ✅ Review test results
2. ✅ Fix any failures (usually configuration issues)
3. ✅ Verify all critical tests pass
4. ✅ Optional: Test manually via your application UI

---

## Notes

- Tests use the `anon` key (not `service_role`), matching real application behavior
- Some tests may show warnings if test data is missing (this is OK)
- Tests clean up temporary data when possible
- All tests are non-destructive (read-only except for test cleanup)

