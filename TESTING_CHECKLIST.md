# Testing Checklist for Jamie AI Application

## ✅ Already Tested/Working
- [x] User login (students and teachers)
- [x] Student joining classrooms (with error fix)
- [x] Teacher viewing classrooms
- [x] RLS policies applied (no infinite recursion)

## 🧪 Critical Testing Areas

### 1. Teacher Functionality

#### Classroom Management
- [ ] **Create classroom** - Teacher can create a new classroom
  - Verify classroom appears in teacher's classroom list
  - Verify classroom code is generated correctly
  
- [ ] **View all classrooms** - Teacher can see all their classrooms
  - Verify classrooms load without errors
  - Verify student count is correct
  
- [ ] **View classroom details** - Teacher can click "View Students" on a classroom
  - Verify student list loads
  - Verify student data (name, email, progress) is visible
  - Verify no 500 errors or infinite recursion

#### Student Data Access
- [ ] **View student sessions** - Teacher clicks "View Session" for a student
  - Verify session data loads (messages, DQ scores, timestamps)
  - Verify all messages are visible
  
- [ ] **View student progress** - Teacher can see student's character progress
  - Verify progress shows for all characters (Jamie, Andres, Kavya)
  - Verify DQ scores are displayed correctly
  - Verify "Not started" vs completed states

- [ ] **View multiple students** - Teacher can view different students in the same classroom
  - Verify switching between students works
  - Verify data is specific to each student

### 2. Student Functionality

#### Classroom Access
- [ ] **Join classroom** - Student can join with a valid code
  - Verify success message appears
  - Verify classroom appears in "My Classrooms" list
  - Verify no 406 errors in console
  
- [ ] **Join already joined classroom** - Student tries to join same classroom twice
  - Verify friendly "already enrolled" message (not error)
  - Verify no duplicate enrollments
  
- [ ] **Join invalid classroom** - Student uses wrong code
  - Verify clear error message
  - Verify no crashes
  
- [ ] **View joined classrooms** - Student can see all enrolled classrooms
  - Verify all classrooms appear in Settings page
  - Verify classroom names and codes are correct

#### Session & Progress
- [ ] **Start a session** - Student clicks on a character level
  - Verify chat interface loads
  - Verify session is created in database
  
- [ ] **Send messages** - Student sends messages in a session
  - Verify messages save to database
  - Verify Jamie's responses appear
  
- [ ] **View progress** - Student checks their progress on homepage
  - Verify tooltips show correct status ("Not started" vs completed)
  - Verify DQ scores display correctly (including 0 scores)
  - Verify last session data is accurate
  
- [ ] **View previous sessions** - Student clicks on completed character
  - Verify previous messages load
  - Verify DQ scores are displayed

### 3. Row Level Security (RLS) Tests

#### Data Isolation
- [ ] **Student can't see other students' data**
  - Log in as Student A
  - Verify they can only see their own sessions/progress
  - Verify they cannot access Student B's data (even if in same classroom)
  
- [ ] **Teacher can't see other teachers' classrooms**
  - Log in as Teacher A
  - Verify they can only see their own classrooms
  - Try to access Teacher B's classroom ID directly (should fail)
  
- [ ] **Student can't see other classrooms' data**
  - Student in Classroom A should not see Classroom B's data
  - Even if they know the classroom ID

#### Access Control
- [ ] **Student can only modify own progress**
  - Verify students can only update their own progress records
  - Verify they cannot modify other students' progress
  
- [ ] **Teacher can only modify own classrooms**
  - Verify teachers can only update their own classrooms
  - Verify they cannot modify other teachers' classrooms

### 4. Error Handling & Edge Cases

#### Network & API Errors
- [ ] **Handles network errors gracefully**
  - Disconnect internet, try to perform actions
  - Verify user-friendly error messages
  
- [ ] **Handles RLS policy errors**
  - Verify no infinite recursion errors
  - Verify no 403/406 errors for legitimate actions
  - Verify proper error messages when access is denied

#### Data Edge Cases
- [ ] **Student with no progress** - New student who hasn't started any sessions
  - Verify homepage shows "Not started" for all characters
  - Verify no errors when loading
  
- [ ] **Teacher with no students** - Teacher creates classroom but no one joins
  - Verify classroom appears with "0 students"
  - Verify no errors when viewing classroom
  
- [ ] **Classroom with many students** - Test with 10+ students
  - Verify all students load correctly
  - Verify no performance issues

### 5. Production Deployment Tests

#### Environment Variables
- [ ] **Vercel deployment** - Verify production site works
  - Check https://decisioncoach.io
  - Verify Supabase connection works
  - Verify environment variables are set correctly

#### Performance
- [ ] **Page load times** - Verify reasonable load times
- [ ] **Database query performance** - Verify queries complete quickly
- [ ] **No memory leaks** - Use browser dev tools to check

### 6. Admin Dashboard Tests (Teacher)

- [ ] **Overview tab** - Verify all classrooms load
- [ ] **My Classrooms tab** - Verify classroom list works
  - Verify "View Students" button works
  - Verify student count is accurate
  
- [ ] **Student Overview** - Verify student list loads
  - Verify "View Session" works for each student
  - Verify session data displays correctly

### 7. Settings Page Tests

#### For Students
- [ ] **My Classrooms panel** - Verify joined classrooms display
- [ ] **Join Classroom** - Verify join functionality
- [ ] **Profile settings** - Verify profile can be updated (if implemented)

#### For Teachers
- [ ] **Create Classroom** - Verify classroom creation works
- [ ] **View Classrooms** - Verify classroom list loads

## 🐛 Known Issues to Verify Fixed

1. [x] Infinite recursion in RLS policies - **FIXED**
2. [x] 500 error on login - **FIXED**
3. [x] Null user error in getClassroomStudents - **FIXED**
4. [x] 406 error when joining classroom - **FIXED**
5. [ ] Classroom panel disappearing after join - Verify this is fixed

## 🔍 Quick Test Commands

### Test as Teacher
1. Login as teacher account
2. Go to Admin Dashboard
3. Create a classroom
4. View the classroom and verify students list loads
5. Click "View Session" for a student

### Test as Student
1. Login as student account
2. Go to Settings
3. Join a classroom with code from teacher
4. Go to Homepage and verify character progress
5. Click on a character to start/view session

## 📝 Test Results Template

```
Test Date: ___________
Tester: ___________

✅ Passed Tests:
- 

❌ Failed Tests:
- 

🐛 Bugs Found:
- 

📝 Notes:
- 
```


