import React, { useState, useEffect, useCallback } from 'react';
import { Home, Settings, LogOut, BarChart3, Users, CheckCircle, X } from 'lucide-react';
import { supabaseAuthService as authService } from './services/SupabaseAuthService.js';

const SettingsPage = ({ onBackToHome, onLogout, onAdminClick, currentView, userInfo }) => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    assessment: true,
    weekly: true
  });

  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'America/Chicago'
  });

  const [privacy, setPrivacy] = useState({
    profile: 'public',
    analytics: true,
    dataSharing: false
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
    <div className="h-screen bg-white flex overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-80 bg-white flex flex-col flex-shrink-0 border-r border-gray-100">
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

      {/* Right Main Content */}
      <div className="flex-1 flex flex-col pt-16 pl-8 overflow-y-auto">
        {/* Header */}
        <div className="p-6">
          <h1 
            className="text-3xl text-black mb-2" 
            style={{ fontFamily: 'Futura, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}
          >
            Settings
          </h1>
          <p className="text-gray-600 text-sm">
            Manage your preferences and account settings
          </p>
        </div>

        {/* Settings Content */}
        <div className="flex-1 px-6 pb-6">
          <div className="max-w-4xl">
            {/* Notifications Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
              <h3 className="text-xl text-black mb-6" style={{ fontFamily: 'Futura, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
                Notifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
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
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-600">Get notified in real-time</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.push}
                      onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 font-medium">Assessment Reminders</p>
                    <p className="text-sm text-gray-600">Reminders for upcoming assessments</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.assessment}
                      onChange={(e) => setNotifications({...notifications, assessment: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* School & Classroom Section */}
            {/* School/Classroom Section - Only for Students */}
            {userInfo?.role === 'student' && (
              <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
                <h3 className="text-xl text-black mb-6" style={{ fontFamily: 'Futura, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
                  My Classrooms
                </h3>
                
                {/* Join Classroom */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Join a Classroom</label>
                  <div className="flex gap-3">
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

            {/* Preferences Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
              <h3 className="text-xl text-black mb-6" style={{ fontFamily: 'Futura, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
                Preferences
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <select 
                    value={preferences.theme}
                    onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors text-gray-900 appearance-none cursor-pointer"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select 
                    value={preferences.language}
                    onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors text-gray-900 appearance-none cursor-pointer"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select 
                    value={preferences.timezone}
                    onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors text-gray-900 appearance-none cursor-pointer"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                  >
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Privacy Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
              <h3 className="text-xl text-black mb-6" style={{ fontFamily: 'Futura, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
                Privacy & Security
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
                  <select 
                    value={privacy.profile}
                    onChange={(e) => setPrivacy({...privacy, profile: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors text-gray-900 appearance-none cursor-pointer"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="friends">Friends Only</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 font-medium">Analytics</p>
                    <p className="text-sm text-gray-600">Help improve the platform</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacy.analytics}
                      onChange={(e) => setPrivacy({...privacy, analytics: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 font-medium">Data Sharing</p>
                    <p className="text-sm text-gray-600">Share anonymized data for research</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacy.dataSharing}
                      onChange={(e) => setPrivacy({...privacy, dataSharing: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
