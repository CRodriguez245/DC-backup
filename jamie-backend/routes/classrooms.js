const express = require('express');
const router = express.Router();
const database = require('../database');

// Create new classroom
router.post('/create', (req, res) => {
  try {
    const { name, teacherId, teacherName } = req.body;

    if (!name || !teacherId || !teacherName) {
      return res.status(400).json({
        success: false,
        error: 'Name, teacherId, and teacherName are required'
      });
    }

    // Verify teacher exists
    const teacher = database.findUserById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    const classroom = database.createClassroom({
      name,
      teacherId,
      teacherName
    });

    res.json({
      success: true,
      classroom,
      message: 'Classroom created successfully!'
    });
  } catch (error) {
    console.error('Create classroom error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Join classroom by code
router.post('/join', (req, res) => {
  try {
    const { code, studentId } = req.body;

    if (!code || !studentId) {
      return res.status(400).json({
        success: false,
        error: 'Class code and student ID are required'
      });
    }

    // Find classroom by code
    const classroom = database.findClassroomByCode(code);
    if (!classroom) {
      return res.status(404).json({
        success: false,
        error: 'Invalid class code'
      });
    }

    // Verify student exists
    const student = database.findUserById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Add student to classroom
    const success = database.addStudentToClassroom(classroom.id, studentId);
    
    if (success) {
      res.json({
        success: true,
        classroom: {
          id: classroom.id,
          name: classroom.name,
          teacherName: classroom.teacherName
        },
        message: 'Successfully joined classroom!'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to join classroom'
      });
    }
  } catch (error) {
    console.error('Join classroom error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get teacher's classrooms
router.get('/teacher/:teacherId', (req, res) => {
  try {
    const { teacherId } = req.params;
    const classrooms = database.getTeacherClassrooms(teacherId);

    res.json({
      success: true,
      classrooms
    });
  } catch (error) {
    console.error('Get teacher classrooms error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get student's classrooms
router.get('/student/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const classrooms = database.getStudentClassrooms(studentId);

    res.json({
      success: true,
      classrooms
    });
  } catch (error) {
    console.error('Get student classrooms error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get classroom students
router.get('/:classroomId/students', (req, res) => {
  try {
    const { classroomId } = req.params;
    const students = database.getClassroomStudents(classroomId);

    // Remove passwords from response
    const cleanStudents = students.map(({ password, ...student }) => student);

    res.json({
      success: true,
      students: cleanStudents
    });
  } catch (error) {
    console.error('Get classroom students error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
