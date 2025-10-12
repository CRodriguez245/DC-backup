const express = require('express');
const router = express.Router();
const database = require('../database');

// Register new user
router.post('/register', (req, res) => {
  try {
    const { email, name, role, password } = req.body;

    // Validate input
    if (!email || !name || !role || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email, name, role, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = database.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Create new user
    const user = database.createUser({
      email,
      name,
      role,
      password
    });

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      user: userResponse,
      message: 'Account created successfully!'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Login user
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user
    const user = database.findUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    database.saveUsers();

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      user: userResponse,
      message: 'Login successful!'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update user progress
router.post('/progress', (req, res) => {
  try {
    const { userId, character, sessionData } = req.body;

    if (!userId || !character || !sessionData) {
      return res.status(400).json({
        success: false,
        error: 'userId, character, and sessionData are required'
      });
    }

    const success = database.updateUserProgress(userId, character, sessionData);
    
    if (success) {
      res.json({
        success: true,
        message: 'Progress updated successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user by ID
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const user = database.findUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get teacher's students
router.get('/:teacherId/students', (req, res) => {
  try {
    const { teacherId } = req.params;
    const teacher = database.findUserById(teacherId);

    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    // Get all students from teacher's classrooms
    const classrooms = database.getTeacherClassrooms(teacherId);
    const students = [];

    classrooms.forEach(classroom => {
      const classroomStudents = database.getClassroomStudents(classroom.id);
      students.push(...classroomStudents);
    });

    // Remove duplicates and passwords
    const uniqueStudents = students.filter((student, index, self) => 
      index === self.findIndex(s => s.id === student.id)
    ).map(({ password, ...student }) => student);

    res.json({
      success: true,
      students: uniqueStudents
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
