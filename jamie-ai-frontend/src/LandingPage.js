import React, { useState } from 'react';
import SignUpPage from './SignUpPage';

const LandingPage = ({ onLogin }) => {
  const [showSignUp, setShowSignUp] = useState(false);
  const handleAssessmentStart = () => {
    // Start assessment mode directly
    onLogin({ gameMode: 'assessment' });
  };

  const handleSignUp = (signUpData) => {
    // For demo purposes, we'll just call onLogin with the sign up data
    onLogin(signUpData);
  };

  const handleBackToLogin = () => {
    setShowSignUp(false);
  };

  // Show sign up page if user clicked sign up
  if (showSignUp) {
    return <SignUpPage onSignUp={handleSignUp} onBackToLogin={handleBackToLogin} />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with Logo */}
      <div className="p-[35px]">
        <div className="text-black font-bold text-[25px] leading-[28px]">
          <div>Decision</div>
          <div>Coach</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-4">
        <div className="w-full max-w-sm">
          {/* Welcome Heading */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-black mb-3">
              Welcome back!
            </h1>
            <p className="text-gray-600 text-sm">
              Practice coaching skills and help others navigate important life decisions with confidence.
            </p>
          </div>

          {/* Assessment Button */}
          <button
            onClick={handleAssessmentStart}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium text-lg"
          >
            Start Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
