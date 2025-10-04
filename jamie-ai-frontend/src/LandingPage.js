import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const LandingPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [gameMode, setGameMode] = useState('game'); // 'game' or 'assessment'

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // For now, we'll just call onLogin with the form data
    // In a real app, this would authenticate with a backend
    onLogin({ ...formData, gameMode });
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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with Logo */}
      <div className="p-6">
        <div className="text-black font-bold text-2xl">
          <div>Decision</div>
          <div>Coach</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Welcome Heading */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black mb-4">
              Welcome back!
            </h1>
            <p className="text-gray-600 text-base">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            </p>
          </div>

          {/* Mode Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGameMode('game')}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  gameMode === 'game' 
                    ? 'border-blue-600 bg-blue-50 text-blue-600' 
                    : 'border-gray-300 bg-gray-50 text-gray-600 hover:border-gray-400'
                }`}
              >
                <div className="text-sm font-semibold">Game</div>
                <div className="text-xs text-gray-500 mt-1">With progress tracking</div>
              </button>
              <button
                type="button"
                onClick={() => setGameMode('assessment')}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  gameMode === 'assessment' 
                    ? 'border-blue-600 bg-blue-50 text-blue-600' 
                    : 'border-gray-300 bg-gray-50 text-gray-600 hover:border-gray-400'
                }`}
              >
                <div className="text-sm font-semibold">Assessment</div>
                <div className="text-xs text-gray-500 mt-1">Clean evaluation mode</div>
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Your name"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-10 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="email@example.com"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
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
                  onClick={() => {
                    // For now, we'll just proceed with login
                    // In a real app, this would navigate to signup
                    onLogin({ email: 'demo@example.com', password: 'demo' });
                  }}
                >
                  Sign up
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
