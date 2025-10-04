import React from 'react';
import { Home, Settings, LogOut } from 'lucide-react';

const HomePage = ({ userInfo, gameMode, onStartCoaching, onLogout, onSettings }) => {
  const coachingLevels = [
    {
      id: 'jamie',
      name: 'Jamie',
      status: 'Completed',
      dqScore: 0.8,
      avatar: '👨‍🎓',
      description: 'Sophomore Mechanical Engineering student considering switching to Art/Design',
      position: { x: 200, y: 150 },
      completed: true
    },
    {
      id: 'kavya',
      name: 'Kavya',
      status: 'Completed',
      dqScore: 0.8,
      avatar: '👩‍💼',
      description: 'Recent graduate exploring career options',
      position: { x: 200, y: 350 },
      completed: true
    },
    {
      id: 'andres',
      name: 'Andres',
      status: 'Completed',
      dqScore: 0.6,
      avatar: '👨‍💻',
      description: 'Software engineer considering a career pivot',
      position: { x: 400, y: 250 },
      completed: true
    },
    {
      id: 'daniel',
      name: 'Daniel',
      status: 'Available',
      dqScore: null,
      avatar: '👨‍🎨',
      description: 'Sophomore Mechanical Engineering student considering switching to Art/Design',
      position: { x: 600, y: 400 },
      completed: false
    },
    {
      id: 'sarah',
      name: 'Sarah',
      status: 'Locked',
      dqScore: null,
      avatar: '👩‍🎓',
      description: 'Coming soon...',
      position: { x: 600, y: 550 },
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
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="relative w-full max-w-4xl h-[600px]">
          {/* Network connections */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            {/* Connection from Jamie to Andres */}
            <line
              x1="250"
              y1="200"
              x2="450"
              y2="300"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            {/* Connection from Kavya to Andres */}
            <line
              x1="250"
              y1="400"
              x2="450"
              y2="300"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeDasharray="5,5"
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
                <div className="relative">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
                    level.completed 
                      ? 'bg-blue-100 border-2 border-blue-300' 
                      : level.status === 'Available'
                      ? 'bg-gray-200 border-2 border-gray-300 cursor-pointer hover:bg-gray-300 transition-colors'
                      : 'bg-gray-100 border-2 border-gray-200'
                  }`}>
                    {level.status === 'Locked' ? '🔒' : level.avatar}
                  </div>
                  
                  {/* Status indicator */}
                  {level.completed && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>

                {/* Character Info Card */}
                <div className="bg-white rounded-lg shadow-lg p-4 min-w-[200px] border">
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
