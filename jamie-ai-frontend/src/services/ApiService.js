// API Service for backend communication
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://jamie-backend.onrender.com' 
  : 'http://localhost:3001';

export class ApiService {
  // User authentication
  static async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  static async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  static async getUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get user error:', error);
      return {
        success: false,
        error: 'Failed to fetch user data'
      };
    }
  }

  // Progress management
  static async updateProgress(userId, character, sessionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          character,
          sessionData
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Update progress error:', error);
      return {
        success: false,
        error: 'Failed to save progress'
      };
    }
  }

  // Classroom management
  static async createClassroom(name, teacherId, teacherName) {
    try {
      const response = await fetch(`${API_BASE_URL}/classrooms/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          teacherId,
          teacherName
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Create classroom error:', error);
      return {
        success: false,
        error: 'Failed to create classroom'
      };
    }
  }

  static async joinClassroom(code, studentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/classrooms/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          studentId
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Join classroom error:', error);
      return {
        success: false,
        error: 'Failed to join classroom'
      };
    }
  }

  static async getTeacherClassrooms(teacherId) {
    try {
      const response = await fetch(`${API_BASE_URL}/classrooms/teacher/${teacherId}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get teacher classrooms error:', error);
      return {
        success: false,
        classrooms: [],
        error: 'Failed to fetch classrooms'
      };
    }
  }

  static async getStudentClassrooms(studentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/classrooms/student/${studentId}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get student classrooms error:', error);
      return {
        success: false,
        classrooms: [],
        error: 'Failed to fetch classrooms'
      };
    }
  }

  static async getClassroomStudents(classroomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/classrooms/${classroomId}/students`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get classroom students error:', error);
      return {
        success: false,
        students: [],
        error: 'Failed to fetch students'
      };
    }
  }

  static async getTeacherStudents(teacherId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${teacherId}/students`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get teacher students error:', error);
      return {
        success: false,
        students: [],
        error: 'Failed to fetch students'
      };
    }
  }
}
