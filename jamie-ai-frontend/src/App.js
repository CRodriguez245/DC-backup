import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Star, Home, Settings, LogOut } from 'lucide-react';

// Jamie's Animated Face Component
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

const JamieAI = () => {
  // User information state
  const [userInfo, setUserInfo] = useState(null);
  const [showUserInfoModal, setShowUserInfoModal] = useState(true);
  const [gameMode, setGameMode] = useState('game'); // 'game' or 'assessment'
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('untested');
  const [demoMode, setDemoMode] = useState(false); // Start with real backend
  const [showDqPanel, setShowDqPanel] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(20);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isProgressAnimating, setIsProgressAnimating] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Reset session function
  const resetSession = () => {
    setMessages([]);
    setAttemptsRemaining(20);
    setCurrentMessage('');
    setIsLoading(false);
    setIsTyping(false);
    setAnimatedProgress(0);
    setIsProgressAnimating(false);
  };

  // Animate progress changes
  useEffect(() => {
    const currentProgress = getJamieProgress();
    if (currentProgress !== animatedProgress) {
      setIsProgressAnimating(true);
      
      // Smooth animation to new progress value
      const startProgress = animatedProgress;
      const endProgress = currentProgress;
      const duration = 1200; // 1.2 seconds
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentValue = startProgress + (endProgress - startProgress) * easeOutCubic;
        
        setAnimatedProgress(Math.round(currentValue));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsProgressAnimating(false);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [messages, animatedProgress]);

  // Calculate Jamie's progress percentage
  const getJamieProgress = () => {
    if (messages.length === 0) return 0; // Start at 0%
    
    // Find the latest Jamie message with DQ score
    const jamieMessages = messages.filter(msg => !msg.isUser && msg.dqScore);
    if (jamieMessages.length === 0) return 0;
    
    const latestMessage = jamieMessages[jamieMessages.length - 1];
    if (!latestMessage.dqScore) return 0;
    
    // Calculate average of all DQ components
    const scores = Object.values(latestMessage.dqScore);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    return Math.round(averageScore * 100);
  };

  // Get Jamie's current state
  const getJamieState = () => {
    const progress = getJamieProgress();
    if (progress >= 80) return 'Confident';
    if (progress >= 60) return 'Thoughtful';
    if (progress >= 30) return 'Uncertain';
    return 'Confused';
  };

  // Test connection to backend
  const testConnection = async () => {
    setConnectionStatus('testing');
    try {
      const response = await fetch('https://jamie-backend.onrender.com/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ message: "test connection" }),
      });
      
      if (response.ok) {
        setConnectionStatus('connected');
        console.log('✅ Backend connection successful');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      setConnectionStatus('failed');
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

  // Scroll to bottom when new messages arrive (optimized)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [messages, isTyping]);

  // Test connection on mount
  useEffect(() => {
    if (!demoMode) {
      testConnection();
    }
  }, [demoMode]);

  // User info form component
  const UserInfoModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      affiliation: '',
      notes: ''
    });

    const handleSubmit = () => {
      if (!formData.name || !formData.email) return;
      setUserInfo(formData);
      setShowUserInfoModal(false);
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
            <h2 className="text-xl font-bold text-gray-800 mb-2">Welcome to JamieAI</h2>
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
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2C73EB] focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-500 resize-none"
                rows="2"
                placeholder="Any additional context or notes..."
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
                {dqScore && showDqScore && gameMode === 'game' && (
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
                        <span className="text-sm font-medium text-gray-800">{Math.min(...Object.values(dqScore)).toFixed(1)}/1.0</span>
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
        
        // Check if session should end after Jamie's demo response
        if (attemptsRemaining - 1 <= 0) {
          setTimeout(() => {
            // Check if user achieved 0.8 or higher score
            const currentProgress = getJamieProgress();
            const hasWon = currentProgress >= 80; // 80% = 0.8 score
            
            const sessionEndMessage = {
              id: Date.now() + 2,
              message: hasWon 
                ? `🎉 Congratulations! You achieved ${currentProgress}% progress! You've successfully helped Jamie improve their decision-making skills. Click 'Start New Session' to begin again.`
                : `Session ended. You've used all 20 attempts but didn't reach the target score of 80%. Jamie's current progress is ${currentProgress}%. Click 'Start New Session' to try again.`,
              isUser: false,
              timestamp: new Date().toISOString(),
              isSessionEnd: true,
              hasWon: hasWon
            };
            setMessages(prev => [...prev, sessionEndMessage]);
          }, 1000);
        }
      }, 1500 + Math.random() * 1000);
      return;
    }

    try {
      console.log('Sending message to API:', messageText);
      
      const response = await fetch('https://jamie-backend.onrender.com/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ message: messageText }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
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

      // Add small delay before showing Jamie's response for smoother transition
      setTimeout(() => {
        setMessages(prev => [...prev, jamieMessage]);
        setConnectionStatus('connected');
        setIsLoading(false);
        setIsTyping(false);
        
        // Check if session should end after Jamie's response
        if (attemptsRemaining - 1 <= 0) {
          setTimeout(() => {
            // Check if user achieved 0.8 or higher score
            const currentProgress = getJamieProgress();
            const hasWon = currentProgress >= 80; // 80% = 0.8 score
            
            const sessionEndMessage = {
              id: Date.now() + 2,
              message: hasWon 
                ? `🎉 Congratulations! You achieved ${currentProgress}% progress! You've successfully helped Jamie improve their decision-making skills. Click 'Start New Session' to begin again.`
                : `Session ended. You've used all 20 attempts but didn't reach the target score of 80%. Jamie's current progress is ${currentProgress}%. Click 'Start New Session' to try again.`,
              isUser: false,
              timestamp: new Date().toISOString(),
              isSessionEnd: true,
              hasWon: hasWon
            };
            setMessages(prev => [...prev, sessionEndMessage]);
          }, 1000);
        }
      }, 200);

    } catch (error) {
      console.error('Detailed error sending message:', error);
      setConnectionStatus('failed');
      
      // Show error message and offer demo mode
      let errorText = "I'm having trouble connecting to the backend. ";
      
      if (error.message.includes('fetch')) {
        errorText += "This might be a network issue or the backend may be sleeping. ";
      } else if (error.message.includes('500')) {
        errorText += "The backend returned an error. ";
      }
      
      errorText += "Would you like to try demo mode instead?";
      
      const errorMessage = {
        id: Date.now() + 1,
        message: errorText,
        isUser: false,
        timestamp: new Date().toISOString(),
        isError: true,
        showDemoButton: true
      };
      // Add small delay before showing error message for smoother transition
      setTimeout(() => {
        setMessages(prev => [...prev, errorMessage]);
        setIsLoading(false);
        setIsTyping(false);
      }, 200);
    }
  };

  // Handle message input change (optimized to prevent flashing)
  const handleMessageChange = (e) => {
    setCurrentMessage(e.target.value);
  };

  // Handle enter key (optimized)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    // Allow Shift+Enter for new lines
  };

  return (
    <div className="bg-white h-screen w-full flex">
      <style jsx>{`
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
      {showUserInfoModal && <UserInfoModal />}
      
      {/* Left Sidebar */}
      <div className="w-[320px] flex flex-col p-[35px]">
        {/* Page Title */}
        <div className="mb-[100px]">
          <h1 className="text-[25px] font-bold text-black leading-[28px]">
            Decision<br />Coach
          </h1>
        </div>
        
        {/* Jamie Info */}
        <div className="mb-2">
          <h2 className="text-[20px] font-semibold text-[#363636] mb-0">Jamie</h2>
          <p className="text-[16px] text-[#363636]">Mechanical Engineering</p>
        </div>
        
        {/* Context Section */}
        <div className="mb-6">
          <p className="text-[12px] text-[#535862] leading-relaxed">
            Jamie is a sophomore mechanical engineering student considering switching to art/design. 
            He's worried about disappointing his immigrant parents. How would you coach him?
          </p>
        </div>
        
        {/* Progress Bar - Only show in Game mode */}
        {gameMode === 'game' && (
          <div className="mb-2 mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-medium text-[#535862]">Jamie's Progress</span>
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
        
        {/* Jamie's State */}
        <p className="text-[16px] font-medium text-[#797979] text-left mb-4">
          {getJamieState()}
        </p>
        
        
        {/* Spacer to push navigation to bottom */}
        <div className="flex-1"></div>
        
        {/* Navigation Bar */}
        <div className="w-[229px] h-[80px] flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg px-6 py-4 flex items-center justify-between w-full">
            <button className="w-[30px] h-[30px] flex items-center justify-center">
              <Home className="w-6 h-6 text-gray-600" />
            </button>
            <div className="w-px h-6 bg-gray-300"></div>
            <button className="w-[30px] h-[30px] flex items-center justify-center">
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
            <div className="w-px h-6 bg-gray-300"></div>
            <button className="w-[30px] h-[30px] flex items-center justify-center">
              <LogOut className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Chat Messages Container */}
        <div className="flex-1 bg-[rgba(217,217,217,0.19)] overflow-y-auto relative pb-24">
          <div className="max-w-[866px] mx-auto p-[76px_0] flex flex-col gap-[46px]">
            {messages.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-[#2C73EB] flex items-end justify-center mx-auto mb-6 shadow-lg overflow-hidden">
                  <img 
                    src="/images/cu-JAMIE.png" 
                    alt="Jamie" 
                    className="w-20 h-20 object-cover object-bottom"
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Start Coaching Jamie {demoMode && <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full ml-2">Demo Mode</span>}
                </h2>
                <p className="text-gray-600 max-w-lg mx-auto mb-8 text-lg leading-relaxed">
                  Jamie is a sophomore mechanical engineering student considering switching to art/design. 
                  He's worried about disappointing his immigrant parents. How would you coach him?
                </p>
                
                {!demoMode && connectionStatus === 'failed' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto mb-4">
                    <p className="text-yellow-800 text-sm mb-3">
                      ⚠️ Can't connect to the backend. This might be because:
                    </p>
                    <ul className="text-yellow-700 text-xs mb-3 list-disc list-inside space-y-1">
                      <li>Backend is sleeping (Render.com free tier)</li>
                      <li>Network connectivity issue</li>
                      <li>Backend configuration problem</li>
                    </ul>
                    <div className="flex gap-2">
                      <button
                        onClick={testConnection}
                        className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Retry Connection
                      </button>
                      <button
                        onClick={() => setDemoMode(true)}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Use Demo Mode
                      </button>
                    </div>
                  </div>
                )}
                
                {demoMode && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto mb-4">
                    <p className="text-blue-800 text-sm mb-3">
                      🎭 Demo mode active - Jamie will respond with simulated conversations and DQ scores.
                    </p>
                    <button
                      onClick={() => {
                        setDemoMode(false);
                        testConnection();
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
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
                  <div className="flex justify-end message-enter">
                    <div className="bg-[#e8f1f8] rounded-[5px] shadow-[0px_6px_20px_10px_rgba(200,201,201,0.11)] px-6 py-6 max-w-[605px]">
                      <p className="text-[16px] text-[#363636] leading-[26px]">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Jamie's messages - white bubble with avatar and DQ scores
                  <div className="flex gap-[30px] items-start message-enter">
                  {/* Jamie's Avatar */}
                  <div className="w-[70px] h-[70px] rounded-full bg-[#2C73EB] flex items-end justify-center flex-shrink-0 overflow-hidden">
                    <img 
                      src="/images/cu-JAMIE.png" 
                      alt="Jamie" 
                      className="w-[70px] h-[70px] object-cover object-bottom"
                    />
                  </div>
                    
                    {/* Jamie's Message */}
                    <div className="bg-white rounded-[5px] shadow-[0px_6px_20px_10px_rgba(200,201,201,0.11)] px-[33px] py-6 max-w-[597px]">
                      <div className="flex flex-col gap-[25px]">
                        {/* Message Text */}
                        <div className="text-[16px] text-[#333333] leading-[26px]">
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                          
                          {/* Session End Button */}
    {msg.isSessionEnd && (
      <div className="mt-4 flex justify-center">
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
                        {msg.dqScore && gameMode === 'game' && (
                          <div className="w-full h-px bg-gray-300"></div>
                        )}
                        
                        {/* DQ Score Panel */}
                        {msg.dqScore && gameMode === 'game' && (
                          <div className="flex flex-col gap-[25px]">
                            {/* DQ Header */}
                            <div className="flex flex-col">
                              <p className="text-[16px] font-semibold text-[#797979] leading-[26px]">
                                Decision Quality Score
                              </p>
                              <p className="text-[16px] font-semibold text-[#797979] leading-[26px]">
                                {Math.min(...Object.values(msg.dqScore)).toFixed(1)}/1.0
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
                <div className="flex gap-[30px] items-start">
                  <div className="w-[70px] h-[70px] rounded-full bg-[#2C73EB] flex items-end justify-center flex-shrink-0 overflow-hidden">
                    <img 
                      src="/images/cu-JAMIE.png" 
                      alt="Jamie" 
                      className="w-[70px] h-[70px] object-cover object-bottom"
                    />
                  </div>
                  <div className="bg-white rounded-[5px] shadow-[0px_6px_20px_10px_rgba(200,201,201,0.11)] px-[33px] py-6">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#538FF6] rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-[#538FF6] rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-[#538FF6] rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                  </div>
                </div>
              )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Fixed Input Bar at Bottom */}
          <div className="fixed bottom-0 left-0 right-0 p-6 z-10">
            <div className="max-w-[866px] mx-auto flex flex-col items-center mr-32">
              {/* Attempts Remaining - Above input, positioned above blue input bar */}
              <div className="mb-0 self-start ml-36">
                <div className="bg-[#eff8ff] rounded-[16px] px-3 py-1 w-fit">
                  <p className="text-[14px] font-medium text-[#2c73eb] text-center">
                    {attemptsRemaining <= 0 ? "Session ended" : `${attemptsRemaining} attempts remaining`}
                  </p>
                </div>
              </div>
              
              {/* Blue Input Chat */}
              <div className="bg-[#538ff6] rounded-[45px] w-[626px] px-[29px] py-[15px] flex items-center justify-between shadow-2xl">
                <textarea
                  value={currentMessage}
                  onChange={handleMessageChange}
                  onKeyPress={handleKeyPress}
                  placeholder={attemptsRemaining <= 0 ? "Session ended - Start new session" : "Start coaching"}
                  className="bg-transparent text-white placeholder-white flex-1 outline-none text-[14px] font-semibold resize-none min-h-[20px] max-h-[120px] overflow-y-auto"
                  disabled={isLoading || attemptsRemaining <= 0}
                  rows={1}
                  style={{
                    height: 'auto',
                    minHeight: '20px',
                    maxHeight: '120px'
                  }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !currentMessage.trim() || attemptsRemaining <= 0}
                  className="w-6 h-6 flex items-center justify-center disabled:opacity-50"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JamieAI;
