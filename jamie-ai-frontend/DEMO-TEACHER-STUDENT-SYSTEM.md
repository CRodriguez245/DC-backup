# 🎓 Teacher-Student System Demo Guide

## Overview
This demo shows the complete teacher-student linking system where teachers can track student assessment scores and progress in real-time.

---

## 🧪 Demo Script

### **Step 1: Create Teacher Account**

1. Go to the signup page
2. Fill in:
   - **Name**: Prof. Smith
   - **Email**: teacher@school.edu
   - **Password**: teacher123
   - **Role**: Select **Teacher** 👨‍🏫
3. Click **Create Account**

✅ **Result**: You're logged in as a teacher

---

### **Step 2: Create a Classroom**

1. On the homepage, click the **Users icon** (👥) in the navigation
2. Click **"Create Classroom"** button
3. Fill in:
   - **Classroom Name**: Decision Making 101
   - **Description**: Fall 2025 - Introduction to Decision Quality
4. Click **Create Classroom**

✅ **Result**: Classroom created with a unique **6-character code** (e.g., `ABC123`)

**📋 Important**: Copy this code - students will use it to join!

---

### **Step 3: Create Student Account #1**

1. **Logout** (top right)
2. Go to **Sign Up**
3. Fill in:
   - **Name**: Alice Johnson
   - **Email**: alice@student.edu
   - **Password**: student123
   - **Role**: Select **Student** 👨‍🎓
4. Click **Create Account**

✅ **Result**: Logged in as Alice (student)

---

### **Step 4: Student Completes Assessment**

1. Click on **Jamie's circle** on the homepage
2. Complete the coaching assessment (try 5-10 messages)
3. Session ends with a DQ score

✅ **Result**: Alice's progress is automatically saved

---

### **Step 5: Create Student Account #2**

1. **Logout**
2. **Sign Up** as another student:
   - **Name**: Bob Martinez
   - **Email**: bob@student.edu
   - **Password**: student123
   - **Role**: **Student**
3. Click **Create Account**

---

### **Step 6: Second Student Completes Different Assessments**

1. Complete **Jamie's assessment** (5-10 messages)
2. After finishing, try **Andres** or **Kavya** (if unlocked)

✅ **Result**: Bob has progress on multiple characters

---

### **Step 7: Students Join Teacher's Classroom**

**OPTION A - During Signup (Future Enhancement):**
- Add classroom code field during signup

**OPTION B - Via Settings (To be implemented):**
- Go to Settings → Enter classroom code

**OPTION C - Manual Demo (For now):**
Open browser console and run:
```javascript
// For Alice
authService.joinClassroom('ABC123'); // Use your actual code

// Then for Bob (after logging in as Bob)
authService.joinClassroom('ABC123');
```

✅ **Result**: Both students are now linked to the classroom

---

### **Step 8: Teacher Views Student Progress** 🎯

1. **Logout** and login as **teacher@school.edu**
2. Click the **Users icon** (👥) in navigation
3. You'll see your classroom with:
   - ✅ Classroom name: "Decision Making 101"
   - ✅ Classroom code: `ABC123`
   - ✅ Student count: **2 students**

4. Click **"View Students"**

---

## 🎉 **What You'll See**

### **Class-Wide Statistics:**
- 📊 **Class Average Score**: Combined avg of all students
- 📈 **Total Sessions**: All sessions across students
- ✅ **Completion Rate**: % of characters completed

### **Student Progress Table:**

| Student | Avg Score | Sessions | Jamie | Andres | Kavya | Actions |
|---------|-----------|----------|-------|--------|-------|---------|
| Alice Johnson<br>alice@student.edu | 75% | 1 | ✅ Completed<br>75% | Not Started | Not Started | View Details |
| Bob Martinez<br>bob@student.edu | 68% | 2 | ✅ Completed<br>70% | 🟡 In Progress<br>65% • 1 attempt | Not Started | View Details |

### **Click "View Details" for Individual Student:**
- Overall stats (avg score, total sessions, improvement)
- Progress for each character (Jamie, Andres, Kavya)
- Best scores and completion status
- Recent session history with dates and scores
- Progress bars showing % completion

---

## 💡 **Value Demonstration**

### **For Teachers:**
✅ **Real-time tracking** - See student progress as it happens
✅ **Class analytics** - Understand overall class performance  
✅ **Individual insights** - Drill down into specific student data
✅ **Assessment visibility** - See DQ scores and session attempts
✅ **Easy classroom management** - Simple code-based enrollment

### **For Classroom Settings:**
📚 **Assignments**: "Complete Jamie's assessment by Friday"
📊 **Progress monitoring**: Track who's finished, who needs help
🎯 **Grading**: Use DQ scores as assessment metrics
👥 **Group insights**: Identify struggling students early
📈 **Learning analytics**: Track improvement over time

---

## 🔑 **Key Features Built:**

✅ Classroom creation with unique codes
✅ Multi-user storage system
✅ Student-classroom linking
✅ Automatic progress tracking
✅ Teacher dashboard with class statistics
✅ Student progress table with all 3 characters
✅ Individual student detail views
✅ Session history tracking
✅ Real-time score visibility
✅ Completion status indicators

---

## 🚀 **Next Steps for Full MVP:**

1. **Add classroom code field to signup form**
2. **Add "Join Classroom" to student settings page**
3. **Allow students to leave classrooms**
4. **Add export feature for teacher reports**
5. **Email notifications for teachers**
6. **Bulk classroom management**

---

## 🎬 **Ready to Demo!**

The system is fully functional and demonstrates the **core value proposition**:

> **"Teachers can track student assessment scores and progress in real-time through an easy-to-use classroom management system."**

All student progress data (DQ scores, attempts, completion status) is automatically visible to their teacher! 🎉

