// Simple file-based database for user data persistence
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CLASSROOMS_FILE = path.join(DATA_DIR, 'classrooms.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class Database {
  constructor() {
    this.users = this.loadUsers();
    this.classrooms = this.loadClassrooms();
  }

  // User management
  loadUsers() {
    try {
      if (fs.existsSync(USERS_FILE)) {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
    return [];
  }

  saveUsers() {
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(this.users, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving users:', error);
      return false;
    }
  }

  // Classroom management
  loadClassrooms() {
    try {
      if (fs.existsSync(CLASSROOMS_FILE)) {
        const data = fs.readFileSync(CLASSROOMS_FILE, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading classrooms:', error);
    }
    return [];
  }

  saveClassrooms() {
    try {
      fs.writeFileSync(CLASSROOMS_FILE, JSON.stringify(this.classrooms, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving classrooms:', error);
      return false;
    }
  }

  // User operations
  createUser(userData) {
    const user = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      password: userData.password, // In production, this should be hashed
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      progress: {},
      analytics: {
        totalSessions: 0,
        averageScore: 0,
        completedCharacters: 0
      },
      classroomIds: []
    };

    this.users.push(user);
    this.saveUsers();
    return user;
  }

  findUserByEmail(email) {
    return this.users.find(user => user.email === email);
  }

  findUserById(id) {
    return this.users.find(user => user.id === id);
  }

  updateUserProgress(userId, character, sessionData) {
    const user = this.findUserById(userId);
    if (!user) return false;

    // Initialize character progress if it doesn't exist
    if (!user.progress[character]) {
      user.progress[character] = {
        completed: false,
        sessions: [],
        lastSession: null
      };
    }

    // Clean messages to avoid circular references
    const cleanMessages = (sessionData.messages || []).map(msg => ({
      id: msg.id,
      message: msg.message,
      isUser: msg.isUser,
      timestamp: msg.timestamp,
      isSessionEnd: msg.isSessionEnd,
      showFinalScore: msg.showFinalScore,
      dqScore: msg.dqScore,
      sessionId: msg.sessionId,
      userId: msg.userId
    }));

    const session = {
      id: `session_${Date.now()}`,
      date: new Date().toISOString(),
      score: sessionData.finalScore,
      attempts: sessionData.attemptsUsed,
      mode: sessionData.mode || 'assessment',
      dqScores: sessionData.dqScores || {},
      completed: sessionData.completed || false,
      messages: cleanMessages
    };

    user.progress[character].sessions.push(session);
    user.progress[character].lastSession = session;

    // Update completion status
    if (sessionData.finalScore >= 0.8) {
      user.progress[character].completed = true;
    }

    // Update analytics
    this.updateUserAnalytics(user);
    user.lastLogin = new Date().toISOString();

    this.saveUsers();
    return true;
  }

  updateUserAnalytics(user) {
    const allSessions = [];
    Object.values(user.progress).forEach(charProgress => {
      allSessions.push(...charProgress.sessions);
    });

    if (allSessions.length > 0) {
      user.analytics.totalSessions = allSessions.length;
      user.analytics.averageScore = allSessions.reduce((sum, session) => sum + session.score, 0) / allSessions.length;
      
      const completedCharacters = Object.values(user.progress).filter(charProgress => charProgress.completed).length;
      user.analytics.completedCharacters = completedCharacters;
    }
  }

  // Classroom operations
  createClassroom(classroomData) {
    const classroom = {
      id: `classroom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: classroomData.name,
      code: this.generateClassCode(),
      teacherId: classroomData.teacherId,
      teacherName: classroomData.teacherName,
      studentIds: [],
      createdAt: new Date().toISOString()
    };

    this.classrooms.push(classroom);
    this.saveClassrooms();
    return classroom;
  }

  generateClassCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  findClassroomByCode(code) {
    return this.classrooms.find(classroom => classroom.code === code);
  }

  findClassroomById(id) {
    return this.classrooms.find(classroom => classroom.id === id);
  }

  addStudentToClassroom(classroomId, studentId) {
    const classroom = this.findClassroomById(classroomId);
    if (!classroom) return false;

    if (!classroom.studentIds.includes(studentId)) {
      classroom.studentIds.push(studentId);
      this.saveClassrooms();

      // Add classroom to user
      const student = this.findUserById(studentId);
      if (student && !student.classroomIds.includes(classroomId)) {
        student.classroomIds.push(classroomId);
        this.saveUsers();
      }
    }

    return true;
  }

  getTeacherClassrooms(teacherId) {
    return this.classrooms.filter(classroom => classroom.teacherId === teacherId);
  }

  getStudentClassrooms(studentId) {
    const student = this.findUserById(studentId);
    if (!student) return [];
    
    return this.classrooms.filter(classroom => student.classroomIds.includes(classroom.id));
  }

  getClassroomStudents(classroomId) {
    const classroom = this.findClassroomById(classroomId);
    if (!classroom) return [];

    return classroom.studentIds.map(studentId => this.findUserById(studentId)).filter(Boolean);
  }
}

// Export singleton instance
module.exports = new Database();
