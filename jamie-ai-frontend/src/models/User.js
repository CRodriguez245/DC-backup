// User Data Model for localStorage-based persistence

export const STAGE_THRESHOLDS = {
  jamie: {
    confused: 0,
    uncertain: 0.3,
    thoughtful: 0.6,
    confident: 0.8
  },
  andres: {
    overwhelmed: 0,
    defensive: 0.15,      // Original suggested threshold
    exploring: 0.3,       // Original suggested threshold
    experimenting: 0.5,  // Original suggested threshold
    curious: 0.65,        // Original suggested threshold
    visioning: 0.8       // Original suggested threshold
  },
  kavya: {
    reflective: 0
  }
};

export const DEFAULT_STAGE = {
  jamie: 'confused',
  andres: 'overwhelmed',
  kavya: 'reflective'
};

export function resolveStageForScore(character, score = 0) {
  const stageMap = STAGE_THRESHOLDS[character] || {};
  const stageEntries = Object.entries(stageMap);
  const fallbackStage = DEFAULT_STAGE[character] || stageEntries[0]?.[0] || 'confused';
  let resolvedStage = fallbackStage;
  let resolvedFloor = stageMap[resolvedStage] ?? 0;

  stageEntries.forEach(([stageKey, minScore]) => {
    if (typeof minScore === 'number' && score >= minScore && minScore >= resolvedFloor) {
      resolvedStage = stageKey;
      resolvedFloor = minScore;
    }
  });

  return { stage: resolvedStage, floor: resolvedFloor };
}

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
    
    const buildCharacterProgress = (character) => {
      const existing = userData.progress?.[character] || {};
      const existingStage = existing.stage;
      const existingFloor = existing.stageMinScore;
      const baseScore = existing.bestScore
        || existing.lastSession?.rawScore
        || existing.lastSession?.score
        || 0;
      const derived = resolveStageForScore(character, baseScore);
      const stageKey = existingStage || derived.stage;
      const stageFloor = existingFloor ?? STAGE_THRESHOLDS[character]?.[stageKey] ?? derived.floor;
      return {
        completed: existing.completed || false,
        bestScore: existing.bestScore || 0,
        attempts: existing.attempts || 0,
        lastSession: existing.lastSession || null,
        sessions: existing.sessions || [],
        stage: stageKey,
        stageMinScore: stageFloor,
        lastRawScore: existing.lastRawScore || baseScore
      };
    };
    
    // Progress tracking
    this.progress = {
      jamie: buildCharacterProgress('jamie'),
      andres: buildCharacterProgress('andres'),
      kavya: buildCharacterProgress('kavya')
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
      const defaults = resolveStageForScore(character, 0);
      this.progress[character] = {
        completed: false,
        bestScore: 0,
        attempts: 0,
        lastSession: null,
        sessions: [],
        stage: defaults.stage,
        stageMinScore: defaults.floor,
        lastRawScore: 0
      };
    }

    const characterProgress = this.progress[character];

    // Determine raw score before stage adjustments
    const rawScore = typeof sessionData.rawScore === 'number'
      ? sessionData.rawScore
      : (typeof sessionData.finalScore === 'number' ? sessionData.finalScore : 0);

    // Stage handling
    const stageMap = STAGE_THRESHOLDS[character] || {};
    const incomingStage = sessionData.stage;
    let currentStage = characterProgress.stage || DEFAULT_STAGE[character] || 'confused';
    let currentFloor = characterProgress.stageMinScore ?? 0;

    if (incomingStage && stageMap[incomingStage] !== undefined) {
      const newFloor = stageMap[incomingStage];
      if (newFloor > currentFloor) {
        currentFloor = newFloor;
        currentStage = incomingStage;
      }
    } else {
      const derived = resolveStageForScore(character, rawScore);
      if (derived.floor > currentFloor) {
        currentFloor = derived.floor;
        currentStage = derived.stage;
      }
    }

    characterProgress.stage = currentStage;
    characterProgress.stageMinScore = currentFloor;

    const stageFloor = characterProgress.stageMinScore || 0;

    // Update attempt count
    characterProgress.attempts += 1;

    // Determine effective score with floor applied
    const effectiveScore = Math.max(rawScore, stageFloor);

    // Update best score if current score is higher
    if (effectiveScore > characterProgress.bestScore) {
      characterProgress.bestScore = effectiveScore;
    }

    // Mark as completed: assessment mode = always complete after first session, game mode = score >= 0.8 (raw)
    if (sessionData.mode === 'assessment') {
      characterProgress.completed = true; // Assessment mode always completes after first session
    } else if (rawScore >= 0.7) {
      characterProgress.completed = true; // Game mode needs 0.7+ raw score
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
      score: effectiveScore,
      rawScore: rawScore,
      attempts: sessionData.attemptsUsed,
      mode: sessionData.mode || 'assessment',
      dqScores: sessionData.dqScores || {},
      completed: sessionData.completed || (sessionData.mode === 'assessment' ? true : rawScore >= 0.7),
      stage: characterProgress.stage,
      stageMinScore: characterProgress.stageMinScore,
      messages: cleanMessages // Store the cleaned chat transcript
    };

    characterProgress.sessions.push(session);
    characterProgress.lastSession = session;
    characterProgress.lastRawScore = rawScore;

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
    const completedCharacters = characters.filter(char => this.progress[char]?.completed);
    const completionRate = (completedCharacters.length / characters.length) * 100;

    return {
      completedCharacters,
      completionRate,
      isFullyCompleted: completedCharacters.length === characters.length
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
