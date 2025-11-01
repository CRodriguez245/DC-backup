// Supabase-based Authentication Service
import { auth, db, supabase } from '../lib/supabase.js';
import { User, UserManager } from '../models/User.js';
import { ClassroomManager } from '../models/Classroom.js';

export class SupabaseAuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
    this.isInitialized = false;
    this.isLoadingProgress = false; // Prevent duplicate progress loading
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

  // Sync local progress data to database
  async syncLocalProgressToDatabase() {
    if (!this.currentUser || !this.currentUser.progress) {
      console.log('No user or progress data to sync');
      return;
    }

    console.log('Syncing local progress to database for user:', this.currentUser.id);
    
    try {
      // Check each character for completed sessions
      for (const [character, charProgress] of Object.entries(this.currentUser.progress)) {
        if (charProgress.sessions && charProgress.sessions.length > 0) {
          console.log(`Syncing ${character} progress:`, charProgress);
          
          // Get the latest session
          const latestSession = charProgress.lastSession || charProgress.sessions[charProgress.sessions.length - 1];
          
          if (latestSession && charProgress.completed) {
            // Save progress to database
            const { data, error } = await db.updateProgress(
              this.currentUser.id,
              character,
              latestSession.mode || 'assessment',
              latestSession.dqScores || { overall: latestSession.score || 0 }
            );
            
            if (error) {
              console.error(`Error syncing ${character} progress:`, error);
            } else {
              console.log(`Successfully synced ${character} progress:`, data);
            }
          }
        }
      }
      
      console.log('Local progress sync completed');
    } catch (error) {
      console.error('Error syncing local progress to database:', error);
    }
  }

  // Check if user has progress data in local storage
  checkForLocalStorageProgress() {
    if (!this.currentUser) return false;
    
    // Check for session data in localStorage
    const characters = ['jamie', 'andres', 'kavya'];
    for (const character of characters) {
      const sessionKey = `session_${this.currentUser.id}_${character}`;
      const savedSession = localStorage.getItem(sessionKey);
      if (savedSession) {
        try {
          const sessionData = JSON.parse(savedSession);
          if (sessionData && sessionData.messages && sessionData.messages.length > 0) {
            console.log(`Found local storage session for ${character}:`, sessionData);
            return true;
          }
        } catch (error) {
          console.error(`Error parsing local storage session for ${character}:`, error);
        }
      }
    }
    
    return false;
  }

  // Sync local storage progress to database
  async syncLocalStorageProgressToDatabase() {
    if (!this.currentUser) {
      console.log('No user to sync local storage progress');
      return;
    }

    console.log('Syncing local storage progress to database for user:', this.currentUser.id);
    
    try {
      const characters = ['jamie', 'andres', 'kavya'];
      
      for (const character of characters) {
        const sessionKey = `session_${this.currentUser.id}_${character}`;
        const savedSession = localStorage.getItem(sessionKey);
        
        if (savedSession) {
          try {
            const sessionData = JSON.parse(savedSession);
            if (sessionData && sessionData.messages && sessionData.messages.length > 0) {
              console.log(`Syncing ${character} session from local storage:`, sessionData);
              
              // Save progress to database
              const { data, error } = await db.updateProgress(
                this.currentUser.id,
                character,
                sessionData.mode || 'assessment',
                sessionData.dqScores || { overall: sessionData.finalScore || 0 }
              );
              
              if (error) {
                console.error(`Error syncing ${character} progress from local storage:`, error);
              } else {
                console.log(`Successfully synced ${character} progress from local storage:`, data);
              }
            }
          } catch (error) {
            console.error(`Error parsing local storage session for ${character}:`, error);
          }
        }
      }
      
      console.log('Local storage progress sync completed');
    } catch (error) {
      console.error('Error syncing local storage progress to database:', error);
    }
  }

  // Process progress data from database
  async processProgressData(progressData) {
    // Transform Supabase progress data to match local format
    const progress = {
      jamie: { completed: false, sessions: [], analytics: { averageScore: 0, totalSessions: 0 } },
      andres: { completed: false, sessions: [], analytics: { averageScore: 0, totalSessions: 0 } },
      kavya: { completed: false, sessions: [], analytics: { averageScore: 0, totalSessions: 0 } }
    };

    // Process each progress record
    console.log('Processing progress records:', progressData);
    (progressData || []).forEach(record => {
      console.log('Processing record:', record);
      const character = record.character_name.toLowerCase();
      console.log('Character name:', character, 'exists in progress:', !!progress[character]);
      if (progress[character]) {
        progress[character].completed = true;
        progress[character].analytics.averageScore = record.average_dq_score || 0;
        progress[character].analytics.totalSessions = 1; // Each record represents a completed session
        
        // Add session data with complete structure to match User model
        const session = {
          id: 'session_' + Date.now(),
          date: record.completed_at || new Date().toISOString(),
          score: record.average_dq_score || 0,
          attempts: 20, // Default attempts for completed sessions
          mode: record.level || 'assessment',
          dqScores: { overall: record.average_dq_score || 0 },
          completed: true,
          messages: [] // Empty messages array for Supabase-loaded sessions
        };
        
        progress[character].sessions = [session];
        progress[character].lastSession = session; // Set lastSession for getCharacterStatus
        console.log('Updated progress for character:', character, progress[character]);
      }
    });

    // Update the user's progress by creating a new User instance
    const updatedUser = new User({
      ...this.currentUser,
      progress: progress
    });
    this.currentUser = updatedUser;
    
    console.log('Loaded progress from Supabase:', progress);
    console.log('Final progress structure:', JSON.stringify(progress, null, 2));
    
    // Notify listeners that progress was updated
    console.log('Notifying listeners of progress_loaded event');
    this.notifyListeners('progress_loaded', this.currentUser);
    console.log('processProgressData completed successfully');
  }

  // Load progress from Supabase
  loadProgressFromSupabase = async () => {
    console.log('loadProgressFromSupabase called:', {
      hasCurrentUser: !!this.currentUser,
      userRole: this.currentUser?.role,
      isLoadingProgress: this.isLoadingProgress
    });
    
    if (!this.currentUser) {
      console.log('loadProgressFromSupabase: No current user, attempting to get from auth session');
      
      // Try to get current user from auth session
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.log('loadProgressFromSupabase: No auth session found, skipping');
        return;
      }
      
      // Get user profile and set as current user
      const { data: profile, error: profileError } = await db.getUserProfile(user.id);
      if (profileError || !profile) {
        console.log('loadProgressFromSupabase: No user profile found, skipping');
        return;
      }
      
      this.currentUser = new User(profile);
      console.log('loadProgressFromSupabase: Set currentUser from auth session:', this.currentUser);
    }

    // Prevent duplicate loading
    if (this.isLoadingProgress) {
      console.log('loadProgressFromSupabase: Already loading, skipping duplicate call');
      return;
    }

    this.isLoadingProgress = true;
    
    // Notify listeners that progress loading has started
    this.notifyListeners('progress_loading_started', this.currentUser);

    try {
      console.log('Calling db.getStudentProgress for user:', this.currentUser.id, 'role:', this.currentUser.role);
      const { data: progressData, error } = await db.getStudentProgress(this.currentUser.id);
      
      console.log('getStudentProgress result:', { progressData, error });
      console.log('Progress data length:', progressData?.length);
      console.log('User ID:', this.currentUser.id, 'Role:', this.currentUser.role);
      
      if (error) {
        console.error('Error loading progress from Supabase:', error);
        // Notify listeners that progress loading failed
        this.notifyListeners('progress_loading_failed', this.currentUser);
        return;
      }
      
      if (!progressData || progressData.length === 0) {
        console.log('No progress data found for user:', this.currentUser.id, 'role:', this.currentUser.role);
        
        // Check if user has local storage data that needs to be synced
        const hasLocalProgress = this.checkForLocalStorageProgress();
        
        if (hasLocalProgress) {
          console.log('User has local storage progress data, attempting to sync to database');
          await this.syncLocalStorageProgressToDatabase();
          
          // After syncing, reload progress from database to get the updated data
          console.log('Re-loading progress after sync');
          const { data: updatedProgressData, error: updatedError } = await db.getStudentProgress(this.currentUser.id);
          
          if (!updatedError && updatedProgressData && updatedProgressData.length > 0) {
            console.log('Successfully loaded progress after sync:', updatedProgressData);
            // Process the updated progress data
            await this.processProgressData(updatedProgressData);
          }
        }
        
        // Still notify listeners that progress was loaded (even if empty)
        this.notifyListeners('progress_loaded', this.currentUser);
        return;
      }

      // Process the progress data
      await this.processProgressData(progressData);
    } catch (error) {
      console.error('Error in loadProgressFromSupabase:', error);
      // Notify listeners that progress loading failed
      this.notifyListeners('progress_loading_failed', this.currentUser);
    } finally {
      console.log('loadProgressFromSupabase finally block - setting isLoadingProgress to false');
      this.isLoadingProgress = false;
    }
  }

  // Handle auth state changes from Supabase
  async handleAuthStateChange(event, session) {
    console.log('handleAuthStateChange called:', { event, hasSession: !!session, userId: session?.user?.id });
    
    if (event === 'SIGNED_IN' && session?.user) {
      // Prevent duplicate processing
      if (this.currentUser && this.currentUser.id === session.user.id) {
        console.log('User already signed in, skipping duplicate SIGNED_IN event');
        return;
      }
      
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
        
        // Load progress from Supabase for students
        if (this.currentUser.role === 'student') {
          await this.loadProgressFromSupabase();
        }
        
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
        // Don't fire login event here - handleAuthStateChange will handle it

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

  // Refresh current user from Supabase
  async refreshCurrentUser() {
    try {
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
          
          // Load progress from Supabase for students
          if (this.currentUser.role === 'student') {
            await this.loadProgressFromSupabase();
          }
          
          UserManager.saveUser(this.currentUser);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error refreshing current user:', error);
      return false;
    }
  }

  // Check if user is logged in
  isLoggedIn() {
    return this.currentUser !== null;
  }

  // Update user progress (save to both local and Supabase)
  async updateProgress(character, sessionData) {
    if (!this.currentUser) {
      console.error('updateProgress: No user logged in');
      return { success: false, error: 'No user logged in' };
    }

    console.log('updateProgress called:', {
      character,
      sessionData,
      userId: this.currentUser.id,
      userRole: this.currentUser.role
    });

    try {
      // Update local user progress
      this.currentUser.updateProgress(character, sessionData);
      
      // Save to Supabase
      console.log('Attempting to save progress to Supabase:', {
        studentId: this.currentUser.id,
        character,
        level: sessionData.mode || 'assessment',
        dqScores: sessionData.dqScores
      });

      // First, create a session record
      const { data: sessionData_result, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          student_id: this.currentUser.id,
          character_name: character,
          session_type: 'coaching',
          completed_at: new Date().toISOString(),
          turns_used: sessionData.attemptsUsed || 20,
          max_turns: 20,
          session_status: 'completed'
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Error creating session:', sessionError);
      } else {
        console.log('Session created:', sessionData_result);
        
        // Now save the messages for this session
        if (sessionData.messages && sessionData.messages.length > 0) {
          console.log('Saving messages to Supabase:', {
            sessionId: sessionData_result.id,
            messageCount: sessionData.messages.length,
            sampleMessage: sessionData.messages[0]
          });
          
          const messagesToInsert = sessionData.messages.map((msg, index) => ({
            session_id: sessionData_result.id,
            message_type: msg.isUser ? 'user' : (msg.isSessionEnd ? 'system' : character),
            content: msg.message,
            timestamp: msg.timestamp || new Date().toISOString(),
            dq_scores: (msg.dqScore || msg.dq_score) ? JSON.stringify(msg.dqScore || msg.dq_score) : null,
            dq_score_minimum: (msg.dqScore || msg.dq_score) ? Math.min(...Object.values(msg.dqScore || msg.dq_score)) : null,
            turn_number: index + 1
          }));

          console.log('Messages to insert:', messagesToInsert.slice(0, 2)); // Log first 2 messages

          const { error: messagesError } = await supabase
            .from('messages')
            .insert(messagesToInsert);

          if (messagesError) {
            console.error('Error saving messages:', messagesError);
          } else {
            console.log('Messages saved successfully');
          }
        } else {
          console.log('No messages to save:', sessionData.messages);
        }
      }

      // Also save to student_progress table (existing functionality)
      const { data, error } = await db.updateProgress(
        this.currentUser.id,
        character,
        sessionData.mode || 'assessment',
        sessionData.dqScores
      );

      if (error) {
        console.error('Supabase progress update error:', error);
        // Continue with local save anyway
      } else {
        console.log('Successfully saved progress to Supabase:', data);
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
    // Prevent duplicate listeners by checking if callback already exists
    if (!this.listeners.includes(callback)) {
      this.listeners.push(callback);
      console.log('Added listener, total listeners:', this.listeners.length);
    } else {
      console.log('Listener already exists, skipping duplicate');
    }
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  clearAllListeners() {
    console.log('Clearing all listeners, previous count:', this.listeners.length);
    this.listeners = [];
  }

  notifyListeners(event, data) {
    console.log('notifyListeners called:', { event, data: !!data, listenerCount: this.listeners.length });
    this.listeners.forEach((listener, index) => {
      try {
        console.log(`Calling listener ${index} with event:`, event);
        listener(event, data);
      } catch (error) {
        console.error('Auth listener error:', error);
      }
    });
  }

  // Classroom management methods (integrate with Supabase)
  async joinClassroom(classCode) {
    // Ensure auth service is initialized
    if (!this.isInitialized) {
      await this.init();
    }
    
    // Check if user is logged in, try to refresh if not
    if (!this.currentUser) {
      const refreshed = await this.refreshCurrentUser();
      if (!refreshed) {
        return { success: false, error: 'No user logged in. Please log in first.' };
      }
    }

    try {
      const { data, error } = await db.joinClassroom(this.currentUser.id, classCode);
      
      if (error) {
        // Check if user is already enrolled - this is actually a success case
        if (error.message && error.message.includes('already enrolled')) {
          // User is already enrolled, so this is actually success
          // Get the classroom info to return
          const { data: classroomsData } = await db.getStudentClassrooms(this.currentUser.id);
          const classroom = classroomsData?.find(c => 
            c.classrooms?.classroom_code === classCode
          );
          
          if (classroom) {
            return {
              success: true,
              classroom: {
                id: classroom.classrooms.id,
                name: classroom.classrooms.name,
                code: classroom.classrooms.classroom_code
              },
              message: 'You are already enrolled in this classroom'
            };
          }
        }
        return { success: false, error: error.message || error };
      }

      // Enrollment succeeded - get classroom details
      if (data) {
        // Get full classroom info
        const { data: classroomsData } = await db.getStudentClassrooms(this.currentUser.id);
        const classroom = classroomsData?.find(c => 
          c.classrooms?.classroom_code === classCode
        );
        
        if (classroom) {
          const classroomInfo = {
            id: classroom.classrooms.id,
            name: classroom.classrooms.name,
            description: classroom.classrooms.description,
            code: classroom.classrooms.classroom_code,
            teacherId: classroom.classrooms.teacher_id,
            createdAt: classroom.classrooms.created_at
          };
          
          // Add classroom ID to user's classroomIds
          if (!this.currentUser.classroomIds.includes(classroomInfo.id)) {
            this.currentUser.classroomIds.push(classroomInfo.id);
            UserManager.saveUser(this.currentUser);
          }
          
          // Also update local classroom manager for compatibility
          ClassroomManager.addStudentToClassroom(classCode, this.currentUser.id);
          
          this.notifyListeners('classroom_joined', classroomInfo);
          return {
            success: true,
            classroom: classroomInfo,
            message: `Successfully joined ${classroomInfo.name}!`
          };
        }
      }
      
      // Fallback: try local classroom manager
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
      }
      
      return { success: false, error: 'Failed to join classroom' };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getUserClassrooms() {
    console.log('getUserClassrooms called, currentUser:', this.currentUser);
    
    if (!this.currentUser) {
      console.log('No current user, returning error');
      return { success: false, error: 'No user logged in' };
    }

    try {
      if (this.currentUser.role === 'teacher') {
        console.log('Getting teacher classrooms for user:', this.currentUser.id);
        // Get classrooms created by this teacher
        const { data, error } = await db.getTeacherClassrooms(this.currentUser.id);
        console.log('getTeacherClassrooms result:', { data, error });
        
        if (error) {
          console.error('Error getting teacher classrooms:', error);
          return { success: false, error: error.message };
        }
        
        // Transform database format to frontend format
        const classrooms = (data || []).map(classroom => ({
          id: classroom.id,
          name: classroom.name,
          description: classroom.description,
          code: classroom.classroom_code, // Transform classroom_code to code
          teacherId: classroom.teacher_id,
          teacherName: this.currentUser.name,
          createdAt: classroom.created_at,
          studentIds: classroom.enrollments?.map(enrollment => enrollment.student_id) || []
        }));
        
        console.log('Transformed classrooms:', classrooms);
        
        // Update user's classroomIds
        this.currentUser.classroomIds = classrooms.map(c => c.id);
        console.log('Updated user classroomIds:', this.currentUser.classroomIds);
        
        return { success: true, classrooms };
      } else {
        console.log('Getting student classrooms for user:', this.currentUser.id);
        // Get classrooms where this student is enrolled
        const { data, error } = await db.getStudentClassrooms(this.currentUser.id);
        console.log('getStudentClassrooms result:', { data, error });
        
        if (error) {
          console.error('Error getting student classrooms:', error);
          return { success: false, error: error.message };
        }
        
        // Transform database format to frontend format
        const classrooms = (data || []).map(enrollment => {
          const classroom = enrollment.classrooms;
          
          // Extract teacher's first name from teacher_name (added in query)
          let teacherFirstName = 'Teacher'; // Default fallback
          if (classroom.teacher_name) {
            const fullName = classroom.teacher_name;
            teacherFirstName = fullName.split(' ')[0] || fullName;
          }
          
          return {
            id: classroom.id,
            name: classroom.name,
            description: classroom.description,
            code: classroom.classroom_code, // Transform classroom_code to code
            teacherId: classroom.teacher_id,
            teacherName: teacherFirstName,
            createdAt: classroom.created_at,
            studentIds: classroom.enrollments?.map(enrollment => enrollment.student_id) || []
          };
        });
        
        console.log('Transformed student classrooms:', classrooms);
        
        // Update user's classroomIds
        this.currentUser.classroomIds = classrooms.map(c => c.id);
        console.log('Updated user classroomIds:', this.currentUser.classroomIds);
        
        return { success: true, classrooms };
      }
    } catch (error) {
      console.error('Error in getUserClassrooms:', error);
      return { success: false, error: error.message };
    }
  }

  async createClassroom(classroomData) {
    // Ensure auth service is initialized
    if (!this.isInitialized) {
      await this.init();
    }
    
    // Check if user is logged in, try to refresh if not
    if (!this.currentUser) {
      const refreshed = await this.refreshCurrentUser();
      if (!refreshed) {
        return { success: false, error: 'No user logged in. Please log in first.' };
      }
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

      // Transform database format to frontend format
      const classroom = {
        id: data.id,
        name: data.name,
        description: data.description,
        code: data.classroom_code, // Transform classroom_code to code
        teacherId: data.teacher_id,
        teacherName: this.currentUser.name,
        createdAt: data.created_at,
        studentIds: []
      };

      // Also create in local classroom manager for compatibility
      const result = ClassroomManager.createClassroom({
        ...classroomData,
        teacherId: this.currentUser.id,
        teacherName: this.currentUser.name
      });

      if (result.success) {
        // Add classroom ID to teacher's classroomIds
        this.currentUser.classroomIds.push(classroom.id);
        UserManager.saveUser(this.currentUser);
        
        this.notifyListeners('classroom_created', classroom);
        return {
          success: true,
          classroom: classroom,
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

  async getClassroomStudents(classroomId) {
    try {
      console.log('getClassroomStudents called with classroomId:', classroomId);
      
      // Get enrollments for this classroom
      console.log('Fetching enrollments for classroom:', classroomId);
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('enrollments')
        .select(`
          student_id,
          users!enrollments_student_id_fkey (
            id,
            name,
            email,
            role,
            created_at
          )
        `)
        .eq('classroom_id', classroomId);

      console.log('Enrollments query result:', { enrollments, enrollmentError });
      console.log('Number of enrollments found:', enrollments?.length || 0);

      if (enrollmentError) {
        console.error('Error getting classroom students:', enrollmentError);
        return { success: false, error: enrollmentError.message };
      }

      // Transform the data to match expected format and load progress for each student
      // Filter out enrollments where user is null (RLS might block access)
      const validEnrollments = (enrollments || []).filter(enrollment => enrollment.users !== null);
      
      if (validEnrollments.length === 0 && enrollments?.length > 0) {
        console.warn('All enrollments have null user data - this may indicate an RLS policy issue');
      }
      
      const students = await Promise.all(validEnrollments.map(async (enrollment) => {
        const user = enrollment.users;
        
        if (!user || !user.id) {
          console.warn('Skipping enrollment with null or invalid user:', enrollment);
          return null;
        }
        
        // Load progress data for this student
        const { data: progressData, error: progressError } = await supabase
          .from('student_progress')
          .select('*')
          .eq('student_id', user.id)
          .order('completed_at', { ascending: false });

        if (progressError) {
          console.error(`Error loading progress for student ${user.id}:`, progressError);
        }

        // Load session data with messages for this student
        console.log(`Loading sessions for student ${user.id}`);
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('sessions')
          .select(`
            id,
            character_name,
            completed_at,
            turns_used,
            messages (
              id,
              message_type,
              content,
              timestamp,
              dq_scores,
              dq_score_minimum,
              turn_number
            )
          `)
          .eq('student_id', user.id)
          .eq('session_status', 'completed')
          .order('completed_at', { ascending: false });

        if (sessionsError) {
          console.error(`Error loading sessions for student ${user.id}:`, sessionsError);
        } else {
          console.log(`Loaded ${sessionsData?.length || 0} sessions for student ${user.id}:`, sessionsData);
        }

        // Transform Supabase progress data to match local format
        const progress = {
          jamie: { completed: false, sessions: [], analytics: { averageScore: 0, totalSessions: 0 } },
          andres: { completed: false, sessions: [], analytics: { averageScore: 0, totalSessions: 0 } },
          kavya: { completed: false, sessions: [], analytics: { averageScore: 0, totalSessions: 0 } }
        };

        // Process each progress record
        (progressData || []).forEach(record => {
          const character = record.character_name.toLowerCase();
          if (progress[character]) {
            progress[character].completed = true;
            progress[character].analytics.averageScore = record.average_dq_score || 0;
            progress[character].analytics.totalSessions = 1; // Each record represents a completed session
            
            // Find the corresponding session with messages
            console.log(`Looking for matching session for character ${character}, progress completed_at: ${record.completed_at}`);
            console.log('Available sessions:', sessionsData);
            
            const matchingSession = sessionsData?.find(session => {
              const timeDiff = Math.abs(new Date(session.completed_at).getTime() - new Date(record.completed_at).getTime());
              const matches = session.character_name === character && timeDiff < 300000; // Within 5 minutes (increased tolerance)
              console.log(`Session ${session.id}: character=${session.character_name}, completed_at=${session.completed_at}, timeDiff=${timeDiff}ms, matches=${matches}`);
              return matches;
            });
            
            console.log('Found matching session:', matchingSession);
            console.log('Matching session messages:', matchingSession?.messages);
            
            // If no session matches by timestamp, use the most recent session for this character
            let sessionToUse = matchingSession;
            if (!sessionToUse) {
              console.log('No session matched by timestamp, looking for most recent session for character:', character);
              sessionToUse = sessionsData?.find(session => session.character_name === character);
              if (sessionToUse) {
                console.log('Using most recent session:', sessionToUse.id, 'completed_at:', sessionToUse.completed_at);
              }
            }
            
            // Transform messages to match frontend format
            let messages = [];
            if (sessionToUse && sessionToUse.messages) {
              console.log('Session has messages:', sessionToUse.messages.length);
              messages = sessionToUse.messages.map(msg => ({
                message: msg.content,
                isUser: msg.message_type === 'user',
                isSessionEnd: msg.message_type === 'system',
                timestamp: msg.timestamp,
                dqScore: msg.dq_scores ? JSON.parse(msg.dq_scores) : null,
                turnNumber: msg.turn_number
              }));
            } else {
              console.log('No session or no messages found');
            }
            
            // Add session data with complete structure to match User model
            const session = {
              id: sessionToUse?.id || 'session_' + Date.now(),
              date: sessionToUse?.completed_at || record.completed_at || new Date().toISOString(),
              score: record.average_dq_score || 0,
              attempts: sessionToUse?.turns_used || 20,
              mode: record.level || 'assessment',
              dqScores: { overall: record.average_dq_score || 0 },
              completed: true,
              messages: messages // Use messages from database
            };
            
            progress[character].sessions = [session];
            progress[character].lastSession = session; // Set lastSession for getCharacterStatus
          }
        });

        // Calculate overall analytics
        const allScores = progressData ? progressData.map(p => p.average_dq_score || 0) : [];
        const averageScore = allScores.length > 0 ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length : 0;
        const totalSessions = progressData ? progressData.length : 0;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.created_at,
          analytics: {
            averageScore: averageScore,
            totalSessions: totalSessions,
            improvement: 0, // Could be calculated if we had historical data
            preferredMode: 'assessment',
            lastActive: progressData && progressData.length > 0 ? progressData[0].completed_at : user.created_at
          },
          progress: progress
        };
      }));

      // Get classroom data
      const { data: classroomData, error: classroomError } = await supabase
        .from('classrooms')
        .select('*')
        .eq('id', classroomId)
        .single();

      if (classroomError) {
        console.error('Error getting classroom data:', classroomError);
        return { success: false, error: classroomError.message };
      }

      // Transform classroom data to match expected format
      const classroom = {
        id: classroomData.id,
        name: classroomData.name,
        description: classroomData.description,
        code: classroomData.classroom_code, // Map classroom_code to code
        teacherId: classroomData.teacher_id,
        createdAt: classroomData.created_at
      };

      // Filter out null students (enrollments where user data was blocked by RLS)
      const validStudents = students.filter(student => student !== null);
      
      console.log('getClassroomStudents returning:', { success: true, classroom, students: validStudents });
      console.log('Number of students being returned:', validStudents.length);
      console.log('Number of enrollments filtered out:', students.length - validStudents.length);
      
      return { success: true, classroom: classroom, students: validStudents };
    } catch (error) {
      console.error('Error in getClassroomStudents:', error);
      return { success: false, error: error.message };
    }
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
