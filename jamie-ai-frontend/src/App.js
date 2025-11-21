/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Star, Home, Settings, LogOut, BarChart3, RotateCcw, X, Menu } from 'lucide-react';
import LandingPage from './LandingPage';
import HomePage from './HomePage';
import AdminDashboard from './AdminDashboard';
import SettingsPage from './SettingsPage';
import UserDashboard from './UserDashboard';
import TeacherClassrooms from './TeacherClassrooms';
import ClassroomDetail from './ClassroomDetail';
import SharedVisual from './SharedVisual';
import { authService } from './services/AuthService.js';
import { supabaseAuthService } from './services/SupabaseAuthService.js';
import { supabase } from './lib/supabase.js';
import { debugLog } from './utils/debugLog';
import ResetPasswordPage from './ResetPasswordPage';

// Jamie's Animated Face Component
// Helper function to safely calculate minimum DQ score, filtering out NaN and invalid values
const safeMinDqScore = (dqScoreObj) => {
  if (!dqScoreObj || typeof dqScoreObj !== 'object') return 0;
  const values = Object.values(dqScoreObj)
    .filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v) && v >= 0 && v <= 1);
  return values.length > 0 ? Math.min(...values) : 0;
};

const MAX_INPUT_HEIGHT = 120;

const JamieFace = ({ dqScore, avgDqScore, size = 'small' }) => {
  const getJamieState = (score) => {
    if (score >= 0.8) return 'confident';
    if (score >= 0.6) return 'thoughtful';
    if (score >= 0.3) return 'uncertain';
    return 'confused';
  };

  const state = getJamieState(avgDqScore || 0);
  const isLarge = size === 'large';
  const faceSize = isLarge ? 'w-12 h-12' : 'w-10 h-10';

  const faceStyles = {
    confused: {
      emoji: '😵‍💫',
      gradient: 'from-red-100 to-red-200',
      animation: 'animate-pulse'
    },
    uncertain: {
      emoji: '😟',
      gradient: 'from-yellow-100 to-yellow-200',
      animation: 'animate-bounce'
    },
    thoughtful: {
      emoji: '🤔',
      gradient: 'from-blue-100 to-blue-200',
      animation: 'animate-pulse'
    },
    confident: {
      emoji: '😊',
      gradient: 'from-green-100 to-green-200',
      animation: 'animate-pulse'
    }
  };

  const currentStyle = faceStyles[state];

  return (
    <div className={`${faceSize} rounded-full bg-gradient-to-br ${currentStyle.gradient} flex items-center justify-center shadow-md ${currentStyle.animation} transition-all duration-500`}>
      <div className={isLarge ? 'text-2xl' : 'text-lg'}>
        {currentStyle.emoji}
      </div>
    </div>
  );
};

const ALLOWED_VIEWS = [
  'homepage',
  'chat',
  'dashboard',
  'admin',
  'settings',
  'classrooms',
  'classroom-detail'
];

const getSavedView = () => {
  if (typeof window === 'undefined') return 'homepage';
  const savedView = sessionStorage.getItem('currentView');
  return savedView && ALLOWED_VIEWS.includes(savedView) ? savedView : 'homepage';
};

const getSavedCharacter = () => {
  if (typeof window === 'undefined') return 'jamie';
  return localStorage.getItem('currentCharacter') || 'jamie';
};

const MainApp = () => {
  // Feature flag to use Supabase authentication
  const USE_SUPABASE_AUTH = true; // Re-enable Supabase authentication

  // Check for existing Supabase session synchronously before first render
  const getInitialAuthState = () => {
    if (USE_SUPABASE_AUTH) {
      // Check localStorage for Supabase session (Supabase stores it with keys starting with 'sb-')
      try {
        // Look for any Supabase auth token in localStorage
        let hasSession = false;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('sb-') && key.includes('auth-token')) {
            hasSession = true;
            break;
          }
        }
        
        if (hasSession) {
          // Session exists, try to get user from auth service
          const currentUser = supabaseAuthService.getCurrentUser();
          if (currentUser) {
            debugLog('User already logged in on mount (from session):', currentUser);
            return currentUser;
          }
          // If session token exists but getCurrentUser() returns null,
          // the service might not be initialized yet - return null and let useEffect handle it
          // isAuthChecking will remain true, preventing any render
        }
      } catch (e) {
        debugLog('Error checking session storage:', e);
      }
    }
    return null;
  };

  // User information state - now using auth service
  const [userInfo, setUserInfo] = useState(() => {
    return getInitialAuthState();
  });

  // Add loading state to prevent flash of landing page
  // Always check auth on mount if using Supabase to prevent flash
  // Also check if there's a session token - if so, keep checking until confirmed
  const [isAuthChecking, setIsAuthChecking] = useState(() => {
    if (!USE_SUPABASE_AUTH) return false;
    // Check if there's a session token - if so, we need to verify it
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-') && key.includes('auth-token')) {
          // Session token exists, keep checking until confirmed
          return true;
        }
      }
    } catch (e) {
      // Ignore errors
    }
    // No session token, but still check auth if using Supabase
    return true;
  });
  
  // Initialize authentication on component mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let isInitialized = false;
    
    const initializeAuth = async () => {
      if (isInitialized) return;
      isInitialized = true;
      
      if (USE_SUPABASE_AUTH) {
        // Initialize Supabase auth service
        await supabaseAuthService.init();
        
        // Clear any existing listeners first (for hot reloading)
        supabaseAuthService.clearAllListeners();
        
        // Set up auth state listener
        supabaseAuthService.addListener((event, user) => {
            debugLog('Auth state changed:', event, user);
            debugLog('Current view when auth state changes:', currentView);
            debugLog('Current isLoadingProgress state:', isLoadingProgress);
            debugLog('Current hasStartedLoading state:', hasStartedLoading);
            
            if (event === 'progress_loaded' || event === 'progress_updated') {
              // Update userInfo when progress is loaded/updated
              debugLog('Updating userInfo due to progress event:', event);
              debugLog('Setting isLoadingProgress to false');
              debugLog('User progress data:', user?.progress);
              debugLog('Full user object:', JSON.stringify(user, null, 2));
              // Clear any existing timeout
              if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
                loadingTimeoutRef.current = null;
              }
              setUserInfo(user);
              setIsLoadingProgress(false);
              setHasStartedLoading(false);
            } else if (event === 'progress_loading_started') {
              // Progress loading has started
              debugLog('Progress loading started, setting loading state');
              setIsLoadingProgress(true);
            } else if (event === 'progress_loading_failed') {
              // Progress loading failed
              debugLog('Progress loading failed, resetting loading state');
              // Clear any existing timeout
              if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
                loadingTimeoutRef.current = null;
              }
              setIsLoadingProgress(false);
              setHasStartedLoading(false);
            } else if (event === 'login' && user) {
              // When user logs in, preserve existing view or restore from sessionStorage
              debugLog('User logged in via auth listener');
              debugLog('User role:', user.role);
              setUserInfo(user);
              // Preserve current view, or restore from sessionStorage, or default to homepage
              setCurrentView(prev => {
                if (prev) return prev; // Keep existing view
                // Try to restore from sessionStorage
                const savedView = sessionStorage.getItem('currentView');
                if (savedView && ALLOWED_VIEWS.includes(savedView)) {
                  debugLog('Restoring view from sessionStorage on login:', savedView);
                  return savedView;
                }
                return 'homepage'; // Last resort default
              });
              // Don't set loading state here - let the useEffect handle it
              debugLog('Login event processed, useEffect will handle progress loading');
            } else if (event === 'logout') {
              // When user logs out, clear all state
              debugLog('User logged out via auth listener, clearing state');
              // Clear any existing timeout
              if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
                loadingTimeoutRef.current = null;
              }
              setUserInfo(null);
              setCurrentView(null);
              setMessages([]);
              setIsLoadingProgress(false);
              setHasStartedLoading(false);
              setLoadedUserIds(new Set()); // Clear loaded user IDs
              // Clear sessionStorage
              sessionStorage.removeItem('currentView');
            } else if (event === 'classroom_joined' || event === 'classroom_created') {
              // Don't update userInfo for classroom events - these pass classroom objects, not user objects
              debugLog('Classroom event received, not updating userInfo:', event);
              // The userInfo should remain as the User object, not be replaced with classroom
            } else if (user && typeof user === 'object' && user.role) {
              // Only update userInfo if user is actually a User object (has a role property)
              debugLog('Updating userInfo due to auth event:', event);
              setUserInfo(user);
            } else {
              debugLog('Ignoring auth event that doesn\'t contain valid user data:', event, user);
            }
          });
        
        // Make authService available in console for demo
        window.authService = supabaseAuthService;
        
        // Add debugging helper
        window.debugAuth = () => {
          debugLog('Current user:', supabaseAuthService.getCurrentUser());
          debugLog('Is loading progress:', supabaseAuthService.isLoadingProgress);
          debugLog('Listeners count:', supabaseAuthService.listeners.length);
        };

        // Hydrate existing session on refresh
        const existingUser = supabaseAuthService.getCurrentUser();
        if (existingUser) {
          debugLog('Hydrating user from existing Supabase session:', existingUser);
          // Restore view from sessionStorage FIRST
          const savedView = sessionStorage.getItem('currentView');
          const viewToSet = (savedView && ALLOWED_VIEWS.includes(savedView)) ? savedView : 'homepage';
          debugLog('Restoring view from sessionStorage during auth init:', viewToSet);
          
          // Set both userInfo and currentView in the same batch
          // Then clear isAuthChecking - React will batch these updates
          setUserInfo(existingUser);
          setCurrentView(viewToSet);
        } else {
          // No user found, ensure we're on landing page
          setCurrentView(null);
        }
        
        // Clear auth checking state after initialization
        // React batches synchronous state updates, so currentView will be set
        // before isAuthChecking becomes false in the same render cycle
        setIsAuthChecking(false);
      } else {
        // Use original auth service
        authService.init();
        setUserInfo(authService.getCurrentUser());
        // Make authService available in console for demo
        window.authService = authService;
        setIsAuthChecking(false);
      }
    };

    initializeAuth();
  }, []); // Empty dependency array - run once on mount

  // Loading state for progress
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const loadingTimeoutRef = useRef(null); // Use ref instead of state for timeout ID
  const [hasStartedLoading, setHasStartedLoading] = useState(false);
  const [loadedUserIds, setLoadedUserIds] = useState(new Set()); // Track which users we've loaded progress for

  // Ensure progress is loaded for students who are already logged in
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (USE_SUPABASE_AUTH && userInfo && (userInfo.role === 'student' || userInfo.role === 'teacher')) {
      // Check if we've already loaded progress for this user
      const hasLoadedForUser = loadedUserIds.has(userInfo.id);
      
      // Only start loading if we haven't already started, not currently loading, and haven't loaded for this user
      if (!hasStartedLoading && !isLoadingProgress && !hasLoadedForUser) {
        setHasStartedLoading(true);
        setIsLoadingProgress(true);
        
        // Mark this user as having progress loaded
        setLoadedUserIds(prev => new Set(prev).add(userInfo.id));
        
        // Set a timeout to prevent infinite loading
        // Clear any existing timeout first
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
        loadingTimeoutRef.current = setTimeout(() => {
          setIsLoadingProgress(false);
          setHasStartedLoading(false);
          loadingTimeoutRef.current = null;
        }, 10000); // 10 second timeout
        
        supabaseAuthService.loadProgressFromSupabase();
      }
    } else if (userInfo && userInfo.role !== 'student' && userInfo.role !== 'teacher') {
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      // Ensure loading state is false for non-students
      if (isLoadingProgress) {
        setIsLoadingProgress(false);
      }
      setHasStartedLoading(false);
    } else if (!userInfo) {
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      setIsLoadingProgress(false);
      setHasStartedLoading(false);
    }
  }, [userInfo?.id, userInfo?.role]); // Only depend on user ID and role, not loading states

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, []);
  const [gameMode, setGameMode] = useState(() => {
    // Load game mode from localStorage on component mount
    return localStorage.getItem('gameMode') || 'game';
  });
  
  // Initialize currentView to null - will be set after auth check to prevent flash
  const [currentView, setCurrentView] = useState(null); // 'homepage', 'chat', 'dashboard', 'admin', 'settings', 'classrooms', 'classroom-detail'
  
  // Save currentView to sessionStorage whenever it changes (if user is authenticated)
  useEffect(() => {
    if (userInfo && currentView) {
      sessionStorage.setItem('currentView', currentView);
      debugLog('Saved currentView to sessionStorage:', currentView);
    }
  }, [currentView, userInfo]);

  const [currentCharacter, setCurrentCharacter] = useState(() => getSavedCharacter()); // 'jamie', 'andres', or 'kavya'

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentCharacter', currentCharacter);
    }
  }, [currentCharacter]);
  const [selectedClassroomId, setSelectedClassroomId] = useState(null);
  
  // Character data
  const characterData = {
    jamie: {
      name: 'Jamie',
      title: 'Mechanical Engineering',
      context: 'Jamie is a sophomore mechanical engineering student considering switching to art/design. He\'s worried about disappointing his immigrant parents. How would you coach him?',
      progressLabel: 'Jamie\'s Progress',
      gameMode: 'assessment' // Jamie uses assessment mode
    },
    andres: {
      name: 'Andres',
      title: 'Software Engineering',
      context: 'Andres is a software engineer considering a career pivot to product management. He\'s feeling burnt out from coding and wants to work more with people and strategy. How would you coach him?',
      progressLabel: 'Andres\'s Progress',
      gameMode: 'game' // Andres uses game mode
    },
    kavya: {
      name: 'Kavya',
      title: 'Career Exploration',
      context: 'Kavya is a recent graduate exploring career options. She\'s torn between pursuing a traditional corporate path or starting her own business. She values work-life balance and wants to make a meaningful impact. How would you coach her?',
      progressLabel: 'Kavya\'s Progress',
      gameMode: 'game' // Kavya uses game mode
    }
  };
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingText, setThinkingText] = useState('Thinking');
  const [isTextTransitioning, setIsTextTransitioning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('untested');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCharacterInfo, setShowCharacterInfo] = useState(false);
  const [demoMode, setDemoMode] = useState(false); // Start with real backend
  
  // Helper function to get max attempts based on character
  const getMaxAttempts = (character) => {
    return character === 'kavya' ? 10 : 20;
  };
  
  const [attemptsRemaining, setAttemptsRemaining] = useState(() => {
    const savedCharacter = getSavedCharacter();
    return getMaxAttempts(savedCharacter);
  });
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isProgressAnimating, setIsProgressAnimating] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const messageInputRef = useRef(null);

  const adjustMessageInputHeight = (element) => {
    if (!element) return;
    element.style.height = 'auto';
    const newHeight = Math.min(element.scrollHeight, MAX_INPUT_HEIGHT);
    element.style.height = `${newHeight}px`;
    element.style.overflowY = element.scrollHeight > MAX_INPUT_HEIGHT ? 'auto' : 'hidden';
  };

  useEffect(() => {
    adjustMessageInputHeight(messageInputRef.current);
  }, [currentMessage]);

  // Handle login from landing page
  const handleLogin = async (loginData) => {
    try {
      debugLog('handleLogin called with:', loginData);
      
      // Check if user is already logged in
      if (userInfo && userInfo.id) {
        debugLog('User already logged in, skipping login');
        debugLog('Current view before setting currentView:', currentView);
        setCurrentView('homepage');
        debugLog('State updated - keeping existing userInfo, currentView: homepage');
        return { success: true, message: 'Already logged in' };
      }
      
      // Check if user is already authenticated at Supabase level
      // But verify that a session actually exists (not just a local user object)
      if (USE_SUPABASE_AUTH && supabaseAuthService.currentUser) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          debugLog('User already authenticated at Supabase level with valid session, hydrating state');
          debugLog('Current view before setting currentView:', currentView);
          setUserInfo(prev => prev || supabaseAuthService.currentUser);
          setCurrentView('homepage');
          debugLog('State updated - userInfo hydrated from Supabase, currentView: homepage');
          return { success: true, message: 'Already logged in' };
        } else {
          debugLog('User object exists but no Supabase session - user may need to confirm email');
          // Clear the user object since session doesn't exist
          supabaseAuthService.currentUser = null;
          // Continue with login flow
        }
      }
      
      // Set the game mode from landing page
      if (loginData.gameMode) {
        setGameMode(loginData.gameMode);
        localStorage.setItem('gameMode', loginData.gameMode);
      }
      
      // Use authentication service for login
      debugLog('Using Supabase auth:', USE_SUPABASE_AUTH);
      const result = USE_SUPABASE_AUTH 
        ? await supabaseAuthService.login({
            email: loginData.email,
            password: loginData.password || 'demo' // For demo purposes
          })
        : await authService.login({
            email: loginData.email,
            password: loginData.password || 'demo' // For demo purposes
          });
      
      debugLog('Auth service result:', result);
      
      if (result.success) {
        debugLog('Login successful, setting userInfo to:', result.user);
        debugLog('Current view before setting userInfo:', currentView);
        setUserInfo(result.user);
        debugLog('Setting currentView to homepage');
        setCurrentView('homepage');
        debugLog('State updated - userInfo:', result.user, 'currentView: homepage');
        return { success: true, message: result.message };
      } else {
        debugLog('Login failed:', result.error);
        return { success: false, message: result.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  // Handle starting a coaching session
  const handleStartCoaching = (session) => {
    setCurrentView('chat');
    
    // Try to load in-progress session
    const savedSession = loadInProgressSession(currentCharacter);
    if (savedSession && savedSession.messages.length > 0) {
      // Restore saved session
      setMessages(savedSession.messages);
      setAttemptsRemaining(savedSession.attemptsRemaining);
    } else {
      // Reset chat state for new session
      setMessages([]);
      setAttemptsRemaining(getMaxAttempts(currentCharacter));
    }
    
    setCurrentMessage('');
    setIsLoading(false);
    setIsTyping(false);
    setAnimatedProgress(0);
    setIsProgressAnimating(false);
  };

  // Handle character selection
  const handleCharacterClick = (characterId) => {
    debugLog('Character clicked:', characterId, 'Setting currentView to chat');
    debugLog('Current isLoadingProgress:', isLoadingProgress);
    
    // Save current session before switching
    if (messages.length > 0) {
      saveInProgressSession();
    }
    
    setCurrentCharacter(characterId);
    setCurrentView('chat');
    
    // Load saved session for new character
    const savedSession = loadInProgressSession(characterId);
    if (savedSession && savedSession.messages.length > 0) {
      setMessages(savedSession.messages);
      setAttemptsRemaining(savedSession.attemptsRemaining);
    } else {
      setMessages([]);
      setAttemptsRemaining(getMaxAttempts(characterId));
    }
  };

  // Manual reset for stuck loading state
  const resetLoadingState = () => {
    debugLog('Manually resetting loading state');
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    setIsLoadingProgress(false);
    setHasStartedLoading(false);
  };

  // Global debug function for testing
  window.debugLoadingState = () => {
    debugLog('Current loading state:', {
      isLoadingProgress,
      hasStartedLoading,
      userInfo: !!userInfo,
      userRole: userInfo?.role,
      loadingTimeoutId: loadingTimeoutRef.current
    });
  };

  // Global function to force reset loading
  window.forceResetLoading = resetLoadingState;

  // Handle logout
  const handleLogout = async () => {
    debugLog('Logout initiated');
    
    try {
      // Use authentication service for logout
      if (USE_SUPABASE_AUTH) {
        debugLog('Calling Supabase logout');
        const result = await supabaseAuthService.logout();
        debugLog('Supabase logout result:', result);
        
        // The auth listener will handle clearing state when it receives the 'logout' event
        // But we'll also clear it here as a backup
        if (result.success) {
          debugLog('Logout successful, clearing local state');
          setUserInfo(null);
          setCurrentView(null);
          setMessages([]);
          setCurrentMessage('');
          setCurrentCharacter('jamie');
          setGameMode('game');
          setAttemptsRemaining(getMaxAttempts('jamie'));
          setAnimatedProgress(0);
          setIsProgressAnimating(false);
          setIsLoadingProgress(false);
          setHasStartedLoading(false);
          setLoadedUserIds(new Set()); // Clear loaded user IDs
          
          // Clear localStorage
          localStorage.removeItem('gameMode');
          localStorage.removeItem('currentCharacter');
          
          // Clear sessionStorage
          sessionStorage.removeItem('currentView');
          localStorage.removeItem('messages');
          localStorage.removeItem('currentSession');
        }
      } else {
        authService.logout();
        // Clear state for non-Supabase auth
        setUserInfo(null);
        setCurrentView(null);
        setMessages([]);
        setCurrentMessage('');
        setCurrentCharacter('jamie');
        setGameMode('game');
        setAttemptsRemaining(getMaxAttempts('jamie'));
        setAnimatedProgress(0);
        setIsProgressAnimating(false);
        setIsLoadingProgress(false);
        
        // Clear localStorage
        localStorage.removeItem('gameMode');
        localStorage.removeItem('currentCharacter');
        localStorage.removeItem('messages');
        localStorage.removeItem('currentSession');
      }
      
      debugLog('Logout completed');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setUserInfo(null);
      setCurrentView(null);
      setMessages([]);
      setCurrentMessage('');
      setIsLoadingProgress(false);
    }
  };

  // Handle settings (placeholder for now)
  const handleSettings = () => {
    setCurrentView('settings');
  };

  // Save in-progress session to localStorage
  const saveInProgressSession = () => {
    if (!userInfo || messages.length === 0) return;
    
    // Clean messages to avoid circular references
    const cleanMessages = messages.map(msg => ({
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
    
    const sessionData = {
      character: currentCharacter,
      messages: cleanMessages,
      attemptsRemaining: attemptsRemaining,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(`session_${userInfo.id}_${currentCharacter}`, JSON.stringify(sessionData));
  };

  // Load in-progress session
  const loadInProgressSession = (character) => {
    if (!userInfo) return null;
    
    const savedSession = localStorage.getItem(`session_${userInfo.id}_${character}`);
    if (savedSession) {
      return JSON.parse(savedSession);
    }
    return null;
  };

  // Clear in-progress session
  const clearInProgressSession = (character) => {
    if (!userInfo) return;
    localStorage.removeItem(`session_${userInfo.id}_${character}`);
  };

  // Reset session function
  const resetSession = () => {
    // Confirm reset if there are messages
    if (messages.length > 0 && attemptsRemaining > 0) {
      const confirmed = window.confirm('Are you sure you want to reset this session? All progress will be lost.');
      if (!confirmed) return;
    }
    
    clearInProgressSession(currentCharacter);
    setMessages([]);
    setAttemptsRemaining(getMaxAttempts(currentCharacter));
    setCurrentMessage('');
    setIsLoading(false);
    setIsTyping(false);
    setAnimatedProgress(0);
    setIsProgressAnimating(false);
  };

  // Auto-save in-progress session whenever messages change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (messages.length > 0) {
      saveInProgressSession();
    }
  }, [messages, attemptsRemaining]);

  // Restore chat session from localStorage on refresh when entering chat view
  useEffect(() => {
    if (currentView === 'chat' && userInfo && messages.length === 0 && !isLoading && !isTyping) {
      const savedSession = loadInProgressSession(currentCharacter);
      if (savedSession && savedSession.messages && savedSession.messages.length > 0) {
        debugLog('Restoring chat session from localStorage:', savedSession);
        setMessages(savedSession.messages);
        if (savedSession.attemptsRemaining !== undefined) {
          setAttemptsRemaining(savedSession.attemptsRemaining);
        }
      }
    }
  }, [currentView, userInfo, currentCharacter]); // Only run when these change, not on every render

  // Add initial Andres opening message when starting a new chat session
  useEffect(() => {
    // Only add opening message if:
    // 1. We're in chat view
    // 2. Current character is Andres
    // 3. Messages array is empty (new session, not a saved one)
    // 4. Not currently loading
    // 5. No saved session exists (check explicitly to avoid adding after restoration)
    if (
      currentView === 'chat' &&
      currentCharacter === 'andres' &&
      messages.length === 0 &&
      !isLoading &&
      !isTyping &&
      userInfo // Make sure userInfo is available before checking for saved session
    ) {
      // Double-check that no saved session exists
      const savedSession = loadInProgressSession(currentCharacter);
      if (!savedSession || !savedSession.messages || savedSession.messages.length === 0) {
        const andresOpeningMessage = {
          id: `andres-opening-${Date.now()}`,
          message: "Honestly, I'm just wiped out. Every sprint feels the same and I don't even know if switching makes sense. It all feels like too much sometimes.",
          isUser: false,
          timestamp: new Date().toISOString()
        };
        
        setMessages([andresOpeningMessage]);
      }
    }
  }, [currentView, currentCharacter, messages.length, isLoading, isTyping, userInfo]);

  // Add initial Kavya opening message when starting a new chat session
  useEffect(() => {
    // Only add opening message if:
    // 1. We're in chat view
    // 2. Current character is Kavya
    // 3. Messages array is empty (new session, not a saved one)
    // 4. Not currently loading
    // 5. No saved session exists (check explicitly to avoid adding after restoration)
    if (
      currentView === 'chat' &&
      currentCharacter === 'kavya' &&
      messages.length === 0 &&
      !isLoading &&
      !isTyping &&
      userInfo // Make sure userInfo is available before checking for saved session
    ) {
      // Double-check that no saved session exists
      const savedSession = loadInProgressSession(currentCharacter);
      if (!savedSession || !savedSession.messages || savedSession.messages.length === 0) {
        const kavyaOpeningMessage = {
          id: `kavya-opening-${Date.now()}`,
          message: "Honestly, I'm just exhausted trying to figure out what to do after graduation. I keep going back and forth between the corporate path—you know, stability, benefits, clear career progression—and the idea of starting my own business where I could actually have work-life balance and make a meaningful impact. But every corporate job I look at seems like it'll eat my soul, and starting something on my own feels impossible with student loans and no real experience. I feel like I'm supposed to just know what I want, but I don't. It's all just too much pressure right now.",
          isUser: false,
          timestamp: new Date().toISOString()
        };
        
        setMessages([kavyaOpeningMessage]);
      }
    }
  }, [currentView, currentCharacter, messages.length, isLoading, isTyping, userInfo]);

  // Calculate progress percentage for current character
  const getJamieProgress = () => {
    if (messages.length === 0) return 0; // Start at 0%
    
    // Find the latest character message with DQ score
    const characterMessages = messages.filter(msg => !msg.isUser && msg.dqScore);
    if (characterMessages.length === 0) return 0;
    
    const latestMessage = characterMessages[characterMessages.length - 1];
    
    // Always calculate from dqScore object for more accurate progress display
    // avgDqScore from backend is the minimum (weakest link), which can be misleading
    if (!latestMessage.dqScore) {
      // Fallback to avgDqScore if dqScore is not available
      if (latestMessage.avgDqScore !== undefined) {
        const safeScore = typeof latestMessage.avgDqScore === 'number' && !isNaN(latestMessage.avgDqScore) && isFinite(latestMessage.avgDqScore)
          ? latestMessage.avgDqScore
          : 0;
        return Math.round(safeScore * 100);
      }
      return 0;
    }
    
    // For progress display, use average of top 5 dimensions (excluding lowest)
    // This shows progress even when one dimension is lagging
    const dqObj = latestMessage.dqScore;
    
    // Only use the 6 core DQ dimensions, exclude 'overall' and 'rationale'
    const coreDimensions = ['framing', 'alternatives', 'information', 'values', 'reasoning', 'commitment'];
    const values = coreDimensions
      .map(dim => dqObj[dim])
      .filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v) && v >= 0 && v <= 1)
      .sort((a, b) => b - a); // Sort descending
    
    if (values.length === 0) return 0;
    
    // Use average of top 5 dimensions (or all if less than 5)
    // This gives a more encouraging progress view while still reflecting overall quality
    const topValues = values.slice(0, Math.min(5, values.length));
    const avgScore = topValues.reduce((sum, val) => sum + val, 0) / topValues.length;
    
    return Math.round(avgScore * 100);
  };

  // Animate progress changes - moved after getJamieProgress definition
  // Use a ref to track the last target progress to avoid dependency issues
  const lastProgressRef = useRef(0);
  const animatedProgressRef = useRef(0); // Track current animated value without triggering re-renders
  
  // Sync ref with state
  useEffect(() => {
    animatedProgressRef.current = animatedProgress;
  }, [animatedProgress]);
  
  useEffect(() => {
    const currentProgress = getJamieProgress();
    // Only animate if progress actually changed (not just during animation)
    if (currentProgress !== lastProgressRef.current) {
      lastProgressRef.current = currentProgress;
      setIsProgressAnimating(true);
      
      // Smooth animation to new progress value
      const startProgress = animatedProgressRef.current; // Use ref to get current value
      const endProgress = currentProgress;
      const duration = 1200; // 1.2 seconds
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentValue = startProgress + (endProgress - startProgress) * easeOutCubic;
        const roundedValue = Math.round(currentValue);
        
        setAnimatedProgress(roundedValue);
        animatedProgressRef.current = roundedValue; // Update ref as we animate
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsProgressAnimating(false);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [messages]); // Only depend on messages - this ensures we react to new DQ scores immediately

  // Get character's current state based on progress percentage
  const getCharacterState = () => {
    const progress = getJamieProgress();
    const progressDecimal = progress / 100; // Convert percentage to decimal (0-1)
    
    // Use character-specific stage thresholds
    if (currentCharacter === 'andres') {
      // Andres stages: overwhelmed (0), defensive (0.15), exploring (0.3), experimenting (0.5), curious (0.65), visioning (0.8)
      // VERSION CHECK: If you see defensive: 0.15, exploring: 0.3, experimenting: 0.5 in console, the update is deployed
      if (progressDecimal >= 0.8) return 'Visioning';
      if (progressDecimal >= 0.65) return 'Curious';
      if (progressDecimal >= 0.5) return 'Experimenting';
      if (progressDecimal >= 0.3) return 'Exploring';
      if (progressDecimal >= 0.15) return 'Defensive';
      return 'Overwhelmed';
    } else if (currentCharacter === 'kavya') {
      // Kavya stages: overwhelmed (0), defensive (0.15), exploring (0.3), experimenting (0.5), curious (0.65), visioning (0.8)
      // Same thresholds as Andres
      if (progressDecimal >= 0.8) return 'Visioning';
      if (progressDecimal >= 0.65) return 'Curious';
      if (progressDecimal >= 0.5) return 'Experimenting';
      if (progressDecimal >= 0.3) return 'Exploring';
      if (progressDecimal >= 0.15) return 'Defensive';
      return 'Overwhelmed';
    } else {
      // Jamie stages: confused (0), uncertain (0.3), thoughtful (0.6), confident (0.8)
      if (progressDecimal >= 0.8) return 'Confident';
      if (progressDecimal >= 0.6) return 'Thoughtful';
      if (progressDecimal >= 0.3) return 'Uncertain';
      return 'Confused';
    }
  };

  // Test connection to backend
  const testConnection = async () => {
    setConnectionStatus('testing');
    
    // Try local backend first (for development)
    const localBackend = 'http://localhost:3001/chat';
    const remoteBackend = 'https://jamie-backend.onrender.com/chat';
    
    // Check if we're in development (localhost)
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const backendUrl = isDevelopment ? localBackend : remoteBackend;
    
    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ message: "test connection" }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.jamie_reply) {
          setConnectionStatus('connected');
          debugLog('✅ Backend connection successful');
          return;
        }
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      
      // If remote backend failed, automatically switch to demo mode
      debugLog('❌ Backend unavailable, switching to demo mode');
      setConnectionStatus('failed');
      // Use setTimeout to ensure state updates properly
      setTimeout(() => {
        setDemoMode(true);
      }, 100);
    }
  };

  // Demo mode responses
  const getDemoResponse = (message) => {
    const responses = [
      "I really appreciate you asking about this... it's been weighing on my mind a lot. My parents sacrificed so much to come here and they always talked about me becoming an engineer. But when I'm in my design classes, I just feel... alive, you know?",
      
      "It's really hard because I see the disappointment in their eyes when I even mention art. They keep saying 'art doesn't pay the bills' and 'we didn't come to America for you to struggle as an artist.' But I'm struggling now too, just in a different way.",
      
      "Sometimes I wonder if I'm being selfish. Like, maybe I should just push through engineering for them? But then I think about spending my whole life doing something that doesn't inspire me... that feels wrong too.",
      
      "You know what's funny? When I was little, my mom used to love my drawings. She'd put them on the fridge and brag to her friends. But somewhere along the way, that changed to 'drawing is just a hobby, focus on real subjects.'",
      
      "I've been looking at some art schools and design programs, and there are actually really good career prospects. UX design, industrial design, even engineering roles that are more creative. But how do I even start that conversation at home?",
      
      "The guilt is probably the hardest part. Like, they worked so hard to give me opportunities, and here I am wanting to 'throw it away' for something they see as frivolous. But I don't think they understand that I'm not throwing anything away - I'm trying to find where I actually belong.",
      
      "I've been doing some research on successful artists and designers, and many of them actually have technical backgrounds. Maybe there's a way to honor both parts of myself? I just don't know how to explain that to my parents without them thinking I'm making excuses.",
      
      "What really gets to me is when they compare me to my cousin who's doing well in computer science. They're like 'why can't you just be practical like her?' But they don't see how miserable I am in my current classes, or how excited I get when I'm working on creative projects."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const getDemoScore = () => ({
    framing: Math.random() * 0.3 + 0.65,
    alternatives: Math.random() * 0.3 + 0.55,
    information: Math.random() * 0.3 + 0.60,
    values: Math.random() * 0.3 + 0.70,
    reasoning: Math.random() * 0.3 + 0.62,
    commitment: Math.random() * 0.3 + 0.58
  });

  // Scroll to bottom when loading a saved session
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      // Small delay to ensure DOM is rendered
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages.length, isLoading]);


  // Test connection on mount
  useEffect(() => {
    if (!demoMode) {
      testConnection();
    }
  }, [demoMode]);

  // User info form component - REMOVED (using LandingPage instead)
  // eslint-disable-next-line no-unused-vars
  const UserInfoModal_OLD = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      affiliation: ''
    });

    const handleSubmit = () => {
      if (!formData.name || !formData.email) return;
      setUserInfo(formData);
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#2C73EB] flex items-end justify-center mx-auto mb-4 shadow-lg overflow-hidden">
              <img 
                src="/images/cu-JAMIE.png" 
                alt="Jamie" 
                className="w-16 h-16 object-cover object-bottom"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Welcome to Decision Coach</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              You'll be coaching Jamie, a sophomore mechanical engineering student considering switching to art/design. 
              Please provide some basic information to get started.
            </p>
          </div>
          
          {/* Mode Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Select Mode *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setGameMode('game')}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  gameMode === 'game' 
                    ? 'border-[#2C73EB] bg-blue-50 text-[#2C73EB]' 
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-semibold">Game</div>
                <div className="text-xs text-gray-500 mt-1">With progress tracking</div>
              </button>
              <button
                onClick={() => setGameMode('assessment')}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  gameMode === 'assessment' 
                    ? 'border-[#2C73EB] bg-blue-50 text-[#2C73EB]' 
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-semibold">Assessment</div>
                <div className="text-xs text-gray-500 mt-1">Clean evaluation mode</div>
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2C73EB] focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-500"
                placeholder="Your name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2C73EB] focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-500"
                placeholder="your.email@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Affiliation
              </label>
              <input
                type="text"
                value={formData.affiliation}
                onChange={(e) => setFormData({...formData, affiliation: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2C73EB] focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-500"
                placeholder="University, Company, etc."
              />
            </div>
            
            
            <button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.email}
              className="w-full bg-[#2C73EB] text-white py-3 px-6 rounded-lg hover:bg-[#1e5bb8] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Coaching Session
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Decision Quality Score visualization - now only shows coaching effectiveness
  // eslint-disable-next-line no-unused-vars
  const DQScoreDisplay = ({ scores, avgDqScore, className = "" }) => {
    const dimensions = [
      { key: 'framing', label: 'Framing', color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
      { key: 'alternatives', label: 'Alternatives', color: 'bg-gradient-to-r from-emerald-500 to-emerald-600' },
      { key: 'information', label: 'Information', color: 'bg-gradient-to-r from-amber-500 to-amber-600' },
      { key: 'values', label: 'Values', color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
      { key: 'reasoning', label: 'Reasoning', color: 'bg-gradient-to-r from-teal-500 to-teal-600' },
      { key: 'commitment', label: 'Commitment', color: 'bg-gradient-to-r from-indigo-500 to-indigo-600' }
    ];

    // Use the "weakest link" principle - DQ score is the minimum of all components
    const avgScore = Math.min(...Object.values(scores));

    return (
      <div className={`${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Star className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-bold text-gray-800">Coaching Effectiveness</h3>
        </div>
        
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-gray-700">Decision Quality Score</span>
            <span className="text-sm font-medium text-gray-800">{avgScore.toFixed(1)}/1.0</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {dimensions.map(dim => (
              <div key={dim.key} className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-gray-700">
                  <span>{dim.label}</span>
                  <span className="text-gray-600">{scores[dim.key]?.toFixed(1)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                  <div
                    className={`${dim.color} h-3 rounded-full transition-all duration-500 shadow-sm`}
                    style={{ width: `${scores[dim.key] * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Individual message component
  // eslint-disable-next-line no-unused-vars
  const ChatMessage = ({ message, isUser, dqScore, avgDqScore, timestamp, isError, showDemoButton, onMessageClick, showDqScore }) => {
    // Determine Jamie's current state for progress display
    const getJamieState = (score) => {
      if (score >= 0.8) return { label: 'Confident', color: 'text-green-600', bg: 'bg-green-50' };
      if (score >= 0.6) return { label: 'Thoughtful', color: 'text-blue-600', bg: 'bg-blue-50' };
      if (score >= 0.3) return { label: 'Uncertain', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      return { label: 'Confused', color: 'text-red-600', bg: 'bg-red-50' };
    };

    const jamieState = !isUser ? getJamieState(avgDqScore || 0) : null;

    return (
      <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-6 overflow-hidden`}>
        {!isUser && (
          <JamieFace dqScore={dqScore} avgDqScore={avgDqScore} />
        )}
        
        <div className={`max-w-[85%] ${isUser ? 'order-2' : ''} min-w-0 flex-shrink`}>
          <div
            className={`p-4 rounded-3xl shadow-sm ${
              isUser
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white ml-auto shadow-blue-200/50'
                : isError
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-white text-gray-800 shadow-gray-200/50 border border-gray-100 cursor-pointer hover:shadow-md transition-shadow'
            }`}
            onClick={!isUser && onMessageClick ? onMessageClick : undefined}
          >
            <p className="whitespace-pre-wrap text-sm leading-relaxed break-words overflow-hidden word-wrap-anywhere">{message}</p>
            
            {/* Jamie's Progress - show in all Jamie's messages */}
            {!isUser && jamieState && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Jamie's Progress</span>
                  <span className="text-sm font-medium text-gray-800">{jamieState.label} • {((avgDqScore || 0) * 100).toFixed(0)}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      avgDqScore >= 0.8 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                      avgDqScore >= 0.6 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                      avgDqScore >= 0.3 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                      'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{ width: `${(avgDqScore || 0) * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Confused</span>
                  <span>Uncertain</span>
                  <span>Thoughtful</span>
                  <span>Confident</span>
                </div>
                
                {/* Coaching Effectiveness - show when clicked and in game mode */}
                {dqScore && showDqScore && characterData[currentCharacter].gameMode === 'game' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Star className="w-3 h-3 text-white" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-800">Coaching Effectiveness</h3>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-700">Decision Quality Score</span>
                        <span className="text-sm font-medium text-gray-800">{(avgDqScore !== undefined ? avgDqScore : safeMinDqScore(dqScore)).toFixed(1)}/1.0</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: 'framing', label: 'Framing', color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
                          { key: 'alternatives', label: 'Alternatives', color: 'bg-gradient-to-r from-emerald-500 to-emerald-600' },
                          { key: 'information', label: 'Information', color: 'bg-gradient-to-r from-amber-500 to-amber-600' },
                          { key: 'values', label: 'Values', color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
                          { key: 'reasoning', label: 'Reasoning', color: 'bg-gradient-to-r from-teal-500 to-teal-600' },
                          { key: 'commitment', label: 'Commitment', color: 'bg-gradient-to-r from-indigo-500 to-indigo-600' }
                        ].map(dim => (
                          <div key={dim.key} className="space-y-1">
                            <div className="flex justify-between text-xs font-medium text-gray-700">
                              <span>{dim.label}</span>
                              <span className="text-gray-600">{dqScore[dim.key]?.toFixed(1)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
                              <div
                                className={`${dim.color} h-2 rounded-full transition-all duration-500 shadow-sm`}
                                style={{ width: `${dqScore[dim.key] * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {showDemoButton && (
              <button
                onClick={() => setDemoMode(true)}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Try Demo Mode
              </button>
            )}
          </div>
          
          <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        </div>
        
        {isUser && (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0 order-3 shadow-md">
            <User className="w-5 h-5 text-blue-600" />
          </div>
        )}
      </div>
    );
  };

  // Typing indicator
  // eslint-disable-next-line no-unused-vars
  const TypingIndicator = () => (
    <div className="flex gap-3 justify-start mb-6 overflow-hidden">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center flex-shrink-0 shadow-md">
        <Bot className="w-5 h-5 text-pink-600" />
      </div>
      <div className="bg-white text-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 max-w-[85%] min-w-0 flex-shrink">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
        </div>
      </div>
    </div>
  );

  // Send message function
  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading || attemptsRemaining <= 0) return;

    const messageText = currentMessage.trim();
    setCurrentMessage('');
    
    // Decrement attempts
    setAttemptsRemaining(prev => {
      const newAttempts = prev - 1;
      return newAttempts;
    });
    
    // Add user message immediately with smooth transition
    const userMessage = {
      id: Date.now(),
      message: messageText,
      isUser: true,
      timestamp: new Date().toISOString(),
      userInfo
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    
    // Small delay before showing loading state for smoother transition
    setTimeout(() => {
      setIsLoading(true);
      setIsTyping(true);
      
      // Scroll to the user's message during loading
      setTimeout(() => {
        const userMessageElement = document.querySelector('[data-message-id="' + userMessage.id + '"]');
        if (userMessageElement && chatContainerRef.current) {
          const messageOffsetTop = userMessageElement.offsetTop;
          chatContainerRef.current.scrollTo({
            top: messageOffsetTop,
            behavior: 'smooth'
          });
        }
      }, 100);
      
      // Start thinking text animation with smooth transitions
      // Persona-specific loading messages that match each character's vibe
      const getThinkingStates = (character) => {
        switch(character) {
          case 'jamie':
            // Jamie: confused, uncertain student - casual, uncertain, overwhelmed
            return ['Hmm...', 'I dunno...', 'Let me think...', 'Maybe...', 'I guess...', 'Um...'];
          case 'andres':
            // Andres: burnt out engineer - practical, measured, slightly defensive
            return ['Hmm', 'Let me see...', 'Well...', 'I suppose...', 'Actually...', 'Right...'];
          case 'kavya':
            // Kavya: recent graduate exploring - curious, thoughtful, exploratory
            return ['Hmm...', 'Interesting...', 'Let me consider...', 'I wonder...', 'That\'s a good point...', 'Maybe...'];
          default:
            // Default: more natural, less robotic
            return ['Hmm...', 'Let me think...', 'I see...', 'Hmm', 'Well...'];
        }
      };
      
      const thinkingStates = getThinkingStates(currentCharacter);
      let currentIndex = 0;
      const thinkingInterval = setInterval(() => {
        // Fade out
        setIsTextTransitioning(true);
        
        // Change text after fade out
        setTimeout(() => {
          setThinkingText(thinkingStates[currentIndex]);
          currentIndex = (currentIndex + 1) % thinkingStates.length;
          
          // Fade in
          setTimeout(() => {
            setIsTextTransitioning(false);
          }, 50);
        }, 150);
      }, 1200);
      
      // Store interval ID to clear later
      window.thinkingInterval = thinkingInterval;
    }, 150);

    // Handle demo mode
    if (demoMode) {
      setTimeout(() => {
        const demoDqScore = getDemoScore();
        const jamieReply = getDemoResponse(messageText);
        
        // Calculate DQ score using "weakest link" principle for demo
        const demoAvgDqScore = Math.min(...Object.values(demoDqScore));
        
        // Update user message with demo DQ score
        setMessages(prev => prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, dqScore: demoDqScore, avgDqScore: demoAvgDqScore }
            : msg
        ));

        // Add Jamie's demo response
        const jamieMessage = {
          id: Date.now() + 1,
          message: jamieReply,
          isUser: false,
          dqScore: demoDqScore,
          avgDqScore: demoAvgDqScore,
          timestamp: new Date().toISOString(),
          sessionId: "demo-session",
          userId: "demo-user"
        };

        setMessages(prev => [...prev, jamieMessage]);
        setIsLoading(false);
        setIsTyping(false);
        
        // Clear thinking animation
        if (window.thinkingInterval) {
          clearInterval(window.thinkingInterval);
          window.thinkingInterval = null;
        }
        
        // Check if session should end after Jamie's demo response
        if (attemptsRemaining - 1 <= 0) {
          setTimeout(() => {
            // Get the latest DQ scores
            const jamieMessages = messages.filter(msg => !msg.isUser && msg.dqScore);
            const latestMessage = jamieMessages.length > 0 ? jamieMessages[jamieMessages.length - 1] : null;
            const finalDqScore = latestMessage?.dqScore || demoDqScore;
            
            // Check if user achieved 0.7 or higher score
            const currentProgress = getJamieProgress();
            const hasWon = currentProgress >= 70; // 70% = 0.7 score
            
            // Different messages for assessment vs game mode
            const isAssessment = characterData[currentCharacter].gameMode === 'assessment';
            
            const sessionEndMessage = {
              id: Date.now() + 2,
              message: isAssessment 
                ? hasWon 
                  ? `🎉 Congratulations! You've completed Jamie's assessment with a strong performance! Your coaching helped Jamie make progress in their decision-making. Here's your final Decision Quality Score:`
                  : `Assessment complete! You've finished Jamie's coaching session. While you didn't reach the target score of 70%, you've helped Jamie think through their decision. Here's your final Decision Quality Score:`
                : hasWon 
                  ? `🎉 Congratulations! You achieved ${currentProgress}% progress! You've successfully helped ${characterData[currentCharacter].name} improve their decision-making skills. Click 'Start New Session' to begin again.`
                  : `Session ended. You've used all ${getMaxAttempts(currentCharacter)} attempts but didn't reach the target score of 70%. ${characterData[currentCharacter].name}'s current progress is ${currentProgress}%. Click 'Start New Session' to try again.`,
              isUser: false,
              timestamp: new Date().toISOString(),
              isSessionEnd: true,
              hasWon: hasWon,
              dqScore: isAssessment ? finalDqScore : undefined,
              showFinalScore: isAssessment
            };
            
            // Update user progress
            if (userInfo) {
              const rawFinalScore = finalDqScore ? Math.min(...Object.values(finalDqScore)) : 0; // Minimum DQ score (coach sees)
              const personaStage = null;
              const progressData = {
                finalScore: rawFinalScore,
                rawScore: rawFinalScore,
                stage: personaStage,
                attemptsUsed: getMaxAttempts(currentCharacter), // All attempts were used when session ends
                mode: characterData[currentCharacter].gameMode,
                dqScores: finalDqScore,
                completed: characterData[currentCharacter].gameMode === 'assessment' ? true : (rawFinalScore >= 0.7),
                messages: [...messages, sessionEndMessage] // Include the full chat transcript with end message
              };
              // Use the correct auth service based on USE_SUPABASE_AUTH flag
              if (USE_SUPABASE_AUTH) {
                supabaseAuthService.updateProgress(currentCharacter, progressData);
              } else {
                authService.updateProgress(currentCharacter, progressData);
              }
              
              // Clear in-progress session since it's complete
              clearInProgressSession(currentCharacter);
            }
            
            setMessages(prev => [...prev, sessionEndMessage]);
          }, 1000);
        }
      }, 1500 + Math.random() * 1000);
      return;
    }

    try {
      debugLog('Sending message to API:', messageText);
      
      // Determine backend URL based on environment
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const backendUrl = isDevelopment ? 'http://localhost:3001/chat' : 'https://jamie-backend.onrender.com/chat';
      
      // Prepare request body with user information
      // CRITICAL: Include character in session_id to prevent cross-contamination between personas
      const sessionId = userInfo 
        ? `session-${userInfo.id}-${currentCharacter}` 
        : `anon-session-${currentCharacter}`;
      const requestBody = {
        message: messageText,
        session_id: sessionId,
        user_id: userInfo ? userInfo.id : 'anon-user',
        character: currentCharacter
      };
      
      debugLog('Request body:', requestBody);
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      debugLog('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      debugLog('API Response:', data);
      
      // Update user message with DQ score components and minimum
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, dqScore: data.dq_score, avgDqScore: data.dq_score_minimum }
          : msg
      ));

      // Add Jamie's response
      const jamieMessage = {
        id: Date.now() + 1,
        message: data.jamie_reply,
        isUser: false,
        dqScore: data.dq_score,
        avgDqScore: data.dq_score_minimum,
        timestamp: data.timestamp,
        sessionId: data.session_id,
        userId: data.user_id
      };

      // Update attempts remaining from backend response
      if (data.turnsRemaining !== undefined) {
        // If waiting for final response (closing message just sent), ensure user can still respond
        if (data.isWaitingForFinalResponse) {
          setAttemptsRemaining(1); // Allow one more response
        } else {
          setAttemptsRemaining(data.turnsRemaining);
        }
      } else {
        // Fallback: decrement attempts remaining if not in response
        setAttemptsRemaining(prev => Math.max(0, prev - 1));
      }
      
      // Add small delay before showing Jamie's response for smoother transition
      setTimeout(() => {
        setMessages(prev => [...prev, jamieMessage]);
        setConnectionStatus('connected');
        setIsLoading(false);
        setIsTyping(false);
        
        // Reset demo mode since backend is working
        if (demoMode) {
          debugLog('✅ Backend is working, resetting demo mode');
          setDemoMode(false);
        }
        
        // Scroll the AI response to the top of the view
        setTimeout(() => {
          const lastMessageElement = document.querySelector('[data-message-id="' + jamieMessage.id + '"]');
          if (lastMessageElement && chatContainerRef.current) {
            // Get the message's offset from the top of its container
            const messageOffsetTop = lastMessageElement.offsetTop;
            
            // Scroll the container so the message appears at the top
            chatContainerRef.current.scrollTo({
              top: messageOffsetTop,
              behavior: 'smooth'
            });
          }
        }, 200);
        
        // Clear thinking animation
        if (window.thinkingInterval) {
          clearInterval(window.thinkingInterval);
          window.thinkingInterval = null;
        }
        
        // Check if session should end after Jamie's response
        // Don't end if we're waiting for a final response to the closing message
        const isWaitingForFinalResponse = data.isWaitingForFinalResponse || false;
        if (!isWaitingForFinalResponse && attemptsRemaining - 1 <= 0) {
          setTimeout(() => {
            // Get the latest DQ scores
            const allMessages = [...messages, jamieMessage];
            const characterMessages = allMessages.filter(msg => !msg.isUser && msg.dqScore);
            const latestMessage = characterMessages.length > 0 ? characterMessages[characterMessages.length - 1] : null;
            const finalDqScore = latestMessage?.dqScore || data.dq_score;
            
            // Check if user achieved 0.7 or higher score
            const currentProgress = getJamieProgress();
            const hasWon = currentProgress >= 70; // 70% = 0.7 score
            
            // Different messages for assessment vs game mode
            const isAssessment = characterData[currentCharacter].gameMode === 'assessment';
            
            const sessionEndMessage = {
              id: Date.now() + 2,
              message: isAssessment 
                ? hasWon 
                  ? `🎉 Congratulations! You've completed Jamie's assessment with a strong performance! Your coaching helped Jamie make progress in their decision-making. Here's your final Decision Quality Score:`
                  : `Assessment complete! You've finished Jamie's coaching session. While you didn't reach the target score of 70%, you've helped Jamie think through their decision. Here's your final Decision Quality Score:`
                : hasWon 
                  ? `🎉 Congratulations! You achieved ${currentProgress}% progress! You've successfully helped ${characterData[currentCharacter].name} improve their decision-making skills. Click 'Start New Session' to begin again.`
                  : `Session ended. You've used all ${getMaxAttempts(currentCharacter)} attempts but didn't reach the target score of 70%. ${characterData[currentCharacter].name}'s current progress is ${currentProgress}%. Click 'Start New Session' to try again.`,
              isUser: false,
              timestamp: new Date().toISOString(),
              isSessionEnd: true,
              hasWon: hasWon,
              dqScore: isAssessment ? finalDqScore : undefined,
              showFinalScore: isAssessment
            };
            
            // Update user progress
            if (userInfo) {
              const rawFinalScore = finalDqScore ? Math.min(...Object.values(finalDqScore)) : 0; // Minimum DQ score (coach sees)
              const personaStage = characterData[currentCharacter].gameMode === 'assessment' ? null : (data?.persona_stage ?? null);
              const progressData = {
                finalScore: rawFinalScore,
                rawScore: rawFinalScore,
                stage: personaStage,
                attemptsUsed: getMaxAttempts(currentCharacter), // All attempts were used when session ends
                mode: characterData[currentCharacter].gameMode,
                dqScores: finalDqScore,
                completed: characterData[currentCharacter].gameMode === 'assessment' ? true : (rawFinalScore >= 0.7),
                messages: [...messages, sessionEndMessage] // Include the full chat transcript with end message
              };
              // Use the correct auth service based on USE_SUPABASE_AUTH flag
              if (USE_SUPABASE_AUTH) {
                supabaseAuthService.updateProgress(currentCharacter, progressData);
              } else {
                authService.updateProgress(currentCharacter, progressData);
              }
              
              // Clear in-progress session since it's complete
              clearInProgressSession(currentCharacter);
            }
            
            setMessages(prev => [...prev, sessionEndMessage]);
          }, 1000);
        }
      }, 200);

    } catch (error) {
      console.error('Detailed error sending message:', error);
      setConnectionStatus('failed');
      
      // Automatically switch to demo mode when backend fails
      debugLog('❌ Backend failed, switching to demo mode');
      setDemoMode(true);
      
      // Use demo response instead of showing error
      const demoResponse = getDemoResponse(messageText);
      const errorMessage = {
        id: Date.now() + 1,
        message: demoResponse,
        isUser: false,
        timestamp: new Date().toISOString(),
        isDemo: true
      };
      // Add small delay before showing error message for smoother transition
      setTimeout(() => {
        setMessages(prev => [...prev, errorMessage]);
        setIsLoading(false);
        setIsTyping(false);
        
        // Clear thinking animation
        if (window.thinkingInterval) {
          clearInterval(window.thinkingInterval);
          window.thinkingInterval = null;
        }
      }, 200);
    }
  };

  // Handle message input change (optimized to prevent flashing)
  const handleMessageChange = (e) => {
    setCurrentMessage(e.target.value);
    adjustMessageInputHeight(e.target);
  };

  // Handle enter key (optimized)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    // Allow Shift+Enter for new lines
  };

  // Safety check: if userInfo exists but currentView is null, default to homepage
  // BUT: if we're still checking auth or restoring view, don't default yet (will show loading instead)
  const safeCurrentView = (userInfo && !currentView && !isAuthChecking) ? 'homepage' : currentView;
  
  // Additional safety: preserve chat view during progress loading
  // Always preserve chat view if user is in a chat session, regardless of loading state
  const finalCurrentView = (currentView === 'chat') ? 'chat' : safeCurrentView;

  // Determine if we should show the shared visual
  // Don't show during loading to prevent flash
  const isAuthOrViewLoading = isAuthChecking || (userInfo && !currentView);
  const showSharedVisual = !isAuthOrViewLoading && (!userInfo || finalCurrentView === 'homepage');

  // Debug logging for routing
  debugLog('App.js render - userInfo:', !!userInfo, 'currentView:', currentView, 'safeCurrentView:', safeCurrentView, 'finalCurrentView:', finalCurrentView, 'isLoadingProgress:', isLoadingProgress, 'isAuthOrViewLoading:', isAuthOrViewLoading);

  return (
    <div className="min-h-screen bg-white">
      {/* Shared visual that persists across login and homepage */}
      {/* Don't render during loading to prevent flash */}
      {showSharedVisual && <SharedVisual />}
      
      {/* Page Content */}
      {isAuthOrViewLoading ? (
        // Show loading while checking auth OR while view is being restored
        // This ensures we don't render homepage or landing page before we know the correct view
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : !userInfo ? (
        <LandingPage onLogin={handleLogin} onSignUp={handleLogin} />
      ) : currentView === 'homepage' ? (
        <HomePage 
          userInfo={userInfo}
          gameMode={gameMode}
          onStartCoaching={handleStartCoaching}
          onLogout={handleLogout}
          onSettings={handleSettings}
          onCharacterClick={handleCharacterClick}
          onAdminClick={() => setCurrentView('admin')}
          currentView={currentView}
          userProgress={userInfo?.progress}
          isLoadingProgress={isLoadingProgress}
          onResetLoading={resetLoadingState}
        />
      ) : finalCurrentView === 'dashboard' ? (
        <UserDashboard 
          userInfo={userInfo}
          onBackToHome={() => setCurrentView('homepage')}
        />
      ) : finalCurrentView === 'admin' ? (
        <AdminDashboard 
          userInfo={userInfo}
          onBackToHome={() => setCurrentView('homepage')}
          onLogout={handleLogout}
          onSettings={() => setCurrentView('settings')}
          currentView={currentView}
        />
      ) : finalCurrentView === 'settings' ? (
        <SettingsPage 
          userInfo={userInfo}
          onBackToHome={() => setCurrentView('homepage')}
          onLogout={handleLogout}
          onAdminClick={() => setCurrentView('admin')}
          currentView={currentView}
        />
      ) : finalCurrentView === 'classrooms' ? (
        <TeacherClassrooms 
          onBackToHome={() => setCurrentView('homepage')}
          onViewClassroom={(classroomId) => {
            debugLog('App.js: onViewClassroom called with classroomId:', classroomId);
            setSelectedClassroomId(classroomId);
            setCurrentView('classroom-detail');
            debugLog('App.js: Set currentView to classroom-detail');
          }}
        />
      ) : finalCurrentView === 'classroom-detail' ? (
        (() => {
          debugLog('App.js: Rendering ClassroomDetail, classroomId:', selectedClassroomId);
          return (
            <ClassroomDetail 
              classroomId={selectedClassroomId}
              onBack={() => setCurrentView('classrooms')}
            />
          );
        })()
      ) : finalCurrentView === 'chat' ? (
        <div className="bg-white h-screen w-full flex flex-col sm:flex-row">
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .message-enter {
          animation: slideInUp 0.3s ease-out;
        }
        
        .progress-circle {
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .progress-arc {
          transition: stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .progress-text {
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes progressPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        .progress-animate {
          animation: progressPulse 0.8s ease-out;
        }
      `}</style>
      
      {/* Left Sidebar - Hidden on mobile */}
      <div className="hidden sm:flex w-[320px] flex-col" style={{ padding: '29px' }}>
        {/* Page Title */}
        <div className="mb-[100px]">
          <h1 className="text-[25px] font-bold text-black leading-[28px]">
            Decision<br />Coach
          </h1>
        </div>
        
        {/* Character Info */}
        <div className="mb-10">
          <h2 className="text-[20px] font-semibold text-[#363636] mb-0" style={{ fontFamily: 'Futura, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>{characterData[currentCharacter].name}</h2>
          <p className="text-[16px] text-[#363636]">{characterData[currentCharacter].title}</p>
        </div>
        
        {/* Context Section - Show only after first message in both modes */}
        {messages.length > 0 && (
          <div className="mb-6 max-w-[250px]">
            <h3 className="text-[14px] font-semibold text-[#363636] mb-1" style={{ fontFamily: 'Futura, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
              Scenario
            </h3>
            <p className="text-[12px] text-[#535862] leading-relaxed">
              {characterData[currentCharacter].context}
            </p>
          </div>
        )}
        
        {/* Progress Bar - Only show in Game mode */}
        {characterData[currentCharacter].gameMode === 'game' && (
          <div className="mb-2 mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-medium text-[#535862]">{characterData[currentCharacter].progressLabel}</span>
              <span className="text-[12px] font-semibold text-[#181d27]">{animatedProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-1000 ease-out ${isProgressAnimating ? 'progress-animate' : ''}`}
                style={{ width: `${animatedProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Character's State - Only show in Game mode */}
        {characterData[currentCharacter].gameMode === 'game' && (
          <p className="text-[16px] font-medium text-[#797979] text-left mb-4">
            {getCharacterState()}
          </p>
        )}
        
        
        {/* Spacer to push navigation to bottom */}
        <div className="flex-1"></div>
      </div>
      
      
      {/* Mobile Title - Fixed Position */}
      <div className="block sm:hidden fixed top-0 left-0 right-0 z-40 bg-white px-6 py-4">
        <div className="text-black font-bold text-[25px] leading-[28px]">
          <div>Decision</div>
          <div>Coach</div>
        </div>
      </div>

      {/* Mobile Hamburger Menu - Fixed Position */}
      <div className="fixed top-4 right-4 sm:hidden z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-lg border text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        
        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-12 right-0 bg-white rounded-lg shadow-lg border p-2 min-w-[200px]">
            <button 
              onClick={() => {
                setCurrentView('homepage');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            
            {userInfo?.role === 'teacher' && (
              <button 
                onClick={() => {
                  setCurrentView('admin');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded transition-colors ${
                  currentView === 'admin' 
                    ? 'text-blue-600 hover:bg-blue-50' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </button>
            )}
            
            <button 
              onClick={() => {
                handleSettings();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-600 hover:bg-gray-50 rounded transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            
            <button 
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-600 hover:bg-gray-50 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Desktop Navigation Bar - positioned outside sidebar for proper click events */}
      <div className="hidden sm:block absolute bottom-6 left-6 z-50">
        <div className="bg-white rounded-lg shadow-lg p-4 flex items-center space-x-4 border w-fit">
          <button 
            onClick={() => setCurrentView('homepage')}
            className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
              currentView === 'homepage' 
                ? 'text-blue-600 hover:bg-blue-50' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Home className="w-5 h-5" />
          </button>
          {userInfo?.role === 'teacher' && (
            <>
              <div className="w-px h-6 bg-gray-300"></div>
              <button 
                onClick={() => setCurrentView('admin')}
                className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                  currentView === 'admin' 
                    ? 'text-blue-600 hover:bg-blue-50' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                title="Admin Dashboard"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
            </>
          )}
          <div className="w-px h-6 bg-gray-300"></div>
          <button 
            onClick={handleSettings}
            className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
              currentView === 'settings' 
                ? 'text-blue-600 hover:bg-blue-50' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-gray-300"></div>
          <button 
            onClick={handleLogout}
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Character Info Button - Fixed Position Above Input Bar */}
      <div className="block sm:hidden fixed bottom-14 right-4 z-40">
        <button
          onClick={() => setShowCharacterInfo(true)}
          className="w-8 h-8 flex items-center justify-center bg-[#EFF8FF] rounded-full shadow-sm hover:bg-[#E0F2FE] transition-colors"
        >
          <User className="w-4 h-4 text-[#2C73EB]" />
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative w-full sm:w-auto">
        {/* Session Controls - Top Right - Hidden on Mobile */}
       <div className="hidden sm:flex absolute top-6 right-6 z-10 items-center gap-2">
         <button
           onClick={resetSession}
           className="w-7 h-7 sm:w-9 sm:h-9 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
           title="Reset Session"
         >
           <RotateCcw className="w-3 h-3 sm:w-5 sm:h-5" />
         </button>
         <button
           onClick={() => {
             saveInProgressSession();
             setCurrentView('homepage');
           }}
           className="w-7 h-7 sm:w-9 sm:h-9 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
           title="Exit Session"
         >
           <X className="w-3 h-3 sm:w-5 sm:h-5" />
         </button>
       </div>
        
        {/* Chat Messages Container */}
        <div ref={chatContainerRef} className="flex-1 bg-white sm:bg-[rgba(217,217,217,0.19)] overflow-y-auto relative pb-32 sm:pb-40">
          <div className="max-w-[866px] mx-auto px-3 py-6 sm:px-0 sm:py-[76px] flex flex-col gap-4 sm:gap-[46px] pt-20">
            {messages.length === 0 && (
              <div className="text-center py-8 sm:py-16">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#2C73EB] flex items-end justify-center mx-auto mb-4 sm:mb-6 shadow-lg overflow-hidden">
                  <img 
                    src={
                      currentCharacter === 'jamie' ? "/images/cu-JAMIE.png" : 
                      currentCharacter === 'andres' ? "/images/cu-Andres.png" :
                      "/images/cu-GIRL-2.png"
                    } 
                    alt={characterData[currentCharacter].name} 
                    className={`w-16 h-16 sm:w-20 sm:h-20 object-cover object-bottom ${currentCharacter === 'andres' || currentCharacter === 'kavya' ? 'scale-x-[-1]' : ''}`}
                  />
                </div>
                <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-10">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800" style={{ fontFamily: 'Futura, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
                    Start coaching {characterData[currentCharacter].name} {demoMode && <span className="text-xs sm:text-sm font-medium text-blue-600 bg-blue-100 px-2 sm:px-3 py-1 rounded-full ml-2">Demo Mode</span>}
                  </h2>
                </div>
                <p className="text-gray-600 max-w-lg mx-auto mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed px-4">
                  {characterData[currentCharacter].context}
                </p>
                
                {!demoMode && connectionStatus === 'failed' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 max-w-md mx-auto mb-4 mx-4">
                    <p className="text-yellow-800 text-xs sm:text-sm mb-3">
                      ⚠️ Backend is temporarily unavailable. Switching to demo mode...
                    </p>
                    <div className="flex justify-center">
                      <button
                        onClick={() => setDemoMode(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                      >
                        Continue with Demo Mode
                      </button>
                    </div>
                  </div>
                )}
                
                {demoMode && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 max-w-md mx-auto mb-4 mx-4">
                    <p className="text-blue-800 text-xs sm:text-sm mb-3">
                      🎭 Demo mode active - Jamie will respond with simulated conversations and DQ scores.
                    </p>
                    <button
                      onClick={() => {
                        setDemoMode(false);
                        testConnection();
                      }}
                      className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm"
                    >
                      Try Real Backend
                    </button>
                  </div>
                )}
              </div>
            )}

            {messages.map((msg) => (
              <React.Fragment key={msg.id}>
                {msg.isUser ? (
                  // User messages - blue bubble
                  <div className="flex justify-end message-enter" data-message-id={msg.id}>
                    <div className="bg-[#e8f1f8] rounded-[5px] shadow-[0px_6px_20px_10px_rgba(200,201,201,0.11)] px-4 py-4 sm:px-6 sm:py-6 max-w-[605px] mx-4 sm:mx-0">
                      <p className="text-sm sm:text-[16px] text-[#363636] leading-[22px] sm:leading-[26px]">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Jamie's messages - white bubble with avatar and DQ scores
                  <div className="flex gap-2 sm:gap-[30px] items-start message-enter" data-message-id={msg.id}>
                  {/* Character Avatar */}
                  <div className="w-8 h-8 sm:w-[70px] sm:h-[70px] rounded-full bg-[#2C73EB] flex items-end justify-center flex-shrink-0 overflow-hidden">
                    <img 
                      src={
                        currentCharacter === 'jamie' ? "/images/cu-JAMIE.png" : 
                        currentCharacter === 'andres' ? "/images/cu-Andres.png" :
                        "/images/cu-GIRL-2.png"
                      } 
                      alt={characterData[currentCharacter].name} 
                      className={`w-8 h-8 sm:w-[70px] sm:h-[70px] object-cover object-bottom ${currentCharacter === 'andres' || currentCharacter === 'kavya' ? 'scale-x-[-1]' : ''}`}
                    />
                  </div>
                    
                    {/* Jamie's Message */}
                    <div className="bg-white rounded-[5px] shadow-[0px_6px_20px_10px_rgba(200,201,201,0.11)] px-4 py-4 sm:px-[33px] sm:py-6 max-w-[597px] mx-4 sm:mx-0">
                      <div className="flex flex-col gap-[25px]">
                        {/* Message Text */}
                        <div className="text-sm sm:text-[16px] text-[#333333] leading-[22px] sm:leading-[26px]">
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                          
                          {/* Final DQ Score for Assessment Mode */}
                          {msg.showFinalScore && msg.dqScore && (
                            <div className="mt-4 sm:mt-6">
                              {/* Gray Hairline Divider */}
                              <div className="w-full h-px bg-gray-300 mb-4 sm:mb-6"></div>
                              
                              <div className="flex flex-col gap-4 sm:gap-[25px]">
                                {/* DQ Header */}
                                <div className="flex flex-col">
                                  <p className="text-base sm:text-[18px] font-bold text-[#363636] leading-[22px] sm:leading-[26px]">
                                    Your Final Decision Quality Score
                                  </p>
                                  <p className="text-xl sm:text-[24px] font-bold text-[#2C73EB] leading-[28px] sm:leading-[32px] mt-1">
                                    {(msg.avgDqScore !== undefined ? msg.avgDqScore : safeMinDqScore(msg.dqScore)).toFixed(2)}/1.0
                                  </p>
                                  <p className="text-xs sm:text-[14px] text-[#797979] mt-2">
                                    This score reflects your coaching effectiveness across all six dimensions of decision quality.
                                  </p>
                                </div>
                                
                                {/* DQ Metrics Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-[34px]">
                                  {[
                                    { key: 'framing', label: 'Framing', color: 'bg-[#0385c3]', value: msg.dqScore.framing },
                                    { key: 'alternatives', label: 'Alternatives', color: 'bg-[#53b723]', value: msg.dqScore.alternatives },
                                    { key: 'information', label: 'Information', color: 'bg-[#ff8210]', value: msg.dqScore.information },
                                    { key: 'values', label: 'Values', color: 'bg-[#991bb2]', value: msg.dqScore.values },
                                    { key: 'reasoning', label: 'Reasoning', color: 'bg-[#d01102]', value: msg.dqScore.reasoning },
                                    { key: 'commitment', label: 'Commitment', color: 'bg-[#ffb20d]', value: msg.dqScore.commitment }
                                  ].map(metric => (
                                    <div key={metric.key} className="flex flex-col gap-1 sm:gap-[6px]">
                                      <div className="flex justify-between items-center">
                                        <p className="text-xs sm:text-[14px] font-medium text-[#363636]">{metric.label}</p>
                                        <p className="text-xs sm:text-[14px] font-semibold text-[#363636]">{metric.value.toFixed(2)}</p>
                                      </div>
                                      <div className="relative w-full h-2 sm:h-[11px] bg-[rgba(217,217,217,0.44)] rounded-[10px]">
                                        <div 
                                          className={`absolute top-0 left-0 h-full rounded-[10px] ${metric.color}`}
                                          style={{ width: `${metric.value * 100}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Performance Feedback */}
                                {(() => {
                                  const minScore = msg.avgDqScore !== undefined ? msg.avgDqScore : safeMinDqScore(msg.dqScore);
                                  return (
                                    <div className={`p-3 sm:p-4 rounded-lg ${
                                      minScore >= 0.8 
                                        ? 'bg-green-50 border border-green-200' 
                                        : minScore >= 0.6
                                        ? 'bg-blue-50 border border-blue-200'
                                        : 'bg-yellow-50 border border-yellow-200'
                                    }`}>
                                      <p className={`text-xs sm:text-[14px] font-medium ${
                                        minScore >= 0.8 
                                          ? 'text-green-800' 
                                          : minScore >= 0.6
                                          ? 'text-blue-800'
                                          : 'text-yellow-800'
                                      }`}>
                                        {minScore >= 0.8 
                                          ? '🎉 Excellent! You demonstrated strong coaching skills across all dimensions.'
                                          : minScore >= 0.6
                                          ? '👍 Good effort! Review the lower-scoring dimensions to improve your coaching approach.'
                                          : '💡 Keep practicing! Focus on asking questions that address all six dimensions of decision quality.'}
                                      </p>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          )}
                          
                          {/* Session End Button */}
    {msg.isSessionEnd && (
      <div className="mt-6 flex justify-center">
        <button
          onClick={resetSession}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            msg.hasWon 
              ? "bg-green-500 text-white hover:bg-green-600" 
              : "bg-[#2C73EB] text-white hover:bg-[#1e5bb8]"
          }`}
        >
          Start New Session
        </button>
      </div>
    )}
                        </div>
                        
                        {/* Gray Hairline Divider */}
                        {msg.dqScore && characterData[currentCharacter].gameMode === 'game' && (
                          <div className="w-full h-px bg-gray-300"></div>
                        )}
                        
                        {/* DQ Score Panel */}
                        {msg.dqScore && characterData[currentCharacter].gameMode === 'game' && (
                          <div className="flex flex-col gap-[25px]">
                            {/* DQ Header */}
                            <div className="flex flex-col">
                              <p className="text-[16px] font-semibold text-[#797979] leading-[26px]">
                                Decision Quality Score
                              </p>
                              <p className="text-[16px] font-semibold text-[#797979] leading-[26px]">
                                {(msg.avgDqScore !== undefined ? msg.avgDqScore : safeMinDqScore(msg.dqScore)).toFixed(1)}/1.0
                              </p>
                            </div>
                            
                            {/* DQ Metrics Grid */}
                            <div className="grid grid-cols-2 gap-[34px]">
                              {[
                                { key: 'framing', label: 'Framing', color: 'bg-[#0385c3]', value: msg.dqScore.framing },
                                { key: 'alternatives', label: 'Alternatives', color: 'bg-[#53b723]', value: msg.dqScore.alternatives },
                                { key: 'information', label: 'Information', color: 'bg-[#ff8210]', value: msg.dqScore.information },
                                { key: 'values', label: 'Values', color: 'bg-[#991bb2]', value: msg.dqScore.values },
                                { key: 'reasoning', label: 'Reasoning', color: 'bg-[#d01102]', value: msg.dqScore.reasoning },
                                { key: 'commitment', label: 'Commitment', color: 'bg-[#ffb20d]', value: msg.dqScore.commitment }
                              ].map(metric => (
                                <div key={metric.key} className="flex flex-col gap-[6px]">
                                  <div className="flex justify-between items-center">
                                    <p className="text-[14px] text-[#797979]">{metric.label}</p>
                                    <p className="text-[14px] text-[#797979] text-right">{metric.value.toFixed(1)}</p>
                                  </div>
                                  <div className="relative w-full h-[11px] bg-[rgba(217,217,217,0.44)] rounded-[10px]">
                                    <div 
                                      className={`absolute top-0 left-0 h-full rounded-[10px] ${metric.color}`}
                                      style={{ width: `${metric.value * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
            
              {isTyping && (
                <div className="flex gap-2 sm:gap-[30px] items-start">
                  <div className="w-8 h-8 sm:w-[70px] sm:h-[70px] rounded-full bg-[#2C73EB] flex items-end justify-center flex-shrink-0 overflow-hidden">
                    <img 
                      src={
                        currentCharacter === 'jamie' ? "/images/cu-JAMIE.png" : 
                        currentCharacter === 'andres' ? "/images/cu-Andres.png" :
                        "/images/cu-GIRL-2.png"
                      } 
                      alt={characterData[currentCharacter].name} 
                      className={`w-8 h-8 sm:w-[70px] sm:h-[70px] object-cover object-bottom ${currentCharacter === 'andres' || currentCharacter === 'kavya' ? 'scale-x-[-1]' : ''}`}
                    />
                  </div>
                  <div className="bg-white rounded-[5px] shadow-[0px_6px_20px_10px_rgba(200,201,201,0.11)] px-4 py-4 sm:px-[33px] sm:py-6 mx-4 sm:mx-0">
                    <div className="flex items-center">
                      <span 
                        className="text-sm sm:text-[16px] text-[#6B7280] font-medium transition-all duration-200 ease-in-out"
                        style={{
                          opacity: isTextTransitioning ? 0.3 : 1,
                          transform: isTextTransitioning ? 'translateY(2px)' : 'translateY(0px)'
                        }}
                      >
                        {thinkingText}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Fixed Input Bar at Bottom */}
          <div className="fixed bottom-0 left-0 right-0 p-2 sm:p-6 z-10">
            <div className="max-w-[866px] mx-auto flex flex-col items-center sm:mr-32 relative">
              {/* Attempts Remaining - Above input, positioned above blue input bar */}
              <div className="mb-1 sm:mb-0 self-start sm:ml-36 flex-shrink-0">
                <div className="bg-[#eff8ff] rounded-[16px] px-2 sm:px-3 py-1 w-fit">
                  <p className="text-xs sm:text-[14px] font-medium text-[#2c73eb] text-center">
                    {attemptsRemaining <= 0 ? "Session ended" : `${attemptsRemaining} attempts remaining`}
                  </p>
                </div>
              </div>
              
              {/* Blue Input Chat */}
                <div className="bg-[#538ff6] rounded-[25px] sm:rounded-[45px] w-full max-w-[400px] sm:max-w-[626px] px-3 sm:px-[29px] py-2 sm:py-[15px] flex items-center justify-between shadow-2xl">
                <textarea
                  ref={messageInputRef}
                  value={currentMessage}
                  onChange={handleMessageChange}
                  onKeyPress={handleKeyPress}
                  placeholder={attemptsRemaining <= 0 ? "Session ended - Start new session" : "Start coaching"}
                  className="bg-transparent text-white placeholder-white flex-1 outline-none text-xs sm:text-[14px] font-semibold resize-none min-h-[20px] max-h-[120px] overflow-y-auto"
                  disabled={isLoading || attemptsRemaining <= 0}
                  rows={1}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !currentMessage.trim() || attemptsRemaining <= 0}
                  className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center disabled:opacity-50"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Character Info Popup */}
      {showCharacterInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 sm:hidden">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">{characterData[currentCharacter].name}</h2>
              <button
                onClick={() => setShowCharacterInfo(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 text-sm">{characterData[currentCharacter].title}</p>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Scenario</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {characterData[currentCharacter].context}
              </p>
            </div>
            
            {characterData[currentCharacter].gameMode === 'game' && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">{characterData[currentCharacter].progressLabel}</span>
                  <span className="text-sm font-semibold text-gray-800">{animatedProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-1000 ease-out ${isProgressAnimating ? 'progress-animate' : ''}`}
                    style={{ width: `${animatedProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {characterData[currentCharacter].gameMode === 'game' && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  {getCharacterState()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
      ) : (
        <div className="bg-white h-screen w-full flex items-center justify-center">
          <p className="text-gray-500">Unknown view: {finalCurrentView}</p>
        </div>
      )}
    </div>
  );
};

const JamieAI = () => {
  const isResetRoute =
    typeof window !== 'undefined' &&
    window.location.pathname === '/reset-password';

  if (isResetRoute) {
    return <ResetPasswordPage />;
  }

  return <MainApp />;
};

export default JamieAI;
