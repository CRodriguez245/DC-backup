import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Home, Settings, LogOut, BarChart3, Users, Plus, Copy, Check, Eye, Menu, X } from 'lucide-react';
import { supabaseAuthService as authService } from './services/SupabaseAuthService.js';

// Helper function to safely calculate minimum DQ score, filtering out NaN and invalid values
const safeMinDqScore = (dqScoreObj) => {
  if (!dqScoreObj || typeof dqScoreObj !== 'object') return 0;
  const values = Object.values(dqScoreObj)
    .filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v) && v >= 0 && v <= 1);
  return values.length > 0 ? Math.min(...values) : 0;
};

const AdminDashboard = ({ onBackToHome, onLogout, onSettings, currentView, userInfo }) => {
  console.log('AdminDashboard component rendering, userInfo:', userInfo);
  
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'classrooms'
  console.log('AdminDashboard activeTab:', activeTab);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassroom, setNewClassroom] = useState({ name: '', description: '' });
  const [copiedCode, setCopiedCode] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const loadClassrooms = useCallback(async () => {
    console.log('loadClassrooms called');
    try {
      console.log('Calling authService.getUserClassrooms()...');
      const result = await authService.getUserClassrooms();
      console.log('getUserClassrooms result:', result);
      
      if (result.success) {
        console.log('Setting classrooms:', result.classrooms);
        setClassrooms(result.classrooms);
      } else {
        console.error('Failed to load classrooms:', result.error);
      }
    } catch (error) {
      console.error('Error loading classrooms:', error);
    }
  }, []);

  // Load classrooms on component mount
  useEffect(() => {
    console.log('Component mounted, loading classrooms');
    console.log('loadClassrooms function:', loadClassrooms);
    console.log('userInfo:', userInfo);
    console.log('About to call loadClassrooms...');
    loadClassrooms().catch(error => {
      console.error('Error loading classrooms on mount:', error);
    });
  }, [loadClassrooms, userInfo]);

  // Force load classrooms on mount - direct approach
  useEffect(() => {
    console.log('Force loading classrooms on mount');
    const loadClassroomsDirectly = async () => {
      try {
        console.log('Calling authService.getUserClassrooms() directly...');
        const result = await authService.getUserClassrooms();
        console.log('Direct getUserClassrooms result:', result);
        
        if (result.success) {
          console.log('Direct setting classrooms:', result.classrooms);
          setClassrooms(result.classrooms);
        } else {
          console.error('Direct failed to load classrooms:', result.error);
        }
      } catch (error) {
        console.error('Direct error loading classrooms:', error);
      }
    };
    
    loadClassroomsDirectly();
  }, []);

  useEffect(() => {
    console.log('useEffect triggered, activeTab:', activeTab);
    if (activeTab === 'classrooms') {
      console.log('activeTab is classrooms, calling loadClassrooms');
      loadClassrooms().catch(error => {
        console.error('Error loading classrooms:', error);
      });
    } else {
      console.log('activeTab is not classrooms, not calling loadClassrooms');
    }
  }, [activeTab, loadClassrooms]);

  const handleCreateClassroom = async () => {
    console.log('handleCreateClassroom called with:', newClassroom);
    
    if (!newClassroom.name.trim()) {
      console.log('Classroom name is empty, returning');
      return;
    }

    console.log('Attempting to create classroom...');
    try {
      const result = await authService.createClassroom(newClassroom);
      console.log('Create classroom result:', result);
      
      if (result.success) {
        console.log('Classroom created successfully:', result.classroom);
        setClassrooms([...classrooms, result.classroom]);
        setShowCreateModal(false);
        setNewClassroom({ name: '', description: '' });
        // Reload classrooms after creation
        await loadClassrooms();
      } else {
        console.error('Failed to create classroom:', result.error);
        alert('Failed to create classroom: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating classroom:', error);
      alert('Error creating classroom: ' + error.message);
    }
  };

  const copyClassCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Get real students from all classrooms
  const [students, setStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const isLoadingStudentsRef = useRef(false);

  const loadAllStudents = useCallback(async () => {
    if (userInfo?.role !== 'teacher') {
      return;
    }

    if (isLoadingStudentsRef.current) {
      return;
    }

    isLoadingStudentsRef.current = true;
    setIsLoadingStudents(true);
    
    try {
      // Get all classrooms for this teacher
      const classroomsResult = await authService.getUserClassrooms();
      if (!classroomsResult.success) {
        console.error('Failed to load classrooms:', classroomsResult.error);
        return;
      }
      
      const teacherClassrooms = classroomsResult.classrooms;
      
      // Load students from all classrooms
      const allStudents = [];
      for (const classroom of teacherClassrooms) {
        const studentResult = await authService.getClassroomStudents(classroom.id);
        if (studentResult.success && studentResult.students) {
          studentResult.students.forEach(s => {
            if (s && !allStudents.find(existing => existing.id === s.id)) {
              allStudents.push(s);
            }
          });
        }
      }
      
      setStudents(allStudents);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      isLoadingStudentsRef.current = false;
      setIsLoadingStudents(false);
    }
  }, [userInfo?.role]);

  // Load students when component mounts or when activeTab changes
  useEffect(() => {
    loadAllStudents();
  }, [activeTab, loadAllStudents]);

  const [searchTerm, setSearchTerm] = useState('');

  const [selectedSession, setSelectedSession] = useState(null);

  const handleViewAssessment = (student) => {
    console.log('AdminDashboard: handleViewAssessment called for student:', student.name);
    console.log('AdminDashboard: Student progress:', student.progress);
    
    setSelectedStudent(student);
    // Find the most recent Jamie assessment session (or first available)
    const jamieSession = student.progress?.jamie?.sessions?.[student.progress.jamie.sessions.length - 1];
    const andresSession = student.progress?.andres?.sessions?.[student.progress.andres.sessions.length - 1];
    const kavyaSession = student.progress?.kavya?.sessions?.[student.progress.kavya.sessions.length - 1];
    
    console.log('AdminDashboard: jamieSession:', jamieSession);
    console.log('AdminDashboard: andresSession:', andresSession);
    console.log('AdminDashboard: kavyaSession:', kavyaSession);
    
    // Use the most recent session
    const recentSession = jamieSession || andresSession || kavyaSession;
    
    console.log('AdminDashboard: recentSession selected:', recentSession);
    console.log('AdminDashboard: recentSession messages:', recentSession?.messages);
    console.log('AdminDashboard: recentSession messages length:', recentSession?.messages?.length);
    
    setSelectedSession(recentSession);
    setShowAssessmentModal(true);
  };

  const closeAssessmentModal = () => {
    setShowAssessmentModal(false);
    setSelectedStudent(null);
    setSelectedSession(null);
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      {/* Mobile Title - Fixed Position */}
      <div className="block sm:hidden fixed top-0 left-0 right-0 z-40 bg-white px-6 py-4">
        <div className="text-black font-bold text-[25px] leading-[28px]">
          <div>Decision</div>
          <div>Coach</div>
        </div>
      </div>

      {/* Mobile Hamburger Menu - Fixed Position */}
      <div className="fixed top-4 right-4 sm:hidden z-50">
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
                onBackToHome();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-600 hover:bg-gray-50 rounded transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            
            <button 
              className="w-full flex items-center space-x-3 px-3 py-2 text-left text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </button>
            
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

      {/* Left Sidebar - Hidden on Mobile */}
      <div className="hidden sm:flex w-80 bg-white flex-col flex-shrink-0 border-r border-gray-100">
        {/* Decision Coach Title */}
        <div style={{ padding: '29px' }}>
          <div className="text-black font-bold text-[25px] leading-[28px]">
            <div>Decision</div>
            <div>Coach</div>
          </div>
        </div>
        
        {/* Tabs */}
        {userInfo?.role === 'teacher' && (
          <div className="px-6 mb-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                  activeTab === 'overview' 
                    ? 'bg-blue-50 text-blue-600 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                Students Overview
              </button>
              <button
                onClick={() => setActiveTab('classrooms')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                  activeTab === 'classrooms' 
                    ? 'bg-blue-50 text-blue-600 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Users className="w-5 h-5" />
                My Classrooms
              </button>
            </div>
          </div>
        )}
        
        {/* Navigation Icons */}
        <div className="flex-1 flex items-end p-6">
          <div className="bg-white rounded-lg shadow-lg p-4 flex items-center space-x-4 border w-fit">
            <button 
              onClick={onBackToHome}
              className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                currentView === 'homepage' 
                  ? 'text-blue-600 hover:bg-blue-50' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Home className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-300"></div>
            <button 
              className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                currentView === 'admin' 
                  ? 'text-blue-600 hover:bg-blue-50' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              title="Admin Dashboard"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-300"></div>
            <button 
              onClick={onSettings}
              className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                currentView === 'settings' 
                  ? 'text-blue-600 hover:bg-blue-50' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
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

      {/* Mobile Tab Navigation */}
      {userInfo?.role === 'teacher' && (
        <div className="block sm:hidden fixed top-20 left-0 right-0 z-30 bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Overview</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('classrooms')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'classrooms' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                <span>Classrooms</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Right Main Content */}
      <div className="flex-1 flex flex-col pt-32 sm:pt-16 pl-4 sm:pl-8 overflow-y-auto">
        {activeTab === 'overview' ? (
          <>
            {/* Header with User Greeting */}
            <div className="p-4 sm:p-6">
              <h1 
                className="text-xl sm:text-3xl text-black mb-2" 
                style={{ fontFamily: 'Futura, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}
              >
                Welcome back, {userInfo?.name || 'Carlos'}!
              </h1>
              <p className="text-gray-600 text-sm">
                Monitor student progress and coaching sessions
              </p>
            </div>

        {/* Search Bar */}
        <div className="p-4 sm:p-6">
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search students by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 sm:py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors text-gray-900 text-sm sm:text-base"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Student Table */}
        <div className="flex-1 px-4 sm:px-6 pb-6">
          {/* Table Headers */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 py-4 px-4 border-b border-gray-200 text-xs sm:text-sm font-medium text-gray-700">
            <div>Name</div>
            <div className="hidden sm:block">DQ Assessment Score</div>
            <div className="hidden sm:block">Actions</div>
            <div className="sm:hidden">Score</div>
            <div className="sm:hidden">Actions</div>
          </div>

          {/* Student Rows */}
          <div className="space-y-1">
            {isLoadingStudents ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500 text-lg">Loading students...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No students enrolled yet</p>
                <p className="text-gray-400 text-sm mt-2">Students will appear here once they join your classrooms</p>
              </div>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => {
                // Get the latest assessment session score (minimum DQ component, same as student sees)
                let assessmentScore = 0;
                
                // Check all characters for assessment mode sessions
                ['jamie', 'andres', 'kavya'].forEach(character => {
                  const charProgress = student.progress?.[character];
                  if (charProgress?.sessions) {
                    // Find the most recent assessment session
                    const assessmentSessions = charProgress.sessions.filter(session => session.mode === 'assessment');
                    if (assessmentSessions.length > 0) {
                      const latestAssessment = assessmentSessions[assessmentSessions.length - 1];
                      if (latestAssessment.dqScores) {
                        // Use the minimum DQ component score (same as student sees)
                        const minScore = safeMinDqScore(latestAssessment.dqScores);
                        if (minScore > assessmentScore) {
                          assessmentScore = minScore;
                        }
                      }
                    }
                  }
                });
                
                return (
                  <div key={student.id} className="grid grid-cols-3 gap-2 sm:gap-4 py-3 sm:py-5 px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex flex-col justify-center">
                      <div className="text-gray-900 font-medium text-sm sm:text-base mb-1">{student.name}</div>
                      <div className="text-blue-600 text-xs sm:text-sm hover:underline cursor-pointer">{student.email}</div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-900 font-semibold text-sm sm:text-lg">{assessmentScore.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center">
                      <button 
                        onClick={() => handleViewAssessment(student)}
                        className="px-2 sm:px-4 py-1 sm:py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:border-gray-400 transition-colors text-xs sm:text-sm font-medium"
                      >
                        View Session
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500 text-lg">No students found matching "{searchTerm}"</p>
                <p className="text-gray-400 text-sm mt-2">Try searching by name or email</p>
              </div>
            )}
          </div>
        </div>

        {/* Assessment Modal */}
        {showAssessmentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedStudent.name}'s Progress
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedStudent.email} | Avg DQ Score: {(selectedStudent.analytics?.averageScore || 0).toFixed(2)}
                </p>
              </div>
              <button
                onClick={closeAssessmentModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Content - Chat Session Transcript */}
      <div className="flex-1 overflow-y-auto p-6 bg-[rgba(217,217,217,0.19)]">
        {(() => {
          console.log('AdminDashboard Modal: selectedSession:', selectedSession);
          console.log('AdminDashboard Modal: selectedSession.messages:', selectedSession?.messages);
          console.log('AdminDashboard Modal: selectedSession.messages.length:', selectedSession?.messages?.length);
          console.log('AdminDashboard Modal: Condition check:', selectedSession && selectedSession.messages && selectedSession.messages.length > 0);
          return null;
        })()}
        {selectedSession && selectedSession.messages && selectedSession.messages.length > 0 ? (
                <>
                  {/* Session Info Bar */}
                  <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Session Date</p>
                        <p className="font-semibold text-gray-900">{new Date(selectedSession.date).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Final DQ Score</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedSession.dqScores ? safeMinDqScore(selectedSession.dqScores).toFixed(2) : selectedSession.score.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Attempts Used</p>
                        <p className="font-semibold text-gray-900">{selectedSession.attempts}/20</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="space-y-4">
                    {selectedSession.messages.map((msg, index) => (
                      <div key={index} className={`flex ${msg.isUser ? 'justify-end' : 'gap-4'}`}>
                        {!msg.isUser && !msg.isSessionEnd && (
                          <div className="w-[50px] h-[50px] rounded-full bg-[#2C73EB] flex items-end justify-center flex-shrink-0 overflow-hidden">
                            <img 
                              src="/images/cu-JAMIE.png" 
                              alt="Character" 
                              className="w-[50px] h-[50px] object-cover object-bottom"
                            />
                          </div>
                        )}
                        
                        <div className={`max-w-[70%] rounded-lg p-4 ${
                          msg.isUser 
                            ? 'bg-[#e8f1f8] shadow-sm' 
                            : msg.isSessionEnd
                            ? 'bg-yellow-50 border border-yellow-200'
                            : 'bg-white shadow-sm'
                        }`}>
                          <p className="text-[15px] text-gray-800 whitespace-pre-wrap">{msg.message}</p>
                          
                          {msg.dqScore && !msg.isUser && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-gray-50 p-2 rounded">
                                  <span className="text-gray-600">Framing:</span>
                                  <span className="ml-2 font-semibold">{msg.dqScore.framing?.toFixed(2)}</span>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                  <span className="text-gray-600">Alternatives:</span>
                                  <span className="ml-2 font-semibold">{msg.dqScore.alternatives?.toFixed(2)}</span>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                  <span className="text-gray-600">Information:</span>
                                  <span className="ml-2 font-semibold">{msg.dqScore.information?.toFixed(2)}</span>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                  <span className="text-gray-600">Values:</span>
                                  <span className="ml-2 font-semibold">{msg.dqScore.values?.toFixed(2)}</span>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                  <span className="text-gray-600">Reasoning:</span>
                                  <span className="ml-2 font-semibold">{msg.dqScore.reasoning?.toFixed(2)}</span>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                  <span className="text-gray-600">Commitment:</span>
                                  <span className="ml-2 font-semibold">{msg.dqScore.commitment?.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No session data available</p>
              <p className="text-gray-400 text-sm mt-2">This student hasn't completed any coaching sessions yet</p>
            </div>
          )}
        </div>
          </div>
        </div>
        )}
      </>
      ) : (
          /* Classrooms Tab Content */
          <ClassroomsTabContent 
            classrooms={classrooms}
            selectedClassroom={selectedClassroom}
            setSelectedClassroom={setSelectedClassroom}
            showCreateModal={showCreateModal}
            setShowCreateModal={setShowCreateModal}
            newClassroom={newClassroom}
            setNewClassroom={setNewClassroom}
            handleCreateClassroom={handleCreateClassroom}
            copiedCode={copiedCode}
            copyClassCode={copyClassCode}
            userInfo={userInfo}
          />
        )}
      </div>
    </div>
  );
};

// Classrooms Tab Component
const ClassroomsTabContent = ({ 
  classrooms, 
  selectedClassroom, 
  setSelectedClassroom, 
  showCreateModal, 
  setShowCreateModal,
  newClassroom,
  setNewClassroom,
  handleCreateClassroom,
  copiedCode,
  copyClassCode,
  userInfo
}) => {
  if (selectedClassroom) {
    return <ClassroomDetailView classroom={selectedClassroom} onBack={() => setSelectedClassroom(null)} />;
  }

  return (
    <>
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-3xl text-black mb-2" 
              style={{ fontFamily: 'Futura, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}
            >
              My Classrooms
            </h1>
            <p className="text-gray-600 text-sm">
              Manage your classes and track student progress
            </p>
          </div>
          <button
            onClick={() => {
              console.log('Create Classroom button clicked');
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Classroom
          </button>
        </div>
      </div>

      {/* Classrooms Grid */}
      <div className="px-6 pb-6">
        {classrooms.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
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
              <div key={classroom.id} className="bg-white rounded-lg border hover:shadow-md transition-shadow">
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
                      onClick={() => setSelectedClassroom(classroom)}
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
    </>
  );
};

// Classroom Detail View Component (using ClassroomDetail.js logic)
const ClassroomDetailView = ({ classroom, onBack }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Load students for this classroom
  useEffect(() => {
    const loadClassroomStudents = async () => {
      try {
        console.log('ClassroomDetailView: Loading students for classroom:', classroom.id);
        const result = await authService.getClassroomStudents(classroom.id);
        console.log('ClassroomDetailView: getClassroomStudents result:', result);
        if (result.success) {
          setStudents(result.students);
          console.log('ClassroomDetailView: Set students:', result.students);
        } else {
          console.error('ClassroomDetailView: Failed to load students:', result.error);
        }
      } catch (error) {
        console.error('ClassroomDetailView: Error loading students:', error);
      }
    };

    loadClassroomStudents();
  }, [classroom.id]);

  const calculateClassStats = () => {
    if (students.length === 0) return { avgScore: 0, totalSessions: 0, completionRate: 0 };

    const totalScore = students.reduce((sum, student) => sum + (student.analytics.averageScore || 0), 0);
    const totalSessions = students.reduce((sum, student) => sum + student.analytics.totalSessions, 0);
    
    const completedCharacters = students.reduce((sum, student) => {
      const completed = Object.values(student.progress).filter(p => p.completed).length;
      return sum + completed;
    }, 0);
    
    const totalPossible = students.length * 3;
    const completionRate = totalPossible > 0 ? (completedCharacters / totalPossible) * 100 : 0;

    return {
      avgScore: students.length > 0 ? totalScore / students.length : 0,
      totalSessions,
      completionRate
    };
  };

  const stats = calculateClassStats();

  return (
    <div className="px-6 pb-6">
      {/* Back Button and Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        ← Back to Classrooms
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{classroom.name}</h1>
        {classroom.description && <p className="text-gray-600">{classroom.description}</p>}
        <div className="mt-2 flex items-center gap-4">
          <div className="px-3 py-1 bg-blue-100 rounded-lg">
            <span className="text-sm font-semibold text-blue-700">Code: {classroom.code}</span>
          </div>
          <span className="text-sm text-gray-500">
            {students.length} {students.length === 1 ? 'student' : 'students'} enrolled
          </span>
        </div>
      </div>

      {/* Class Statistics */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border p-6">
          <p className="text-sm font-medium text-gray-600 mb-1">Class Avg DQ Score</p>
          <p className="text-3xl font-bold text-gray-900">{stats.avgScore.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <p className="text-sm font-medium text-gray-600 mb-1">Total Sessions</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalSessions}</p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <p className="text-sm font-medium text-gray-600 mb-1">Completion Rate</p>
          <p className="text-3xl font-bold text-gray-900">{stats.completionRate.toFixed(0)}%</p>
        </div>
      </div>

      {/* Student List */}
      {students.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Yet</h3>
          <p className="text-gray-600 mb-4">
            Share the class code <span className="font-bold text-blue-600">{classroom.code}</span> with your students
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Student Progress</h2>
          </div>
          <div className="p-6 space-y-4">
            {students.map((student) => (
              <div key={student.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{student.name}</div>
                    <div className="text-sm text-gray-600">{student.email}</div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Avg DQ Score</div>
                      <div className="font-semibold text-gray-900">{student.analytics.averageScore.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Sessions</div>
                      <div className="font-semibold text-gray-900">{student.analytics.totalSessions}</div>
                    </div>
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Detail Modal (if needed) */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedStudent.name}</h2>
                <p className="text-gray-600">{selectedStudent.email}</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Average DQ Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedStudent.analytics.averageScore.toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedStudent.analytics.totalSessions}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Improvement</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedStudent.analytics.improvement > 0 ? '+' : ''}{selectedStudent.analytics.improvement.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
