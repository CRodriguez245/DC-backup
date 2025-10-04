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
      position: { x: 400, y: 120 },
      completed: true
    },
    {
      id: 'andres',
      name: 'Andres',
      status: 'Completed',
      dqScore: 0.6,
      avatar: '/images/cu-Andres.png',
      description: 'Software engineer considering a career pivot',
      position: { x: 800, y: 220 },
      completed: true
    },
    {
      id: 'kavya',
      name: 'Kavya',
      status: 'Completed',
      dqScore: 0.8,
      avatar: '👩‍💼',
      description: 'Recent graduate exploring career options',
      position: { x: 400, y: 420 },
      completed: true
    },
    {
      id: 'daniel',
      name: 'Daniel',
      status: 'Available',
      dqScore: null,
      avatar: '👨‍🎨',
      description: 'Sophomore Mechanical Engineering student considering switching to Art/Design',
      position: { x: 800, y: 520 },
      completed: false
    },
    {
      id: 'sarah',
      name: 'Sarah',
      status: 'Locked',
      dqScore: null,
      avatar: '👩‍🎓',
      description: 'Coming soon...',
      position: { x: 400, y: 720 },
      completed: false
    }
  ];

  return (
    <div className="min-h-screen bg-white relative">
      {/* Header */}
      <div className="absolute top-6 left-6 z-10">
        <div className="text-black font-bold text-[25px] leading-[28px]">
          <div>Decision</div>
          <div>Coach</div>
        </div>
      </div>

      {/* Main Network Visualization */}
      <div className="flex items-start justify-start min-h-screen p-8">
        <div className="relative w-full max-w-7xl h-[800px]">
          {/* Network connections - Zig-zag pattern */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            {/* Zig-zag path: Jamie -> Andres -> Kavya */}
            <path
              d="M 450 170 Q 600 195 800 270 Q 600 345 450 420"
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
                zIndex: 2
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
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl cursor-pointer overflow-hidden ${
                      level.completed 
                        ? level.id === 'jamie' ? 'hover:opacity-90' : 'border-2 border-blue-300 hover:opacity-90'
                        : level.status === 'Available'
                        ? 'bg-gray-200 border-2 border-gray-300 hover:bg-gray-300'
                        : 'bg-gray-100 border-2 border-gray-200'
                    } transition-colors`}
                    style={level.id === 'jamie' && level.completed ? { backgroundColor: '#2C73EB' } : {}}
                  >
                    {level.status === 'Locked' ? (
                      '🔒'
                    ) : level.avatar.startsWith('/') ? (
                      <img 
                        src={level.avatar} 
                        alt={level.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      level.avatar
                    )}
                  </div>
                  
                  {/* Status indicator - removed green checkmarks */}
                </div>

                {/* Character Info Card - only show on hover */}
                {hoveredCharacter === level.id && (
                  <div className={`bg-white rounded-lg shadow-lg p-4 min-w-[200px] border absolute z-10 ${
                    level.id === 'jamie' || level.id === 'kavya' || level.id === 'sarah' 
                      ? 'ml-4' 
                      : 'mr-4'
                  }`}>
                    <h3 className="font-semibold text-gray-900 mb-1">{level.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{level.status}</p>
                    {level.dqScore && (
                      <p className="text-sm font-medium text-blue-600">
                        DQ Score: {level.dqScore}
                      </p>
                    )}
                    {level.description && level.status !== 'Locked' && (
                      <p className="text-xs text-gray-500 mt-2 max-w-[180px]">
                        {level.description}
                      </p>
                    )}
                    
                    {/* Action button */}
                    {level.status === 'Available' && (
                      <button
                        onClick={() => onStartCoaching(level)}
                        className="mt-3 w-full bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Start Coaching
                      </button>
                    )}
                    
                    {level.status === 'Completed' && (
                      <button
                        onClick={() => onStartCoaching(level)}
                        className="mt-3 w-full bg-green-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        Review Session
                      </button>
                    )}
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
