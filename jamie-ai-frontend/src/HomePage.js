import React, { useState, useEffect, useCallback } from 'react';
import { Home, Settings, LogOut, BarChart3, Menu, X } from 'lucide-react';

const HomePage = ({ userInfo, gameMode, onStartCoaching, onLogout, onSettings, onCharacterClick, onAdminClick, currentView, userProgress, isLoadingProgress, onResetLoading }) => {
  const [hoveredCharacter, setHoveredCharacter] = useState(null);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Debug logging for userProgress prop (reduced to prevent infinite loop)
  // console.log('HomePage rendered with userProgress:', userProgress, 'isLoadingProgress:', isLoadingProgress);

  const fullText = "Welcome to Decision Coach! Start with Jamie's assessment to evaluate your coaching skills. Complete Jamie's session to unlock the game mode with other characters.";

  // Get character status and score from user progress
  const getCharacterStatus = useCallback((characterId) => {
    if (!userProgress || !userProgress[characterId]) {
      return { status: 'Not Started', score: null };
    }

    const charProgress = userProgress[characterId];
    const hasSessions = charProgress.sessions && charProgress.sessions.length > 0;
    
    if (!hasSessions) {
      return { status: 'Not Started', score: null };
    }

    // Get the latest session
    const latestSession = charProgress.lastSession || charProgress.sessions[charProgress.sessions.length - 1];
    
    if (charProgress.completed) {
      return { 
        status: 'Completed', 
        score: latestSession ? latestSession.score : null 
      };
    } else if (hasSessions) {
      return { 
        status: 'In Progress', 
        score: latestSession ? latestSession.score : null 
      };
    }

    return { status: 'Not Started', score: null };
  }, [userProgress]);

  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 50); // 50ms delay between characters

    return () => clearInterval(typingInterval);
  }, []);

  const handleCharacterClick = (character) => {
    // Prevent clicking if progress is still loading
    if (isLoadingProgress) {
      console.log('Progress is still loading, preventing character click');
      return;
    }
    
    if (character.id === 'jamie') {
      onCharacterClick('jamie');
    } else if (character.id === 'andres') {
      onCharacterClick('andres');
    } else if (character.id === 'kavya') {
      onCharacterClick('kavya');
    } else if (character.id === 'daniel') {
      onCharacterClick('daniel');
    } else if (character.id === 'sarah') {
      onCharacterClick('sarah');
    }
  };

  const coachingLevels = [
    {
      id: 'jamie',
      name: 'Jamie',
      status: 'Completed',
      dqScore: 0.8,
      avatar: '/images/DC Images/Jamie/Jamie_LandingPage.png',
      description: 'Sophomore Mechanical Engineering student considering switching to Art/Design',
      position: { x: 700, y: 120 },
      completed: true
    },
    {
      id: 'andres',
      name: 'Andres',
      status: 'Completed',
      dqScore: 0.6,
      avatar: '/images/DC Images/Andres/Andres_LandingPage.png',
      description: 'Software engineer considering a career pivot',
      position: { x: 1100, y: 320 },
      completed: true
    },
    {
      id: 'kavya',
      name: 'Kavya',
      status: 'In Progress',
      dqScore: 0.8,
      avatar: '/images/DC Images/Kavya/Kavya_LandingPage.png',
      description: 'Recent graduate exploring career options',
      position: { x: 700, y: 520 },
      completed: true
    },
    {
      id: 'daniel',
      name: 'Daniel',
      status: 'Available',
      dqScore: null,
      avatar: '/images/DC Images/Persona4/Persona4_LandingPage.png',
      description: 'Mid-career professional facing a relocation decision',
      position: { x: 1100, y: 720 },
      completed: false
    },
    {
      id: 'sarah',
      name: 'Sarah',
      status: 'Available',
      dqScore: null,
      avatar: '/images/DC Images/Persona5/Persona5_LandingPage.png',
      description: 'Professional returning to work after a career break',
      position: { x: 700, y: 920 },
      completed: false
    }
  ];

  return (
    <div className="h-screen bg-white relative flex flex-col" style={{ animation: 'pageFadeIn 0.6s ease-out' }}>
      <style>{`
        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes pageFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes elementFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes drawLine {
          from {
            stroke-dasharray: 0, 1000;
          }
          to {
            stroke-dasharray: 5, 5;
          }
        }
        @keyframes drawLineSmooth {
          from {
            stroke-dasharray: 0, 1000;
          }
          to {
            stroke-dasharray: 5, 5;
          }
        }
        @keyframes drawLineReverse {
          from {
            stroke-dasharray: 1000, 0;
          }
          to {
            stroke-dasharray: 5, 5;
          }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .typing-cursor {
          animation: blink 1s infinite;
        }
      `}</style>
      {/* Header */}
      <div className="px-6 py-4 sm:px-8 sm:py-8 sm:absolute sm:z-10">
        <div className="text-black font-bold text-[25px] leading-[28px] sm:text-2xl">
          <div>Decision</div>
          <div>Coach</div>
        </div>
      </div>

      {/* Welcome Instructions - Desktop */}
      <div className="hidden sm:block absolute z-10" style={{ top: '250px', left: '32px' }}>
        <div className="text-gray-700 text-base leading-relaxed max-w-sm">
          {displayedText.startsWith('Welcome to Decision Coach!') && (
            <>
              <span style={{ fontFamily: 'Futura, -apple-system, BlinkMacSystemFont, sans-serif', fontSize: '18px' }}>
                {displayedText.slice(0, 'Welcome to Decision Coach!'.length)}
              </span>
              {displayedText.length > 'Welcome to Decision Coach!'.length && (
                <>
                  <br />
                  <span className="text-gray-600">
                    {displayedText.slice('Welcome to Decision Coach!'.length).trim()}
                  </span>
                </>
              )}
              {isTyping && <span className="typing-cursor text-blue-600">|</span>}
            </>
          )}
          {!displayedText.startsWith('Welcome to Decision Coach!') && (
            <>
              {displayedText}
              {isTyping && <span className="typing-cursor text-blue-600">|</span>}
            </>
          )}
        </div>
      </div>

      {/* Main Network Visualization */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-48 sm:px-8 sm:pt-8" style={{ animation: 'elementFadeIn 0.8s ease-out 0.2s both' }}>
        {/* Mobile Grid Layout */}
        <div className="block sm:hidden">
          {/* Mobile Welcome Instructions */}
          <div className="px-6 py-4">
            <div className="text-gray-700 text-sm leading-relaxed">
              {displayedText.startsWith('Welcome to Decision Coach!') && (
                <>
                  <span style={{ fontFamily: 'Futura, -apple-system, BlinkMacSystemFont, sans-serif', fontSize: '18px' }}>
                    {displayedText.slice(0, 'Welcome to Decision Coach!'.length)}
                  </span>
                  {displayedText.length > 'Welcome to Decision Coach!'.length && (
                    <>
                      <br />
                      <span className="text-gray-600">
                        {displayedText.slice('Welcome to Decision Coach!'.length).trim()}
                      </span>
                    </>
                  )}
                  {isTyping && <span className="typing-cursor text-blue-600">|</span>}
                </>
              )}
              {!displayedText.startsWith('Welcome to Decision Coach!') && (
                <>
                  {displayedText}
                  {isTyping && <span className="typing-cursor text-blue-600">|</span>}
                </>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 py-6 px-4 mt-4">
            {coachingLevels.map((level, index) => (
              <div
                key={level.id}
                className="flex flex-col items-center space-y-3"
                style={{ animation: `elementFadeIn 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) ${index * 0.1}s both` }}
              >
                <div 
                  className="relative"
                  onMouseEnter={() => setHoveredCharacter(level.id)}
                  onMouseLeave={() => setHoveredCharacter(null)}
                >
                  <div 
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-lg overflow-hidden transition-all duration-300 ease-in-out ${
                      isLoadingProgress 
                        ? 'cursor-not-allowed opacity-50' 
                        : 'cursor-pointer hover:scale-110 hover:shadow-xl'
                    } ${
                      level.completed 
                        ? (level.id === 'jamie' || level.id === 'andres' || level.id === 'kavya' || level.id === 'daniel' || level.id === 'sarah') ? 'hover:opacity-90' : 'border-2 border-blue-300 hover:opacity-90'
                        : level.status === 'Available' && level.avatar.startsWith('/')
                        ? 'hover:opacity-90'
                        : level.status === 'Available'
                        ? 'bg-gray-300 hover:bg-gray-400'
                        : 'bg-gray-300'
                    }`}
                    style={(level.id === 'jamie' || level.id === 'andres' || level.id === 'kavya' || level.id === 'daniel' || level.id === 'sarah') && (level.completed || (level.status === 'Available' && level.avatar.startsWith('/'))) ? { backgroundColor: '#2C73EB', opacity: 1 } : {}}
                    onClick={() => handleCharacterClick(level)}
                  >
                    {isLoadingProgress ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : level.status === 'Locked' ? (
                      ''
                    ) : level.avatar.startsWith('/') ? (
                      <img 
                        src={level.avatar} 
                        alt={level.name}
                        className={`w-full h-full object-cover rounded-full ${level.id === 'andres' ? 'scale-x-[-1]' : ''}`}
                        style={{ opacity: 0.9 }}
                      />
                    ) : (
                      level.avatar
                    )}
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="font-semibold text-gray-800 text-xs">{level.name}</h3>
                  {isLoadingProgress ? (
                    <div className="mt-1">
                      <p className="text-xs text-gray-500">Loading progress...</p>
                      <button 
                        onClick={onResetLoading}
                        className="text-xs text-red-500 hover:text-red-700 underline mt-1"
                      >
                        Reset Loading
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 mt-1 leading-tight">{level.description}</p>
                      {level.dqScore && (
                        <p className="text-xs text-blue-600 mt-1">Score: {Math.round(level.dqScore * 100)}%</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Network Layout */}
        <div className="hidden sm:block relative w-full max-w-7xl h-[900px]">
          {/* Network connections - Curved pattern */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
            {/* Jamie to Andres - more pronounced curve */}
            <path
              d="M 1100 320 Q 900 160 700 120"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
              style={{ animation: 'drawLineSmooth 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s both' }}
            />
            {/* Kavya to Andres - downward curve */}
            <path
              d="M 700 520 Q 900 480 1100 320"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
              style={{ animation: 'drawLineSmooth 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.6s both' }}
            />
            {/* Kavya to Daniel - downward curve */}
            <path
              d="M 700 520 Q 900 580 1100 720"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
              style={{ animation: 'drawLineSmooth 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.8s both' }}
            />
            {/* Daniel to Sarah - matches Kavya to Andres pattern (reversed direction) */}
            <path
              d="M 720 910 Q 900 870 1100 710"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
              style={{ animation: 'drawLineSmooth 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 1.0s both' }}
            />
          </svg>

          {/* Character nodes */}
          {coachingLevels.map((level, index) => (
            <div
              key={level.id}
              className="absolute"
              style={{
                left: `${level.position.x}px`,
                top: `${level.position.y}px`,
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                animation: `elementFadeIn 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) ${level.id === 'jamie' ? '0.1' : level.id === 'andres' ? '0.2' : level.id === 'kavya' ? '0.6' : level.id === 'daniel' ? '0.8' : level.id === 'sarah' ? '1.0' : '1.0'}s both`
              }}
            >
              <div className="flex items-center space-x-4">
                {/* Character Avatar */}
                <div 
                  className="relative"
                  onMouseEnter={() => setHoveredCharacter(level.id)}
                  onMouseLeave={() => setHoveredCharacter(null)}
                >
                  <div 
                    className={`w-28 h-28 rounded-full flex items-center justify-center text-2xl cursor-pointer overflow-hidden transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl ${
                      level.completed 
                        ? (level.id === 'jamie' || level.id === 'andres' || level.id === 'kavya' || level.id === 'daniel' || level.id === 'sarah') ? 'hover:opacity-90' : 'border-2 border-blue-300 hover:opacity-90'
                        : level.status === 'Available' && level.avatar.startsWith('/')
                        ? 'hover:opacity-90'
                        : level.status === 'Available'
                        ? 'bg-gray-300 hover:bg-gray-400'
                        : 'bg-gray-300'
                    }`}
                    style={(level.id === 'jamie' || level.id === 'andres' || level.id === 'kavya' || level.id === 'daniel' || level.id === 'sarah') && (level.completed || (level.status === 'Available' && level.avatar.startsWith('/'))) ? { backgroundColor: '#2C73EB', opacity: 1 } : {}}
                    onClick={() => handleCharacterClick(level)}
                  >
                    {isLoadingProgress ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : level.status === 'Locked' ? (
                      ''
                    ) : level.avatar.startsWith('/') ? (
                      <img 
                        src={level.avatar} 
                        alt={level.name}
                        className={`w-full h-full object-cover rounded-full ${level.id === 'andres' ? 'scale-x-[-1]' : ''}`}
                        style={{ opacity: 0.9 }}
                      />
                    ) : (
                      level.avatar
                    )}
                  </div>
                  
                  {/* Status indicator - removed green checkmarks */}
                </div>

                {/* Character Info Card - only show on hover */}
                {hoveredCharacter === level.id && (
                  <div className={`bg-white rounded-lg shadow-lg p-4 border absolute z-10 transition-all duration-300 ease-in-out transform animate-in fade-in-0 zoom-in-95 ${
                    level.id === 'jamie' || level.id === 'kavya' || level.id === 'sarah' 
                      ? 'mr-4' 
                      : 'ml-4'
                  }`} style={{
                    left: level.id === 'jamie' || level.id === 'kavya' || level.id === 'sarah' ? '-280px' : '110px',
                    top: '-20px',
                    width: '250px',
                    animation: 'tooltipFadeIn 0.3s ease-out'
                  }}>
                    {/* Speech bubble tail - centered to the left of the circle */}
                    <div className={`absolute top-1/2 transform -translate-y-1/2 w-0 h-0 ${
                      level.id === 'jamie' || level.id === 'kavya' || level.id === 'sarah' 
                        ? 'right-[-8px] border-l-[8px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent' 
                        : 'left-[-8px] border-r-[8px] border-r-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent'
                    }`} style={{
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}></div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2">{level.name}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{getCharacterStatus(level.id).status}</span>
                      {typeof getCharacterStatus(level.id).score === 'number' && (
                        <span className="text-sm font-medium text-blue-600">
                          DQ Score: {getCharacterStatus(level.id).score.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Hamburger Menu */}
      <div className="absolute top-4 right-4 sm:hidden z-50">
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
                onStartCoaching({ id: 'home', name: 'Home' });
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
                  onAdminClick();
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
                onSettings();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-600 hover:bg-gray-50 rounded transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            
            <button 
              onClick={() => {
                onLogout();
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

      {/* Desktop Navigation Bar */}
      <div className="hidden sm:block absolute bottom-6 left-6">
        <div className="bg-white rounded-lg shadow-lg p-4 flex items-center space-x-4 border w-fit">
          <button 
            onClick={() => onStartCoaching({ id: 'home', name: 'Home' })}
            className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            <Home className="w-5 h-5" />
          </button>
          {userInfo?.role === 'teacher' && (
            <>
              <div className="w-px h-6 bg-gray-300"></div>
              <button 
                onClick={onAdminClick}
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
            onClick={onSettings}
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-gray-300"></div>
          <button 
            onClick={onLogout}
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
