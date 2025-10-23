// Supabase-based Authentication Service
import { auth, db } from '../lib/supabase.js';
import { User, UserManager } from '../models/User.js';
import { ClassroomManager } from '../models/Classroom.js';

export class SupabaseAuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
    this.isInitialized = false;
  }

  // Initialize auth service with Supabase
  async init() {
    if (this.isInitialized) return this.currentUser !== null;

    try {
      // Check for existing session
      const { user, error } = await auth.getCurrentUser();
      
      if (user && !error) {
        // Load user profile from database
        const { data: profile, error: profileError } = await db.getUserProfile(user.id);
        
        if (profile && !profileError) {
          this.currentUser = User.fromJSON({
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role,
            createdAt: profile.created_at,
            lastLogin: new Date().toISOString()
          });
          
          // Migrate any existing local data
          this.migrateCompletionStatus();
        }
      }

      // Set up auth state listener
      auth.onAuthStateChange((event, session) => {
        this.handleAuthStateChange(event, session);
      });

      this.isInitialized = true;
      return this.currentUser !== null;
    } catch (error) {
      console.error('Supabase auth initialization error:', error);
      return false;
    }
  }

  // Handle auth state changes from Supabase
  async handleAuthStateChange(event, session) {
    if (event === 'SIGNED_IN' && session?.user) {
      // User signed in
      const { data: profile, error } = await db.getUserProfile(session.user.id);
      
      if (profile && !error) {
        this.currentUser = User.fromJSON({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          createdAt: profile.created_at,
          lastLogin: new Date().toISOString()
        });
        
        // Save to local storage for offline access
        UserManager.saveUser(this.currentUser);
        this.notifyListeners('login', this.currentUser);
      }
    } else if (event === 'SIGNED_OUT') {
      // User signed out
      this.currentUser = null;
      UserManager.clearUser();
      this.notifyListeners('logout', null);
    }
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

  // Register new user with Supabase
  async register(userData) {
    try {
      // Validate input
      if (!userData.email || !userData.name || !userData.role || !userData.password) {
        throw new Error('Email, name, role, and password are required');
      }

      // Sign up with Supabase Auth
      const { data, error } = await auth.signUp(userData.email, userData.password, {
        name: userData.name,
        role: userData.role
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // Create user profile in database
        const { error: profileError } = await db.createUserProfile(
          data.user.id,
          userData.email,
          userData.name,
          userData.role
        );

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Continue anyway - profile might be created by trigger
        }

        // Create teacher profile if needed
        if (userData.role === 'teacher') {
          const { error: teacherError } = await db.createTeacher(
            data.user.id,
            userData.school || '',
            userData.department || ''
          );

          if (teacherError) {
            console.error('Teacher profile creation error:', teacherError);
          }
        }

        // Create local user instance
        const newUser = new User({
          id: data.user.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          createdAt: new Date().toISOString()
        });

        this.currentUser = newUser;
        UserManager.saveUser(newUser);
        this.notifyListeners('register', newUser);

        return {
          success: true,
          user: newUser,
          message: 'Account created successfully!'
        };
      } else {
        throw new Error('Failed to create user account');
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Login user with Supabase
  async login(credentials) {
    try {
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      // Sign in with Supabase Auth
      const { data, error } = await auth.signIn(credentials.email, credentials.password);

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // Load user profile from database
        const { data: profile, error: profileError } = await db.getUserProfile(data.user.id);
        
        if (profileError) {
          throw new Error('Failed to load user profile');
        }

        // Create User instance
        const user = new User({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          createdAt: profile.created_at,
          lastLogin: new Date().toISOString()
        });

        this.currentUser = user;
        UserManager.saveUser(user);
        this.notifyListeners('login', user);

        return {
          success: true,
          user: user,
          message: 'Login successful!'
        };
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Logout user
  async logout() {
    try {
      const { error } = await auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
      }

      this.currentUser = null;
      UserManager.clearUser();
      this.notifyListeners('logout', null);

      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is logged in
  isLoggedIn() {
    return this.currentUser !== null;
  }

  // Update user progress (save to both local and Supabase)
  async updateProgress(character, sessionData) {
    if (!this.currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      // Update local user progress
      this.currentUser.updateProgress(character, sessionData);
      
      // Save to Supabase
      const { error } = await db.updateProgress(
        this.currentUser.id,
        character,
        sessionData.mode || 'assessment',
        sessionData.dqScores
      );

      if (error) {
        console.error('Supabase progress update error:', error);
        // Continue with local save anyway
      }

      // Save locally
      if (UserManager.saveUser(this.currentUser)) {
        this.notifyListeners('progress_updated', this.currentUser);
        return {
          success: true,
          user: this.currentUser,
          message: 'Progress updated successfully'
        };
      } else {
        throw new Error('Failed to save progress locally');
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
  async updateProfile(profileData) {
    if (!this.currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      // Update local user data
      if (profileData.name) this.currentUser.name = profileData.name;
      if (profileData.role) this.currentUser.role = profileData.role;
      
      // Update in Supabase (if needed)
      // Note: Supabase Auth handles profile updates differently
      
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

  // Classroom management methods (integrate with Supabase)
  async joinClassroom(classCode) {
    if (!this.currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const { data, error } = await db.joinClassroom(this.currentUser.id, classCode);
      
      if (error) {
        return { success: false, error: error.message };
      }

      // Also update local classroom manager for compatibility
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

  async createClassroom(classroomData) {
    if (!this.currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    if (this.currentUser.role !== 'teacher') {
      return { success: false, error: 'Only teachers can create classrooms' };
    }

    try {
      // Create in Supabase
      const { data, error } = await db.createClassroom(
        this.currentUser.id,
        classroomData.name,
        classroomData.description
      );

      if (error) {
        return { success: false, error: error.message };
      }

      // Also create in local classroom manager for compatibility
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

  // Demo mode helpers (keep existing functionality)
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
export const supabaseAuthService = new SupabaseAuthService();
