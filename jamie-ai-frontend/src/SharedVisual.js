import React from 'react';

const SharedVisual = () => {
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
      position: { x: 1100, y: 320 },
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
      avatar: '/images/Daniel-2P.png',
      description: 'Sophomore Mechanical Engineering student considering switching to Art/Design',
      position: { x: 1100, y: 720 },
      completed: false
    },
    {
      id: 'sarah',
      name: 'Sarah',
      status: 'Locked',
      dqScore: null,
      avatar: '👩‍🎓',
      description: 'Coming soon...',
      position: { x: 700, y: 920 },
      completed: false
    }
  ];

  return (
    <>
      <style>{`
        @keyframes elementFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
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
      `}</style>

      {/* Zig-zag Levels Diagram */}
      <div className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        <div className="px-8 pt-8 h-full">
          <div className="relative w-full max-w-7xl h-[900px]">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
              {/* Jamie to Andres */}
              <path
                d="M 1100 320 Q 900 160 700 120"
                stroke="#9CBDF5"
                strokeWidth="2"
                strokeDasharray="5,5"
                fill="none"
                style={{ animation: 'drawLineSmooth 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s both' }}
              />
              {/* Kavya to Andres */}
              <path
                d="M 700 520 Q 900 480 1100 320"
                stroke="#9CBDF5"
                strokeWidth="2"
                strokeDasharray="5,5"
                fill="none"
                style={{ animation: 'drawLineSmooth 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.6s both' }}
              />
              {/* Kavya to Daniel */}
              <path
                d="M 700 520 Q 900 580 1100 720"
                stroke="#9CBDF5"
                strokeWidth="2"
                strokeDasharray="5,5"
                fill="none"
                style={{ animation: 'drawLineSmooth 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 1.0s both' }}
              />
              {/* Daniel to Sarah */}
              <path
                d="M 700 920 Q 900 880 1100 720"
                stroke="#9CBDF5"
                strokeWidth="2"
                strokeDasharray="5,5"
                fill="none"
                style={{ animation: 'drawLineSmooth 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 1.2s both' }}
              />
            </svg>

            {/* Character nodes */}
            {coachingLevels.map((level) => (
              <div
                key={level.id}
                className="absolute pointer-events-auto"
                style={{
                  left: `${level.position.x}px`,
                  top: `${level.position.y}px`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 200,
                  animation: `elementFadeIn 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) ${
                    level.id === 'jamie' ? '0.1' : 
                    level.id === 'andres' ? '0.2' : 
                    level.id === 'kavya' ? '0.6' : 
                    level.id === 'daniel' ? '0.8' : '1.0'
                  }s both`
                }}
              >
                <div className="flex items-center space-x-4">
                  {/* Character Avatar */}
                  <div className="relative">
                    <div 
                      className="w-28 h-28 rounded-full flex items-center justify-center text-2xl overflow-hidden transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl cursor-pointer"
                      onClick={() => console.log(`${level.name} clicked`)}
                      onMouseEnter={() => console.log(`${level.name} hover enter`)}
                      onMouseLeave={() => console.log(`${level.name} hover leave`)}
                      style={
                        (level.id === 'jamie' || level.id === 'andres' || level.id === 'kavya') && level.completed 
                          ? { backgroundColor: '#9CBDF5', opacity: 1 } 
                          : level.id === 'daniel' && level.status === 'Available'
                          ? { backgroundColor: '#9CBDF5', opacity: 1 }
                          : level.status === 'Locked'
                          ? { backgroundColor: '#D1D5DB' }
                          : {}
                      }
                    >
                      {level.status === 'Locked' ? (
                        ''
                      ) : level.status === 'Available' && !level.avatar.startsWith('/') ? (
                        ''
                      ) : level.avatar.startsWith('/') ? (
                        <img 
                          src={level.avatar} 
                          alt={level.name}
                          className={`w-full h-full object-cover rounded-full ${
                            level.id === 'andres' ? 'scale-x-[-1]' : 
                            level.id === 'kavya' ? 'scale-x-[-1]' : ''
                          }`}
                          style={{ opacity: 0.5 }}
                        />
                      ) : (
                        level.avatar
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SharedVisual;

