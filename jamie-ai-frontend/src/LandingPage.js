import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import SignUpPage from './SignUpPage';
import { supabaseAuthService } from './services/SupabaseAuthService.js';

const LandingPage = ({ onLogin, onSignUp }) => {
  console.log('LandingPage rendered with onLogin:', typeof onLogin);
  console.log('LandingPage props:', { onLogin: !!onLogin, onSignUp: !!onSignUp });
  
  // Feature flag to use Supabase authentication
  const USE_SUPABASE_AUTH = true; // Re-enable Supabase authentication
  
  const [showSignUp, setShowSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [taglineText, setTaglineText] = useState('');
  const [isTaglineTyping, setIsTaglineTyping] = useState(true);


  const handleSubmit = async (e) => {
    console.log('Form submitted!', e);
    e.preventDefault();
    console.log('Form data:', formData);
    
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    console.log('Validation errors:', newErrors);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      let result;
      
      if (USE_SUPABASE_AUTH) {
        // Use Supabase authentication but still call onLogin to update React state
        console.log('Attempting Supabase login with:', formData.email);
        result = await supabaseAuthService.login({ ...formData, gameMode: 'assessment' });
        console.log('Supabase login result:', result);
        
        // If login was successful, call onLogin to update the parent component state
        if (result && result.success) {
          console.log('Supabase login successful, calling onLogin to update state');
          const onLoginResult = await onLogin({ ...formData, gameMode: 'assessment' });
          console.log('onLogin result:', onLoginResult);
        } else {
          console.log('Supabase login failed:', result);
        }
      } else {
        // Use original authentication service
        result = await onLogin({ ...formData, gameMode: 'assessment' });
      }
      
      if (result && !result.success) {
        setErrors({ general: result.error || result.message });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Login failed. Please try again.' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBackToLogin = () => {
    setShowSignUp(false);
  };

  const handleSignUp = async (signupData) => {
    // Handle successful signup - the authService already saved the user
    // Now we need to call onLogin to transition to the app
    const result = await onLogin({ 
      email: signupData.email, 
      password: signupData.password, 
      gameMode: signupData.gameMode 
    });
    
    if (result && !result.success) {
      setErrors({ general: result.message });
    }
  };

  // Tagline typing animation
  useEffect(() => {
    const fullText = "Decide with confidence.";
    let index = 0;
    
    // Initial delay before starting typing
    const startDelay = setTimeout(() => {
      const typingInterval = setInterval(() => {
        if (index <= fullText.length) {
          setTaglineText(fullText.slice(0, index));
          index++;
        } else {
          setIsTaglineTyping(false);
          clearInterval(typingInterval);
        }
      }, 80); // 80ms delay between characters for smoother typing
      
      // Store interval to clear on cleanup
      return () => clearInterval(typingInterval);
    }, 500); // Wait 500ms before starting

    return () => clearTimeout(startDelay);
  }, []);

  return (
    <div className="min-h-screen bg-transparent flex flex-col relative" style={{ animation: 'pageFadeIn 0.6s ease-out' }}>
      <style>{`
        @keyframes pageFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out;
        }
        @keyframes blink {
          0%, 49% {
            opacity: 1;
          }
          50%, 100% {
            opacity: 0;
          }
        }
        .typing-cursor {
          animation: blink 1s infinite;
          display: inline-block;
          width: 2px;
          height: 1em;
          background-color: currentColor;
          margin-left: 2px;
          vertical-align: middle;
        }
      `}</style>
      
      {/* Header with Logo */}
      <div className="px-6 py-4 relative z-20 sm:px-8 sm:py-8">
        <div className="text-black font-bold text-[25px] leading-[28px] sm:text-2xl">
          <div>Decision</div>
          <div>Coach</div>
        </div>
      </div>


      {/* Page Content */}
      <div className="flex-1 flex items-start px-6 py-4 relative z-10 sm:px-8 sm:py-6">
        <div className="w-full max-w-sm mt-8 sm:ml-0 sm:mt-8 sm:max-w-md">
          {/* Welcome Heading */}
          <div className="mb-6 sm:mb-8">
            <h1 
              className="text-3xl text-black mb-3 transition-all duration-300 ease-in-out sm:text-4xl sm:mb-4" 
              style={{ fontFamily: 'Futura, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}
            >
              {showSignUp ? 'Create Account' : 'Welcome back!'}
            </h1>
            <p className="text-gray-600 text-sm transition-all duration-300 ease-in-out sm:text-base sm:leading-relaxed">
              {showSignUp 
                ? 'Join Decision Coach to practice coaching skills and help others make informed life decisions.'
                : 'Practice coaching skills and help others navigate important life decisions with confidence.'
              }
            </p>
          </div>

          {/* Form Container with Transition */}
          <div className="transition-all duration-500 ease-in-out">
            {showSignUp ? (
              <div 
                key="signup"
                className="animate-fadeInUp"
              >
                <SignUpPage onSignUp={handleSignUp} onBackToLogin={handleBackToLogin} />
              </div>
            ) : (
              <div 
                key="login"
                className="animate-fadeInUp"
              >
                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* General Error Message */}
                  {errors.general && (
                    <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl backdrop-blur-sm">
                      <p className="text-sm text-red-600 font-medium text-center">{errors.general}</p>
                    </div>
                  )}
                  
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 sm:text-base">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors sm:px-4 sm:py-3 sm:text-base ${
                        errors.email ? 'border-red-300 bg-red-50/30' : 'border-gray-300'
                      }`}
                      placeholder="email@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-xs text-red-600 font-medium sm:text-sm">{errors.email}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 sm:text-base">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-10 sm:px-4 sm:py-3 sm:text-base ${
                          errors.password ? 'border-red-300 bg-red-50/30' : 'border-gray-300'
                        }`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 sm:right-4"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1.5 text-xs text-red-600 font-medium sm:text-sm">{errors.password}</p>
                    )}
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium sm:py-3 sm:text-base"
                  >
                    Log in
                  </button>

                  {/* Sign Up Link */}
                  <div className="text-center">
                    <p className="text-gray-600">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                        onClick={() => setShowSignUp(true)}
                      >
                        Sign up
                      </button>
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tagline - Bottom Right */}
      <div className="fixed bottom-8 right-8 z-20 hidden sm:block">
        <p 
          className="text-2xl text-gray-700 font-light inline-flex items-center"
          style={{ fontFamily: 'Futura, -apple-system, BlinkMacSystemFont, sans-serif' }}
        >
          <span>{taglineText}</span>
          {isTaglineTyping && <span className="typing-cursor"></span>}
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
