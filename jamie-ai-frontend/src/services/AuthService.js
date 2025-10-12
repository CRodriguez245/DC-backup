// Authentication Service for user management
import { ApiService } from './ApiService.js';

export class AuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
  }

  // Initialize auth service
  init() {
    // Load user from localStorage (for session persistence)
    const savedUser = localStorage.getItem('decision_coach_current_user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('decision_coach_current_user');
      }
    }
    return this.currentUser !== null;
  }

  // Register new user
  async register(userData) {
    try {
      // Validate input
      if (!userData.email || !userData.name || !userData.role || !userData.password) {
        throw new Error('Email, name, role, and password are required');
      }

      // Call backend API
      const result = await ApiService.register(userData);
      
      if (result.success) {
        this.currentUser = result.user;
        // Save user session to localStorage
        localStorage.setItem('decision_coach_current_user', JSON.stringify(result.user));
        this.notifyListeners('register', result.user);
      }
      
      return result;
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

      // Call backend API
      const result = await ApiService.login(credentials.email, credentials.password);
      
      if (result.success) {
        this.currentUser = result.user;
        // Save user session to localStorage
        localStorage.setItem('decision_coach_current_user', JSON.stringify(result.user));
        this.notifyListeners('login', result.user);
      }
      
      return result;
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
    localStorage.removeItem('decision_coach_current_user');
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
  async updateProgress(character, sessionData) {
    if (!this.currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const result = await ApiService.updateProgress(this.currentUser.id, character, sessionData);
      
      if (result.success) {
        // Refresh user data to get updated progress
        const userResult = await ApiService.getUser(this.currentUser.id);
        if (userResult.success) {
          this.currentUser = userResult.user;
          localStorage.setItem('decision_coach_current_user', JSON.stringify(this.currentUser));
        }
        
        this.notifyListeners('progress_updated', this.currentUser);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Classroom management
  async createClassroom(name) {
    if (!this.currentUser || this.currentUser.role !== 'teacher') {
      return { success: false, error: 'Only teachers can create classrooms' };
    }

    try {
      const result = await ApiService.createClassroom(name, this.currentUser.id, this.currentUser.name);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async joinClassroom(code) {
    if (!this.currentUser || this.currentUser.role !== 'student') {
      return { success: false, error: 'Only students can join classrooms' };
    }

    try {
      const result = await ApiService.joinClassroom(code, this.currentUser.id);
      
      if (result.success) {
        // Refresh user data to get updated classroom info
        const userResult = await ApiService.getUser(this.currentUser.id);
        if (userResult.success) {
          this.currentUser = userResult.user;
          localStorage.setItem('decision_coach_current_user', JSON.stringify(this.currentUser));
        }
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getUserClassrooms() {
    if (!this.currentUser) {
      return { success: false, classrooms: [], error: 'No user logged in' };
    }

    try {
      if (this.currentUser.role === 'teacher') {
        return await ApiService.getTeacherClassrooms(this.currentUser.id);
      } else {
        return await ApiService.getStudentClassrooms(this.currentUser.id);
      }
    } catch (error) {
      return {
        success: false,
        classrooms: [],
        error: error.message
      };
    }
  }

  async getClassroomStudents(classroomId) {
    if (!this.currentUser || this.currentUser.role !== 'teacher') {
      return { success: false, students: [], error: 'Only teachers can view classroom students' };
    }

    try {
      return await ApiService.getClassroomStudents(classroomId);
    } catch (error) {
      return {
        success: false,
        students: [],
        error: error.message
      };
    }
  }

  async getTeacherStudents() {
    if (!this.currentUser || this.currentUser.role !== 'teacher') {
      return { success: false, students: [], error: 'Only teachers can view students' };
    }

    try {
      return await ApiService.getTeacherStudents(this.currentUser.id);
    } catch (error) {
      return {
        success: false,
        students: [],
        error: error.message
      };
    }
  }

  // Event listeners
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
        console.error('Error in auth listener:', error);
      }
    });
  }
}

// Export singleton instance
export const authService = new AuthService();