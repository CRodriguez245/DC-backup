import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, TrendingUp, Trophy, Eye, CheckCircle, Clock } from 'lucide-react';
import { supabaseAuthService as authService } from './services/SupabaseAuthService.js';

const ClassroomDetail = ({ classroomId, onBack }) => {
  const [classroomData, setClassroomData] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    console.log('ClassroomDetail useEffect triggered, classroomId:', classroomId);
    loadClassroomData();
  }, [classroomId]);

  const loadClassroomData = async () => {
    try {
      console.log('ClassroomDetail: Loading data for classroomId:', classroomId);
      
      // First, refresh the user's classroom data to ensure classroomIds is up to date
      console.log('ClassroomDetail: Refreshing user classrooms...');
      await authService.getUserClassrooms();
      console.log('ClassroomDetail: User classrooms refreshed');
      
      console.log('ClassroomDetail: Calling getClassroomStudents...');
      const result = await authService.getClassroomStudents(classroomId);
      console.log('ClassroomDetail: getClassroomStudents result:', result);
      console.log('ClassroomDetail: result.success:', result.success);
      console.log('ClassroomDetail: result.classroom:', result.classroom);
      console.log('ClassroomDetail: result.students:', result.students);
      console.log('ClassroomDetail: result.students.length:', result.students?.length);
      
      if (result.success) {
        console.log('ClassroomDetail: Setting classroom data and students...');
        setClassroomData(result.classroom);
        setStudents(result.students);
        console.log('ClassroomDetail: Set students:', result.students);
        console.log('ClassroomDetail: Set classroom:', result.classroom);
      } else {
        console.error('ClassroomDetail: Failed to load classroom data:', result.error);
      }
    } catch (error) {
      console.error('Error loading classroom data:', error);
    }
  };

  const calculateClassStats = () => {
    if (students.length === 0) return { avgScore: 0, totalSessions: 0, completionRate: 0 };

    const totalScore = students.reduce((sum, student) => sum + (student.analytics.averageScore || 0), 0);
    const totalSessions = students.reduce((sum, student) => sum + student.analytics.totalSessions, 0);
    
    const completedCharacters = students.reduce((sum, student) => {
      const completed = Object.values(student.progress).filter(p => p.completed).length;
      return sum + completed;
    }, 0);
    
    const totalPossible = students.length * 3; // 3 characters per student
    const completionRate = totalPossible > 0 ? (completedCharacters / totalPossible) * 100 : 0;

    return {
      avgScore: students.length > 0 ? totalScore / students.length : 0,
      totalSessions,
      completionRate
    };
  };

  const stats = calculateClassStats();

  if (!classroomData) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-600">Loading classroom data...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Classrooms
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Futura, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                {classroomData.name}
              </h1>
              {classroomData.description && (
                <p className="text-gray-600 mt-1">{classroomData.description}</p>
              )}
              <div className="mt-2 flex items-center gap-4">
                <div className="px-3 py-1 bg-blue-100 rounded-lg">
                  <span className="text-sm font-semibold text-blue-700">Code: {classroomData.code}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {students.length} {students.length === 1 ? 'student' : 'students'} enrolled
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Class Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Class Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{(stats.avgScore * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completionRate.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Student Progress</h2>
          </div>
          
          {students.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Yet</h3>
              <p className="text-gray-600 mb-4">
                Share the class code <span className="font-bold text-blue-600">{classroomData.code}</span> with your students
              </p>
              <p className="text-sm text-gray-500">
                Students can join by entering this code during signup or in their settings
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sessions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jamie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Andres
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kavya
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => {
                    const jamieProgress = student.progress.jamie;
                    const andresProgress = student.progress.andres;
                    const kavyaProgress = student.progress.kavya;

                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {(student.analytics.averageScore * 100).toFixed(0)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.analytics.totalSessions}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge
                            completed={jamieProgress.completed}
                            score={jamieProgress.sessions?.length > 0 ? jamieProgress.sessions[jamieProgress.sessions.length - 1].score : 0}
                            attempts={jamieProgress.sessions?.length || 0}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge
                            completed={andresProgress.completed}
                            score={andresProgress.sessions?.length > 0 ? andresProgress.sessions[andresProgress.sessions.length - 1].score : 0}
                            attempts={andresProgress.sessions?.length || 0}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge
                            completed={kavyaProgress.completed}
                            score={kavyaProgress.sessions?.length > 0 ? kavyaProgress.sessions[kavyaProgress.sessions.length - 1].score : 0}
                            attempts={kavyaProgress.sessions?.length || 0}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ completed, score, attempts }) => {
  if (attempts === 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Not Started
      </span>
    );
  }

  if (completed) {
    return (
      <div className="flex flex-col">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-1">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </span>
        <span className="text-xs text-gray-600">{(score * 100).toFixed(0)}%</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mb-1">
        <Clock className="w-3 h-3 mr-1" />
        In Progress
      </span>
      <span className="text-xs text-gray-600">{(score * 100).toFixed(0)}% • {attempts} attempts</span>
    </div>
  );
};

// Student Detail Modal
const StudentDetailModal = ({ student, onClose }) => {
  const characters = [
    { id: 'jamie', name: 'Jamie', title: 'Mechanical Engineering' },
    { id: 'andres', name: 'Andres', title: 'Software Engineering' },
    { id: 'kavya', name: 'Kavya', title: 'Career Exploration' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
              <p className="text-gray-600">{student.email}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Overall Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {(student.analytics.averageScore * 100).toFixed(0)}%
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{student.analytics.totalSessions}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Improvement</p>
              <p className="text-2xl font-bold text-gray-900">
                {student.analytics.improvement > 0 ? '+' : ''}{(student.analytics.improvement * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Character Progress */}
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Character Progress</h3>
          <div className="space-y-4">
            {characters.map((character) => {
              const progress = student.progress[character.id];
              return (
                <div key={character.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{character.name}</h4>
                      <p className="text-sm text-gray-600">{character.title}</p>
                    </div>
                    <StatusBadge
                      completed={progress.completed}
                      score={progress.sessions?.length > 0 ? progress.sessions[progress.sessions.length - 1].score : 0}
                      attempts={progress.sessions?.length || 0}
                    />
                  </div>

                  {(progress.sessions?.length || 0) > 0 && (
                    <>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Latest Score</span>
                          <span>{((progress.sessions[progress.sessions.length - 1]?.score || 0) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${progress.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${(progress.sessions[progress.sessions.length - 1]?.score || 0) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Recent Sessions */}
                      {progress.sessions.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Recent Sessions</p>
                          <div className="space-y-2">
                            {progress.sessions.slice(-3).reverse().map((session, index) => (
                              <div key={session.id || index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                                <span className="text-gray-600">
                                  {new Date(session.date).toLocaleDateString()}
                                </span>
                                <span className="font-medium text-gray-900">
                                  {(session.score * 100).toFixed(0)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomDetail;
