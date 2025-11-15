import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase';
import { supabaseAuthService } from './services/SupabaseAuthService';

const parseHashParams = () => {
  if (typeof window === 'undefined') return {};
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;
  const params = new URLSearchParams(hash);
  return {
    access_token: params.get('access_token'),
    refresh_token: params.get('refresh_token'),
    type: params.get('type'),
  };
};

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [sessionReady, setSessionReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const hashParams = useMemo(parseHashParams, []);

  useEffect(() => {
    let isMounted = true;
    const ensureSession = async () => {
      try {
        if (hashParams.access_token && hashParams.refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token: hashParams.access_token,
            refresh_token: hashParams.refresh_token,
          });
          if (error) {
            throw error;
          }
          const cleanUrl = `${window.location.origin}/reset-password`;
          window.history.replaceState({}, document.title, cleanUrl);
        }
        const { data } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (!data.session) {
          setStatus({
            state: 'error',
            message:
              'Invalid or expired reset link. Please request a new password reset email.',
          });
        }
        setSessionReady(true);
      } catch (error) {
        if (!isMounted) return;
        setStatus({
          state: 'error',
          message: error.message || 'Failed to validate reset link.',
        });
      }
    };
    ensureSession();
    return () => {
      isMounted = false;
    };
  }, [hashParams.access_token, hashParams.refresh_token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sessionReady) return;
    if (!password || password.length < 8) {
      setStatus({
        state: 'error',
        message: 'Password must be at least 8 characters long.',
      });
      return;
    }
    if (password !== confirmPassword) {
      setStatus({
        state: 'error',
        message: 'Passwords do not match.',
      });
      return;
    }
    setStatus({ state: 'loading', message: 'Updating password...' });
    const result = await supabaseAuthService.updatePassword(password);
    if (result.success) {
      setStatus({
        state: 'success',
        message: 'Password updated! Redirecting to login...',
      });
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } else {
      setStatus({
        state: 'error',
        message: result.error || 'Failed to update password.',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#eef2ff] to-[#dbeafe] px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-blue-100">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold text-[#1f2937] mb-2">
            Reset Password
          </h1>
          <p className="text-[#6b7280]">
            {sessionReady
              ? 'Set a new password for your account.'
              : 'Validating your reset link...'}
          </p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                placeholder="••••••••"
                disabled={!sessionReady || status.state === 'loading'}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-4 flex items-center text-sm text-blue-500"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={!sessionReady || status.state === 'loading'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                placeholder="••••••••"
                disabled={!sessionReady || status.state === 'loading'}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-4 flex items-center text-sm text-blue-500"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                disabled={!sessionReady || status.state === 'loading'}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          {status.state === 'error' && (
            <p className="text-sm text-red-500">{status.message}</p>
          )}
          {status.state === 'success' && (
            <p className="text-sm text-green-600">{status.message}</p>
          )}
          <button
            type="submit"
            className="w-full bg-[#2c73eb] text-white py-3 rounded-2xl font-semibold shadow-lg hover:bg-[#1f4fd1] transition disabled:opacity-50"
            disabled={!sessionReady || status.state === 'loading'}
          >
            {status.state === 'loading' ? 'Updating...' : 'Update Password'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => (window.location.href = '/')}
            className="text-sm text-blue-600 hover:underline"
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;


