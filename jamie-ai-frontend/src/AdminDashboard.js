import React, { useState } from 'react';
import { BarChart3, Users, TrendingUp, Clock, Star, Eye, Download } from 'lucide-react';

const AdminDashboard = ({ onBackToHome, onLogout }) => {
  // Demo student data
  const [students] = useState([
    {
      id: 1,
      name: 'Sarah Chen',
      email: 'sarah.chen@university.edu',
      lastSession: '2024-01-15',
      totalSessions: 8,
      avgDqScore: 0.72,
      completionRate: 85,
      status: 'Active',
      recentScores: [0.68, 0.74, 0.71, 0.75, 0.69]
    },
    {
      id: 2,
      name: 'Marcus Johnson',
      email: 'marcus.j@university.edu',
      lastSession: '2024-01-14',
      totalSessions: 12,
      avgDqScore: 0.81,
      completionRate: 92,
      status: 'Active',
      recentScores: [0.78, 0.83, 0.79, 0.85, 0.82]
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      email: 'emily.r@university.edu',
      lastSession: '2024-01-13',
      totalSessions: 6,
      avgDqScore: 0.65,
      completionRate: 75,
      status: 'Needs Attention',
      recentScores: [0.62, 0.68, 0.64, 0.67, 0.63]
    },
    {
      id: 4,
      name: 'David Kim',
      email: 'david.kim@university.edu',
      lastSession: '2024-01-12',
      totalSessions: 15,
      avgDqScore: 0.88,
      completionRate: 95,
      status: 'Excellent',
      recentScores: [0.85, 0.89, 0.87, 0.91, 0.88]
    },
    {
      id: 5,
      name: 'Lisa Wang',
      email: 'lisa.wang@university.edu',
      lastSession: '2024-01-11',
      totalSessions: 4,
      avgDqScore: 0.58,
      completionRate: 60,
      status: 'Struggling',
      recentScores: [0.55, 0.61, 0.57, 0.59, 0.56]
    }
  ]);

  const [selectedStudent, setSelectedStudent] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Excellent': return 'text-green-600 bg-green-100';
      case 'Active': return 'text-blue-600 bg-blue-100';
      case 'Needs Attention': return 'text-yellow-600 bg-yellow-100';
      case 'Struggling': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const overallStats = {
    totalStudents: students.length,
    activeStudents: students.filter(s => s.status === 'Active' || s.status === 'Excellent').length,
    avgScore: (students.reduce((sum, s) => sum + s.avgDqScore, 0) / students.length).toFixed(2),
    totalSessions: students.reduce((sum, s) => sum + s.totalSessions, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Student Progress & Analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onBackToHome}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Back to Home
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.totalStudents}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.activeStudents}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg DQ Score</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.avgScore}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.totalSessions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Student Progress</h2>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg DQ Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Session</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getScoreColor(student.avgDqScore)}`}>
                        {(student.avgDqScore * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.totalSessions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${student.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{student.completionRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.lastSession}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Detail Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedStudent.name} - Session Details</h3>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-sm text-gray-900">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <p className={`text-sm ${getStatusColor(selectedStudent.status)} px-2 py-1 rounded-full inline-block`}>
                      {selectedStudent.status}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Average DQ Score</label>
                    <p className={`text-sm font-medium ${getScoreColor(selectedStudent.avgDqScore)}`}>
                      {(selectedStudent.avgDqScore * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Total Sessions</label>
                    <p className="text-sm text-gray-900">{selectedStudent.totalSessions}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Recent DQ Scores</label>
                  <div className="flex space-x-2">
                    {selectedStudent.recentScores.map((score, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                          score >= 0.8 ? 'bg-green-100 text-green-800' :
                          score >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {(score * 100).toFixed(0)}
                        </div>
                        <span className="text-xs text-gray-500 mt-1">#{index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
