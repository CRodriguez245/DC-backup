import React from 'react';
import { BarChart3, TrendingUp, Trophy, Clock, Target, CheckCircle } from 'lucide-react';
import { supabaseAuthService as authService } from './services/SupabaseAuthService.js';

const UserDashboard = ({ userInfo, onBackToHome }) => {
  const progressSummary = authService.getProgressSummary();
  
  if (!progressSummary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Progress Data</h2>
          <p className="text-gray-600 mb-6">Complete some coaching sessions to see your progress here.</p>
          <button
            onClick={onBackToHome}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Coaching
          </button>
        </div>
      </div>
    );
  }

  const { completion, analytics, progress } = progressSummary;
  const characters = [
    { id: 'jamie', name: 'Jamie', title: 'Mechanical Engineering' },
    { id: 'andres', name: 'Andres', title: 'Software Engineering' },
    { id: 'kavya', name: 'Kavya', title: 'Career Exploration' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Futura, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                Welcome back, {userInfo.name}!
              </h1>
              <p className="text-gray-600 mt-1">Track your coaching progress and achievements</p>
            </div>
            <button
              onClick={onBackToHome}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completion</p>
                <p className="text-2xl font-bold text-gray-900">{completion.completed}/{completion.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900">{(analytics.averageScore * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Improvement</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.improvement > 0 ? '+' : ''}{(analytics.improvement * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Character Progress */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Character Progress</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {characters.map((character) => {
                const charProgress = progress[character.id];
                const isCompleted = charProgress.completed;
                const bestScore = charProgress.bestScore * 100;
                const attempts = charProgress.attempts;
                const lastSession = charProgress.lastSession;

                return (
                  <div key={character.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{character.name}</h3>
                        <p className="text-sm text-gray-600">{character.title}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-400" />
                        )}
                        <span className={`text-sm font-medium ${isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                          {isCompleted ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Best Score</p>
                        <p className="text-lg font-semibold text-gray-900">{bestScore.toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Attempts</p>
                        <p className="text-lg font-semibold text-gray-900">{attempts}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Last Session</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {lastSession ? new Date(lastSession.date).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{bestScore.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isCompleted ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(bestScore, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Recent Sessions</h2>
          </div>
          <div className="p-6">
            {analytics.totalSessions > 0 ? (
              <div className="space-y-4">
                {characters.map((character) => {
                  const charProgress = progress[character.id];
                  const recentSessions = charProgress.sessions.slice(-2); // Last 2 sessions
                  
                  return recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{character.name} - {character.title}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(session.date).toLocaleDateString()} • {session.mode} mode
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{(session.score * 100).toFixed(0)}%</p>
                        <p className="text-sm text-gray-600">{session.attempts} attempts</p>
                      </div>
                    </div>
                  ));
                }).flat()}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h3>
                <p className="text-gray-600">Start coaching to see your session history here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
