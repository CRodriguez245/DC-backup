import React, { useState, useEffect, useCallback } from 'react';
import { Home, Settings, LogOut, BarChart3, Users, CheckCircle, X, Menu } from 'lucide-react';
import { supabaseAuthService as authService } from './services/SupabaseAuthService.js';

const SettingsPage = ({ onBackToHome, onLogout, onAdminClick, currentView, userInfo }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true
  });

  const [joinedClassrooms, setJoinedClassrooms] = useState([]);
  const [classCodeInput, setClassCodeInput] = useState('');
  const [joinMessage, setJoinMessage] = useState({ text: '', type: '' });
  const [isJoining, setIsJoining] = useState(false);

  const loadJoinedClassrooms = useCallback(async () => {
    try {
      console.log('Loading joined classrooms, userInfo:', userInfo);
      const result = await authService.getUserClassrooms();
      console.log('getUserClassrooms result:', result);
      if (result.success) {
        console.log('Setting joinedClassrooms to:', result.classrooms);
        setJoinedClassrooms(result.classrooms || []);
      } else {
        console.error('Failed to load classrooms:', result.error);
        // Don't clear existing classrooms if there's an error, just log it
        console.warn('Keeping existing classrooms due to error');
      }
    } catch (error) {
      console.error('Error loading classrooms:', error);
      // Don't clear existing classrooms on error
      console.warn('Keeping existing classrooms due to exception');
    }
  }, [userInfo]);

  useEffect(() => {
    loadJoinedClassrooms();
  }, [loadJoinedClassrooms]);

  // Debug: Log when userInfo changes
  useEffect(() => {
    console.log('SettingsPage: userInfo changed:', userInfo);
    console.log('SettingsPage: userInfo?.role:', userInfo?.role);
    console.log('SettingsPage: Will show classroom panel?', userInfo?.role === 'student');
  }, [userInfo]);

  const handleJoinClassroom = async () => {
    console.log('handleJoinClassroom called with classCodeInput:', classCodeInput);
    
    if (!classCodeInput.trim()) {
      setJoinMessage({ text: 'Please enter a class code', type: 'error' });
      return;
    }

    setIsJoining(true);
    try {
      console.log('Calling authService.joinClassroom with code:', classCodeInput.toUpperCase());
      const result = await authService.joinClassroom(classCodeInput.toUpperCase());
      console.log('joinClassroom result:', result);
      
      if (result.success) {
        setJoinMessage({ text: result.message, type: 'success' });
        setClassCodeInput('');
        
        // Reload classrooms after a short delay to ensure the enrollment is saved
        setTimeout(async () => {
          console.log('Reloading classrooms after successful join');
          await loadJoinedClassrooms();
        }, 500);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setJoinMessage({ text: '', type: '' });
        }, 3000);
      } else {
        setJoinMessage({ text: result.error, type: 'error' });
      }
    } catch (error) {
      console.error('Error in handleJoinClassroom:', error);
      setJoinMessage({ text: 'Error joining classroom: ' + error.message, type: 'error' });
    }
    
    setIsJoining(false);
  };

  return (
    <div className="h-screen bg-white flex flex-col sm:flex-row overflow-hidden relative">
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
            
            {userInfo?.role === 'teacher' && (
              <button 
                onClick={() => {
                  onAdminClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-600 hover:bg-gray-50 rounded transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </button>
            )}
            
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left text-blue-600 bg-blue-50 rounded transition-colors"
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

      {/* Left Sidebar - Hidden on mobile */}
      <div className="hidden sm:flex w-80 bg-white flex-col flex-shrink-0 border-r border-gray-100">
        {/* Decision Coach Title */}
        <div style={{ padding: '29px' }}>
          <div className="text-black font-bold text-[25px] leading-[28px]">
            <div>Decision</div>
            <div>Coach</div>
          </div>
        </div>
        
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
            {userInfo?.role === 'teacher' && (
              <>
                <div className="w-px h-6 bg-gray-300"></div>
                <button 
                  onClick={onAdminClick}
                  className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                    currentView === 'admin' 
                      ? 'text-blue-600 hover:bg-blue-50' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  title="Admin Dashboard"
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
              </>
            )}
            <div className="w-px h-6 bg-gray-300"></div>
            <button 
              className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded transition-colors"
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col pt-24 sm:pt-16 pl-4 sm:pl-8 pr-4 sm:pr-0 overflow-y-auto pb-4 sm:pb-0">
        {/* Header - Desktop only */}
        <div className="hidden sm:block p-6">
          <h1 
            className="text-3xl text-black mb-2" 
            style={{ fontFamily: 'Futura, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}
          >
            Settings
          </h1>
          <p className="text-gray-600 text-sm">
            Manage your notifications and classrooms
          </p>
        </div>

        {/* Settings Content */}
        <div className="flex-1 px-2 sm:px-6 pb-6">
          <div className="max-w-4xl">
            {/* Email Notifications Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-8 mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl text-black mb-4 sm:mb-6" style={{ fontFamily: 'Futura, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
                Notifications
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div>
                  <p className="text-gray-900 font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive updates via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* School & Classroom Section */}
            {/* School/Classroom Section - Only for Students */}
            {userInfo?.role === 'student' && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-8 mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl text-black mb-4 sm:mb-6" style={{ fontFamily: 'Futura, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
                  My Classrooms
                </h3>
                
                {/* Join Classroom */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Join a Classroom</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={classCodeInput}
                      onChange={(e) => setClassCodeInput(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && handleJoinClassroom()}
                      className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 uppercase"
                      placeholder="Enter 6-character code (e.g., ABC123)"
                      maxLength={6}
                      disabled={isJoining}
                    />
                    <button
                      onClick={handleJoinClassroom}
                      disabled={isJoining || !classCodeInput.trim()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {isJoining ? 'Joining...' : 'Join'}
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Ask your teacher for the classroom code</p>
                  
                  {/* Join Message */}
                  {joinMessage.text && (
                    <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${
                      joinMessage.type === 'success' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {joinMessage.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium">{joinMessage.text}</span>
                    </div>
                  )}
                </div>

                {/* Joined Classrooms List */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Enrolled Classrooms</h4>
                  {!joinedClassrooms || joinedClassrooms.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-1">Not enrolled in any classrooms yet</p>
                      <p className="text-sm text-gray-500">Enter a classroom code above to join</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {joinedClassrooms.map((classroom) => (
                        <div key={classroom.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900 mb-1">{classroom.name}</h5>
                              {classroom.description && (
                                <p className="text-sm text-gray-600 mb-2">{classroom.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="font-mono font-semibold text-blue-600">{classroom.code}</span>
                                <span>•</span>
                                <span>{classroom.teacherName}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
