import React from 'react';
import { Play, Settings, LogOut, User, BookOpen, Target, TrendingUp } from 'lucide-react';

const HomePage = ({ userInfo, gameMode, onStartCoaching, onLogout, onSettings }) => {
  const coachingSessions = [
    {
      id: 1,
      title: "Career Decision Coaching",
      description: "Help someone navigate a major career change",
      difficulty: "Intermediate",
      duration: "15-20 min",
      participants: "1-on-1",
      status: "Available"
    },
    {
      id: 2,
      title: "Life Transition Support",
      description: "Guide someone through a significant life transition",
      difficulty: "Advanced",
      duration: "20-25 min",
      participants: "1-on-1",
      status: "Available"
    },
    {
      id: 3,
      title: "Decision Framework Practice",
      description: "Practice structured decision-making techniques",
      difficulty: "Beginner",
      duration: "10-15 min",
      participants: "1-on-1",
      status: "Available"
    }
  ];

  const stats = [
    { label: "Sessions Completed", value: "12", icon: BookOpen },
    { label: "Coaching Hours", value: "8.5", icon: Target },
    { label: "Success Rate", value: "92%", icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-black font-bold text-xl">
                <div>Decision</div>
                <div>Coach</div>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{userInfo?.name}</span>
              </div>
              
              <button
                onClick={onSettings}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userInfo?.name}!
          </h1>
          <p className="text-gray-600">
            Ready to practice your coaching skills? Choose a session below to get started.
          </p>
        </div>

        {/* Mode Indicator */}
        <div className="mb-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
            {gameMode === 'game' ? '🎮 Game Mode' : '📊 Assessment Mode'}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <stat.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coaching Sessions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coachingSessions.map((session) => (
              <div key={session.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {session.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{session.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Difficulty:</span>
                      <span className="font-medium">{session.difficulty}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium">{session.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Format:</span>
                      <span className="font-medium">{session.participants}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onStartCoaching(session)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Session</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => onStartCoaching({ id: 'quick', title: 'Quick Practice Session' })}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Play className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Quick Practice</p>
                <p className="text-sm text-gray-600">Start a 10-minute coaching session</p>
              </div>
            </button>
            
            <button
              onClick={onSettings}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-gray-100 rounded-lg mr-3">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Settings</p>
                <p className="text-sm text-gray-600">Manage your preferences</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
