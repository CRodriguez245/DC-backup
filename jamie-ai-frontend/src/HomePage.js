import React, { useState } from 'react';
import { Home, Settings, LogOut } from 'lucide-react';

const HomePage = ({ userInfo, gameMode, onStartCoaching, onLogout, onSettings }) => {
  const [hoveredCharacter, setHoveredCharacter] = useState(null);

  const coachingLevels = [
    {
      id: 'jamie',
      name: 'Jamie',
      status: 'Completed',
      dqScore: 0.8,
      avatar: '/images/cu-JAMIE.png',
      description: 'Sophomore Mechanical Engineering student considering switching to Art/Design',
      position: { x: 700, y: 120 },
      completed: true
    },
    {
      id: 'andres',
      name: 'Andres',
      status: 'Completed',
      dqScore: 0.6,
      avatar: '/images/cu-Andres.png',
      description: 'Software engineer considering a career pivot',
      position: { x: 1100, y: 280 },
      completed: true
    },
    {
      id: 'kavya',
      name: 'Kavya',
      status: 'Completed',
      dqScore: 0.8,
      avatar: '/images/cu-GIRL-2.png',
      description: 'Recent graduate exploring career options',
      position: { x: 700, y: 520 },
      completed: true
    },
    {
      id: 'daniel',
      name: 'Daniel',
      status: 'Available',
      dqScore: null,
      avatar: '👨‍🎨',
      description: 'Sophomore Mechanical Engineering student considering switching to Art/Design',
      position: { x: 1100, y: 680 },
      completed: false
    },
    {
      id: 'sarah',
      name: 'Sarah',
      status: 'Locked',
      dqScore: null,
      avatar: '👩‍🎓',
      description: 'Coming soon...',
      position: { x: 700, y: 820 },
      completed: false
    }
  ];

  return (
    <div className="h-screen bg-white relative flex flex-col">
      {/* Header */}
      <div className="absolute top-6 left-6 z-10">
        <div className="text-black font-bold text-[25px] leading-[28px]">
          <div>Decision</div>
          <div>Coach</div>
        </div>
      </div>

      {/* Main Network Visualization */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="relative w-full max-w-7xl h-[900px]">
          {/* Network connections - Curved pattern */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
            {/* Jamie to Andres - subtle upward arching curve */}
            <path
              d="M 700 120 Q 900 200 1100 280"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
            />
            {/* Kavya to Andres - subtle upward arching curve */}
            <path
              d="M 700 520 Q 900 400 1100 280"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
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
                zIndex: 10
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
                    className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl cursor-pointer overflow-hidden ${
                      level.completed 
                        ? (level.id === 'jamie' || level.id === 'andres' || level.id === 'kavya') ? 'hover:opacity-90' : 'border-2 border-blue-300 hover:opacity-90'
                        : level.status === 'Available'
                        ? 'bg-gray-300 hover:bg-gray-400'
                        : 'bg-gray-300'
                    } transition-colors`}
                    style={(level.id === 'jamie' || level.id === 'andres' || level.id === 'kavya') && level.completed ? { backgroundColor: '#2C73EB' } : {}}
                  >
                    {level.status === 'Locked' ? (
                      ''
                    ) : level.status === 'Available' ? (
                      ''
                    ) : level.avatar.startsWith('/') ? (
                      <img 
                        src={level.avatar} 
                        alt={level.name}
                        className={`w-full h-full object-cover rounded-full ${level.id === 'andres' ? 'scale-x-[-1]' : level.id === 'kavya' ? 'scale-x-[-1]' : ''}`}
                      />
                    ) : (
                      level.avatar
                    )}
                  </div>
                  
                  {/* Status indicator - removed green checkmarks */}
                </div>

                {/* Character Info Card - only show on hover */}
                {hoveredCharacter === level.id && (
                  <div className={`bg-white rounded-lg shadow-lg p-4 border absolute z-10 ${
                    level.id === 'jamie' || level.id === 'kavya' || level.id === 'sarah' 
                      ? 'mr-4' 
                      : 'ml-4'
                  }`} style={{
                    left: level.id === 'jamie' || level.id === 'kavya' || level.id === 'sarah' ? '-280px' : '100px',
                    top: '-20px',
                    width: '250px'
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
                      <span className="text-sm text-gray-600">{level.status}</span>
                      {level.dqScore && (
                        <span className="text-sm font-medium text-blue-600">
                          DQ Score: {level.dqScore}
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

      {/* Navigation Bar */}
      <div className="absolute bottom-6 left-6">
        <div className="bg-white rounded-lg shadow-lg p-4 flex items-center space-x-4 border">
          <button 
            onClick={() => onStartCoaching({ id: 'home', name: 'Home' })}
            className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            <Home className="w-5 h-5" />
          </button>
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
