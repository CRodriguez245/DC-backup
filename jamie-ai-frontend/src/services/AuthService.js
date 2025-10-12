// Authentication Service for user management
import { User, UserManager } from '../models/User.js';
import { ClassroomManager } from '../models/Classroom.js';

export class AuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
  }

  // Initialize auth service
  init() {
    this.currentUser = UserManager.loadUser();
    if (this.currentUser) {
      this.migrateCompletionStatus();
    }
    return this.currentUser !== null;
  }

  // Migrate existing completion status to new logic
  migrateCompletionStatus() {
    if (!this.currentUser || !this.currentUser.progress) return;

    let needsUpdate = false;

    // Check Jamie assessment mode sessions
    if (this.currentUser.progress.jamie) {
      const jamieProgress = this.currentUser.progress.jamie;
      
      // If Jamie has sessions but is not marked as completed, fix it
      if (jamieProgress.sessions && jamieProgress.sessions.length > 0 && !jamieProgress.completed) {
        // Check if any session is assessment mode
        const hasAssessmentSession = jamieProgress.sessions.some(session => session.mode === 'assessment');
        if (hasAssessmentSession) {
          jamieProgress.completed = true;
          needsUpdate = true;
        }
      }
    }

    // Check other characters for game mode completion
    ['andres', 'kavya'].forEach(character => {
      if (this.currentUser.progress[character]) {
        const charProgress = this.currentUser.progress[character];
        
        if (charProgress.sessions && charProgress.sessions.length > 0) {
          // Check if any session has 0.8+ score
          const hasHighScoreSession = charProgress.sessions.some(session => 
            session.score >= 0.8 && session.mode === 'game'
          );
          
          if (hasHighScoreSession && !charProgress.completed) {
            charProgress.completed = true;
            needsUpdate = true;
          }
        }
      }
    });

    // Save updated user data if changes were made
    if (needsUpdate) {
      UserManager.saveUser(this.currentUser);
      console.log('Migrated completion status for existing sessions');
    }
  }

  // Register new user
  async register(userData) {
    try {
      // Validate input
      if (!userData.email || !userData.name || !userData.role) {
        throw new Error('Email, name, and role are required');
      }

      // Check if user already exists (check all users, not just current)
      const allUsers = UserManager.loadAllUsers();
      const existingUser = allUsers.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Create new user
      const newUser = new User({
        email: userData.email,
        name: userData.name,
        role: userData.role,
        createdAt: new Date().toISOString()
      });

      // Save user (this will save to both current user and all users)
      if (UserManager.saveUser(newUser)) {
        this.currentUser = newUser;
        this.notifyListeners('register', newUser);
        return {
          success: true,
          user: newUser,
          message: 'Account created successfully!'
        };
      } else {
        throw new Error('Failed to save user data');
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Login user
  async login(credentials) {
    try {
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      // Search all users for the email
      const allUsers = UserManager.loadAllUsers();
      const userDataFromAll = allUsers.find(u => u.email === credentials.email);
      
      if (!userDataFromAll) {
        throw new Error('No account found with this email. Please sign up first.');
      }
      
      // Create User instance from the stored data
      const user = User.fromJSON(userDataFromAll);
      
      // Update last login
      user.lastLogin = new Date().toISOString();
      UserManager.saveUser(user);
      
      this.currentUser = user;
      this.notifyListeners('login', user);
      
      return {
        success: true,
        user: user,
        message: 'Login successful!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Logout user
  logout() {
    this.currentUser = null;
    UserManager.clearUser();
    this.notifyListeners('logout', null);
    return {
      success: true,
      message: 'Logged out successfully'
    };
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is logged in
  isLoggedIn() {
    return this.currentUser !== null;
  }

  // Update user progress
  updateProgress(character, sessionData) {
    if (!this.currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      this.currentUser.updateProgress(character, sessionData);
      
      if (UserManager.saveUser(this.currentUser)) {
        this.notifyListeners('progress_updated', this.currentUser);
        return {
          success: true,
          user: this.currentUser,
          message: 'Progress updated successfully'
        };
      } else {
        throw new Error('Failed to save progress');
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get user progress summary
  getProgressSummary() {
    if (!this.currentUser) {
      return null;
    }
    return this.currentUser.getProgressSummary();
  }

  // Update user profile
  updateProfile(profileData) {
    if (!this.currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      // Update user data
      if (profileData.name) this.currentUser.name = profileData.name;
      if (profileData.role) this.currentUser.role = profileData.role;
      
      if (UserManager.saveUser(this.currentUser)) {
        this.notifyListeners('profile_updated', this.currentUser);
        return {
          success: true,
          user: this.currentUser,
          message: 'Profile updated successfully'
        };
      } else {
        throw new Error('Failed to save profile');
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Event listeners for auth state changes
  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Auth listener error:', error);
      }
    });
  }

  // Classroom management methods
  joinClassroom(classCode) {
    if (!this.currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const result = ClassroomManager.addStudentToClassroom(classCode, this.currentUser.id);
      
      if (result.success) {
        // Add classroom ID to user's classroomIds
        if (!this.currentUser.classroomIds.includes(result.classroom.id)) {
          this.currentUser.classroomIds.push(result.classroom.id);
          UserManager.saveUser(this.currentUser);
        }
        
        this.notifyListeners('classroom_joined', result.classroom);
        return {
          success: true,
          classroom: result.classroom,
          message: `Successfully joined ${result.classroom.name}!`
        };
      } else {
        return result;
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  getUserClassrooms() {
    if (!this.currentUser) {
      return [];
    }

    if (this.currentUser.role === 'teacher') {
      return ClassroomManager.getTeacherClassrooms(this.currentUser.id);
    } else {
      return ClassroomManager.getStudentClassrooms(this.currentUser.id);
    }
  }

  createClassroom(classroomData) {
    if (!this.currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    if (this.currentUser.role !== 'teacher') {
      return { success: false, error: 'Only teachers can create classrooms' };
    }

    try {
      const result = ClassroomManager.createClassroom({
        ...classroomData,
        teacherId: this.currentUser.id,
        teacherName: this.currentUser.name
      });

      if (result.success) {
        // Add classroom ID to teacher's classroomIds
        this.currentUser.classroomIds.push(result.classroom.id);
        UserManager.saveUser(this.currentUser);
        
        this.notifyListeners('classroom_created', result.classroom);
        return {
          success: true,
          classroom: result.classroom,
          message: 'Classroom created successfully!'
        };
      } else {
        return result;
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  getClassroomStudents(classroomId) {
    const classroom = ClassroomManager.getClassroom(classroomId);
    if (!classroom) {
      return { success: false, error: 'Classroom not found' };
    }

    // Get all users and filter by student IDs
    const students = [];
    classroom.studentIds.forEach(studentId => {
      const user = UserManager.getUserById(studentId);
      if (user) {
        students.push(user);
      }
    });

    return { success: true, students: students, classroom: classroom };
  }

  // Demo mode helpers
  createDemoUser() {
    const demoUser = new User({
      email: 'demo@decisioncoach.com',
      name: 'Demo User',
      role: 'student',
      createdAt: new Date().toISOString()
    });

    // Add some demo progress
    demoUser.updateProgress('jamie', {
      finalScore: 0.85,
      attemptsUsed: 15,
      mode: 'assessment',
      dqScores: {
        framing: 0.9,
        alternatives: 0.8,
        information: 0.85,
        values: 0.9,
        reasoning: 0.8,
        commitment: 0.85
      },
      completed: true
    });

    demoUser.updateProgress('andres', {
      finalScore: 0.75,
      attemptsUsed: 18,
      mode: 'game',
      dqScores: {
        framing: 0.8,
        alternatives: 0.75,
        information: 0.7,
        values: 0.8,
        reasoning: 0.75,
        commitment: 0.7
      },
      completed: false
    });

    UserManager.saveUser(demoUser);
    this.currentUser = demoUser;
    this.notifyListeners('demo_created', demoUser);
    
    return {
      success: true,
      user: demoUser,
      message: 'Demo user created successfully'
    };
  }
}

// Create singleton instance
export const authService = new AuthService();
