// User Data Model for localStorage-based persistence
export class User {
  constructor(userData = {}) {
    this.id = userData.id || this.generateId();
    this.email = userData.email || '';
    this.name = userData.name || '';
    this.role = userData.role || 'student'; // 'student' or 'teacher'
    this.createdAt = userData.createdAt || new Date().toISOString();
    this.lastLogin = userData.lastLogin || new Date().toISOString();
    
    // Classroom linking
    this.classroomIds = userData.classroomIds || []; // Array of classroom IDs the user belongs to
    
    // Progress tracking
    this.progress = {
      jamie: {
        completed: userData.progress?.jamie?.completed || false,
        bestScore: userData.progress?.jamie?.bestScore || 0,
        attempts: userData.progress?.jamie?.attempts || 0,
        lastSession: userData.progress?.jamie?.lastSession || null,
        sessions: userData.progress?.jamie?.sessions || []
      },
      andres: {
        completed: userData.progress?.andres?.completed || false,
        bestScore: userData.progress?.andres?.bestScore || 0,
        attempts: userData.progress?.andres?.attempts || 0,
        lastSession: userData.progress?.andres?.lastSession || null,
        sessions: userData.progress?.andres?.sessions || []
      },
      kavya: {
        completed: userData.progress?.kavya?.completed || false,
        bestScore: userData.progress?.kavya?.bestScore || 0,
        attempts: userData.progress?.kavya?.attempts || 0,
        lastSession: userData.progress?.kavya?.lastSession || null,
        sessions: userData.progress?.kavya?.sessions || []
      }
    };
    
    // Learning analytics
    this.analytics = {
      totalSessions: userData.analytics?.totalSessions || 0,
      averageScore: userData.analytics?.averageScore || 0,
      improvement: userData.analytics?.improvement || 0,
      preferredMode: userData.analytics?.preferredMode || 'assessment',
      lastActive: userData.analytics?.lastActive || new Date().toISOString()
    };
  }

  generateId() {
    return 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  updateProgress(character, sessionData) {
    if (!this.progress[character]) {
      this.progress[character] = {
        completed: false,
        bestScore: 0,
        attempts: 0,
        lastSession: null,
        sessions: []
      };
    }

    const characterProgress = this.progress[character];
    
    // Update attempt count
    characterProgress.attempts += 1;
    
    // Update best score if current score is higher
    if (sessionData.finalScore > characterProgress.bestScore) {
      characterProgress.bestScore = sessionData.finalScore;
    }
    
    // Mark as completed if score >= 0.8 (same as what student sees)
    if (sessionData.finalScore >= 0.8) {
      characterProgress.completed = true;
    }
    
    // Store session data including chat messages
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
      // Exclude userInfo to avoid circular reference
    }));

    const session = {
      id: 'session_' + Date.now(),
      date: new Date().toISOString(),
      score: sessionData.finalScore,
      attempts: sessionData.attemptsUsed,
      mode: sessionData.mode || 'assessment',
      dqScores: sessionData.dqScores || {},
      completed: sessionData.completed || false,
      messages: cleanMessages // Store the cleaned chat transcript
    };
    
    characterProgress.sessions.push(session);
    characterProgress.lastSession = session;
    
    // Update analytics
    this.updateAnalytics();
    
    // Update last login
    this.lastLogin = new Date().toISOString();
  }

  updateAnalytics() {
    const allSessions = [];
    Object.values(this.progress).forEach(charProgress => {
      allSessions.push(...charProgress.sessions);
    });
    
    if (allSessions.length > 0) {
      this.analytics.totalSessions = allSessions.length;
      this.analytics.averageScore = allSessions.reduce((sum, session) => sum + session.score, 0) / allSessions.length;
      
      // Calculate improvement (compare last 3 sessions vs first 3)
      if (allSessions.length >= 6) {
        const recent = allSessions.slice(-3);
        const early = allSessions.slice(0, 3);
        const recentAvg = recent.reduce((sum, session) => sum + session.score, 0) / 3;
        const earlyAvg = early.reduce((sum, session) => sum + session.score, 0) / 3;
        this.analytics.improvement = recentAvg - earlyAvg;
      }
    }
    
    this.analytics.lastActive = new Date().toISOString();
  }

  getCompletionStatus() {
    const characters = ['jamie', 'andres', 'kavya'];
    const completed = characters.filter(char => this.progress[char]?.completed);
    return {
      total: characters.length,
      completed: completed.length,
      percentage: (completed.length / characters.length) * 100,
      characters: completed
    };
  }

  getProgressSummary() {
    return {
      user: {
        id: this.id,
        name: this.name,
        email: this.email,
        role: this.role
      },
      completion: this.getCompletionStatus(),
      analytics: this.analytics,
      progress: this.progress
    };
  }

  // Convert to JSON for localStorage
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      createdAt: this.createdAt,
      lastLogin: this.lastLogin,
      classroomIds: this.classroomIds,
      progress: this.progress,
      analytics: this.analytics
    };
  }

  // Create from JSON
  static fromJSON(jsonData) {
    return new User(jsonData);
  }
}

// User Management Utilities
export class UserManager {
  static STORAGE_KEY = 'decision_coach_user';
  static ALL_USERS_KEY = 'decision_coach_all_users';
  
  static saveUser(user) {
    try {
      // Save as current user
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user.toJSON()));
      
      // Also save to all users collection
      const allUsers = this.loadAllUsers();
      const existingIndex = allUsers.findIndex(u => u.id === user.id);
      
      if (existingIndex >= 0) {
        allUsers[existingIndex] = user.toJSON();
      } else {
        allUsers.push(user.toJSON());
      }
      
      localStorage.setItem(this.ALL_USERS_KEY, JSON.stringify(allUsers));
      
      return true;
    } catch (error) {
      console.error('Failed to save user:', error);
      return false;
    }
  }
  
  static loadUser() {
    try {
      const userData = localStorage.getItem(this.STORAGE_KEY);
      if (userData) {
        return User.fromJSON(JSON.parse(userData));
      }
      return null;
    } catch (error) {
      console.error('Failed to load user:', error);
      return null;
    }
  }
  
  static loadAllUsers() {
    try {
      const data = localStorage.getItem(this.ALL_USERS_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Failed to load all users:', error);
      return [];
    }
  }
  
  static getUserById(userId) {
    try {
      const allUsers = this.loadAllUsers();
      const userData = allUsers.find(u => u.id === userId);
      return userData ? User.fromJSON(userData) : null;
    } catch (error) {
      console.error('Failed to get user by ID:', error);
      return null;
    }
  }
  
  static clearUser() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear user:', error);
      return false;
    }
  }
  
  static isLoggedIn() {
    return this.loadUser() !== null;
  }
}
