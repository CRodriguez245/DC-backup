import React, { useState } from 'react';
import { Eye, EyeOff, GraduationCap, Users } from 'lucide-react';
import { authService } from './services/AuthService.js';
import { supabaseAuthService } from './services/SupabaseAuthService.js';

const SignUpPage = ({ onSignUp, onBackToLogin }) => {
  // Feature flag to use Supabase authentication
  const USE_SUPABASE_AUTH = true; // Re-enable Supabase authentication
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const gameMode = 'game';
  const [requiresEmailConfirmation, setRequiresEmailConfirmation] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.userType) {
      newErrors.userType = 'Please select your role';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Use authentication service for signup
    const userData = {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      role: formData.userType,
      password: formData.password
    };
    
    try {
      let result;
      
      if (USE_SUPABASE_AUTH) {
        // Use Supabase authentication
        result = await supabaseAuthService.register(userData);
      } else {
        // Use original authentication service
        result = await authService.register(userData);
      }
      
      if (result.success) {
        // Check if email confirmation is required
        if (result.requiresEmailConfirmation) {
          // Show email confirmation message instead of logging in
          setRequiresEmailConfirmation(true);
          setConfirmationEmail(result.email);
          // Don't call onSignUp - stay on signup page to show confirmation message
        } else {
          // No email confirmation required - proceed with normal signup flow
          onSignUp({ ...formData, gameMode, user: result.user });
        }
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'Registration failed. Please try again.' });
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

  // If email confirmation is required, show confirmation message instead of form
  if (requiresEmailConfirmation) {
    return (
      <div className="space-y-6">
        <div className="p-6 bg-blue-50/50 border border-blue-200 rounded-2xl backdrop-blur-sm">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Check Your Email</h3>
            <p className="text-gray-600">
              We've sent a confirmation email to <strong>{confirmationEmail}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Please click the confirmation link in the email to activate your account. 
              Once confirmed, you can sign in to access your account.
            </p>
          </div>
        </div>
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setRequiresEmailConfirmation(false);
              setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                confirmPassword: '',
                userType: ''
              });
              onBackToLogin();
            }}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* General Error Message */}
      {errors.general && (
        <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl backdrop-blur-sm">
          <p className="text-sm text-red-600 font-medium text-center">{errors.general}</p>
        </div>
      )}
      
      {/* User Type Field */}
      <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 sm:text-base">
                I am a
              </label>
              <div className="flex gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, userType: 'student' }))}
                  className={`flex-1 py-3 px-4 rounded-lg border transition-colors font-medium flex items-center justify-center gap-2 sm:py-4 sm:text-base ${
                    formData.userType === 'student'
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <GraduationCap size={18} />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, userType: 'teacher' }))}
                  className={`flex-1 py-3 px-4 rounded-lg border transition-colors font-medium flex items-center justify-center gap-2 sm:py-4 sm:text-base ${
                    formData.userType === 'teacher'
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <Users size={18} />
                  Teacher
                </button>
              </div>
              {errors.userType && (
                <p className="mt-1.5 text-xs text-red-600 font-medium sm:text-sm">{errors.userType}</p>
              )}
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2 sm:text-base">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors sm:px-4 sm:py-3 sm:text-base ${
                    errors.firstName ? 'border-red-300 bg-red-50/30' : 'border-gray-300'
                  }`}
                  placeholder="First name"
                />
                {errors.firstName && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium sm:text-sm">{errors.firstName}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2 sm:text-base">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors sm:px-4 sm:py-3 sm:text-base ${
                    errors.lastName ? 'border-red-300 bg-red-50/30' : 'border-gray-300'
                  }`}
                  placeholder="Last name"
                />
                {errors.lastName && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium sm:text-sm">{errors.lastName}</p>
                )}
              </div>
            </div>

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
                placeholder="your.email@example.com"
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
                  placeholder="Create a password"
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

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 sm:text-base">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-10 sm:px-4 sm:py-3 sm:text-base ${
                    errors.confirmPassword ? 'border-red-300 bg-red-50/30' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 sm:right-4"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-600 font-medium sm:text-sm">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium sm:py-3 sm:text-base"
            >
              Create Account
            </button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  onClick={onBackToLogin}
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
  );
};

export default SignUpPage;
