import React, { useState, useEffect } from 'react';
import { Plus, Users, Copy, Check, Eye, Trash2, ChevronRight } from 'lucide-react';
import { supabaseAuthService as authService } from './services/SupabaseAuthService.js';

const TeacherClassrooms = ({ onBackToHome, onViewClassroom }) => {
  const [classrooms, setClassrooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassroom, setNewClassroom] = useState({ name: '', description: '' });
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    loadClassrooms();
  }, []);

  const loadClassrooms = async () => {
    try {
      const result = await authService.getUserClassrooms();
      if (result.success) {
        setClassrooms(result.classrooms);
      }
    } catch (error) {
      console.error('Error loading classrooms:', error);
    }
  };

  const handleCreateClassroom = async () => {
    if (!newClassroom.name.trim()) {
      return;
    }

    try {
      const result = await authService.createClassroom(newClassroom);
      if (result.success) {
        setClassrooms([...classrooms, result.classroom]);
        setShowCreateModal(false);
        setNewClassroom({ name: '', description: '' });
      }
    } catch (error) {
      console.error('Error creating classroom:', error);
    }
  };

  const copyClassCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Futura, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                My Classrooms
              </h1>
              <p className="text-gray-600 mt-1">Manage your classes and track student progress</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onBackToHome}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Home
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Classroom
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {classrooms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Classrooms Yet</h3>
            <p className="text-gray-600 mb-6">Create your first classroom to start tracking student progress</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Classroom
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classrooms.map((classroom) => (
              <div key={classroom.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{classroom.name}</h3>
                      {classroom.description && (
                        <p className="text-sm text-gray-600">{classroom.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Class Code */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Class Code</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600 tracking-wider">{classroom.code}</span>
                      <button
                        onClick={() => copyClassCode(classroom.code)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Copy code"
                      >
                        {copiedCode === classroom.code ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <Copy className="w-5 h-5 text-blue-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">
                        {classroom.studentIds.length} {classroom.studentIds.length === 1 ? 'student' : 'students'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      Created {new Date(classroom.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        console.log('TeacherClassrooms: View Students clicked for classroom:', classroom.id, classroom.name);
                        onViewClassroom(classroom.id);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Students
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Classroom Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Classroom</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-2">
                  Classroom Name *
                </label>
                <input
                  type="text"
                  id="className"
                  value={newClassroom.name}
                  onChange={(e) => setNewClassroom({ ...newClassroom, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Decision Making 101"
                />
              </div>

              <div>
                <label htmlFor="classDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="classDescription"
                  value={newClassroom.description}
                  onChange={(e) => setNewClassroom({ ...newClassroom, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="3"
                  placeholder="Brief description of your classroom"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewClassroom({ name: '', description: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateClassroom}
                disabled={!newClassroom.name.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Classroom
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherClassrooms;
