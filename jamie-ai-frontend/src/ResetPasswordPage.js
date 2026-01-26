import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase';
import { supabaseAuthService } from './services/SupabaseAuthService';

const parseUrlParams = () => {
  if (typeof window === 'undefined') return {};
  
  // Check query parameters first (Supabase typically uses these)
  const queryParams = new URLSearchParams(window.location.search);
  
  // Also check hash parameters (fallback)
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;
  const hashParams = new URLSearchParams(hash);
  
  // Return params from query string first, then hash as fallback
  return {
    access_token: queryParams.get('access_token') || hashParams.get('access_token'),
    refresh_token: queryParams.get('refresh_token') || hashParams.get('refresh_token'),
    type: queryParams.get('type') || hashParams.get('type'),
  };
};

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [sessionReady, setSessionReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const urlParams = useMemo(parseUrlParams, []);

  useEffect(() => {
    let isMounted = true;
    const ensureSession = async () => {
      try {
        // First, try to set session from URL parameters if they exist
        if (urlParams.access_token && urlParams.refresh_token) {
          console.log('Setting session from URL parameters');
          const { error } = await supabase.auth.setSession({
            access_token: urlParams.access_token,
            refresh_token: urlParams.refresh_token,
          });
          if (error) {
            console.error('Error setting session from URL params:', error);
            throw error;
          }
          // Clean up URL after setting session
          const cleanUrl = `${window.location.origin}/reset-password`;
          window.history.replaceState({}, document.title, cleanUrl);
        }
        
        // Wait a moment for Supabase's automatic session detection to work
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if session exists (either from manual setSession or automatic detection)
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setStatus({
            state: 'error',
            message: 'Failed to validate reset link. ' + (sessionError.message || ''),
          });
          return;
        }
        
        if (!data || !data.session) {
          console.warn('No session found after setting from URL params');
          setStatus({
            state: 'error',
            message:
              'This reset link has expired. Request a new email from the login page.',
          });
          return;
        }
        
        console.log('Session validated successfully');
        setSessionReady(true);
      } catch (error) {
        if (!isMounted) return;
        console.error('Error in ensureSession:', error);
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
  }, [urlParams.access_token, urlParams.refresh_token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sessionReady) return;
    if (!password || password.length < 8) {
      setStatus({
        state: 'error',
        message: 'Password must be at least 8 characters.',
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
    setStatus({ state: 'loading', message: 'Updating password…' });
    const result = await supabaseAuthService.updatePassword(password);
    if (result.success) {
      setStatus({
        state: 'success',
        message: 'Password updated! Redirecting to login…',
      });
      setTimeout(() => {
        window.location.href = '/';
      }, 1800);
    } else {
      setStatus({
        state: 'error',
        message: result.error || 'Failed to update password.',
      });
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] bg-[#C7D2FE] blur-[160px]" />
        <div className="absolute -bottom-32 -left-16 w-[380px] h-[380px] bg-[#DBEAFE] blur-[160px]" />
      </div>

      <header className="relative z-10 px-6 sm:px-12 py-6 flex items-center justify-between">
        <div className="text-[#111827] font-bold text-2xl leading-6">
          <div>Decision</div>
          <div>Coach</div>
        </div>
        <button
          type="button"
          onClick={() => (window.location.href = '/')}
          className="text-sm font-semibold text-[#2C73EB] hover:text-[#1f4fd1] transition"
        >
          Back to login
        </button>
      </header>

      <main className="relative z-10 flex-1 px-6 sm:px-12 pb-16 flex items-stretch">
        <div className="w-full max-w-6xl mx-auto grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6 sm:space-y-8">
            <p className="uppercase text-[11px] tracking-[0.35em] text-[#9CA3AF]">
              Password reset
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-semibold text-[#0F172A] leading-tight">
              Regain access to your Decision Coach sessions
            </h1>
            <p className="text-base sm:text-lg text-[#475467] leading-relaxed">
              We use the same clean, calm space you see across Decision Coach so
              nothing feels out of place. Set a brand-new password in seconds,
              then jump right back into guiding your students.
            </p>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[28px] p-6 sm:p-8 space-y-3 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
              <p className="text-sm font-semibold text-[#0F172A]">
                Need a fresh link?
              </p>
              <p className="text-sm text-[#475467] leading-relaxed">
                If this link expired, request another reset email from the login
                page. Still stuck? Email{' '}
                <a
                  className="text-[#2C73EB] font-medium hover:text-[#1f4fd1]"
                  href="mailto:support@decisioncoach.io"
                >
                  support@decisioncoach.io
                </a>
                .
              </p>
            </div>
          </section>

          <section className="bg-white/90 backdrop-blur-2xl border border-[#E5E7EB] rounded-[32px] p-8 sm:p-10 shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
            <header className="mb-6">
              <h2 className="text-2xl font-semibold text-[#0F172A]">
                {sessionReady ? 'Create a new password' : 'Validating link'}
              </h2>
              <p className="text-sm text-[#6B7280] mt-2 leading-relaxed">
                {sessionReady
                  ? 'Use at least 8 characters and avoid passwords you reuse elsewhere.'
                  : 'We’re confirming the secure link you used to get here.'}
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#C7D2FE] focus:border-[#2C73EB] transition disabled:opacity-60"
                    placeholder="••••••••"
                    disabled={!sessionReady || status.state === 'loading'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-4 text-xs font-semibold text-[#2C73EB]"
                    disabled={!sessionReady || status.state === 'loading'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-1.5">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#C7D2FE] focus:border-[#2C73EB] transition disabled:opacity-60"
                    placeholder="••••••••"
                    disabled={!sessionReady || status.state === 'loading'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-4 text-xs font-semibold text-[#2C73EB]"
                    disabled={!sessionReady || status.state === 'loading'}
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {status.state !== 'idle' && (
                <div
                  className={`text-sm rounded-2xl px-4 py-3 ${
                    status.state === 'error'
                      ? 'bg-[#FEF2F2] text-[#B91C1C]'
                      : 'bg-[#ECFDF5] text-[#047857]'
                  }`}
                >
                  {status.message}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#2C73EB] text-white py-3 rounded-2xl font-semibold shadow-lg shadow-blue-200 hover:bg-[#1F4FD1] transition disabled:opacity-50"
                disabled={!sessionReady || status.state === 'loading'}
              >
                {status.state === 'loading' ? 'Updating…' : 'Update password'}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-[#94A3B8]">
              Don’t need to reset anymore?{' '}
              <button
                type="button"
                onClick={() => (window.location.href = '/')}
                className="text-[#2C73EB] font-semibold hover:text-[#1F4FD1]"
              >
                Return to login
              </button>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ResetPasswordPage;


