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
  
  // Supabase password reset links can use different formats:
  // 1. ?access_token=...&refresh_token=...&type=recovery
  // 2. ?token=...&type=recovery (older format)
  // 3. #access_token=...&refresh_token=... (hash format)
  
  return {
    access_token: queryParams.get('access_token') || hashParams.get('access_token'),
    refresh_token: queryParams.get('refresh_token') || hashParams.get('refresh_token'),
    token: queryParams.get('token') || hashParams.get('token'), // Alternative format
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
    let authStateSubscription = null;
    
    const ensureSession = async () => {
      try {
        // Log URL for debugging
        console.log('ResetPasswordPage: Current URL:', window.location.href);
        console.log('ResetPasswordPage: Query params:', window.location.search);
        console.log('ResetPasswordPage: Hash:', window.location.hash);
        console.log('ResetPasswordPage: Parsed URL params:', urlParams);
        
        // With detectSessionInUrl: true, Supabase should automatically detect session from URL
        // But we can also manually set it if we have the tokens
        if (urlParams.access_token && urlParams.refresh_token) {
          console.log('ResetPasswordPage: Manually setting session from URL parameters');
          const { data: sessionData, error } = await supabase.auth.setSession({
            access_token: urlParams.access_token,
            refresh_token: urlParams.refresh_token,
          });
          if (error) {
            console.error('ResetPasswordPage: Error setting session from URL params:', error);
            // Don't throw - let Supabase's automatic detection try
          } else {
            console.log('ResetPasswordPage: Successfully set session manually');
            // Clean up URL after setting session
            const cleanUrl = `${window.location.origin}/reset-password`;
            window.history.replaceState({}, document.title, cleanUrl);
          }
        }
        
        // Listen for auth state changes (Supabase will trigger this when it detects session from URL)
        authStateSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('ResetPasswordPage: Auth state changed:', { event, hasSession: !!session });
          
          if (!isMounted) return;
          
          if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
            if (session) {
              console.log('ResetPasswordPage: Session detected from auth state change');
              setSessionReady(true);
              // Clean up URL
              const cleanUrl = `${window.location.origin}/reset-password`;
              window.history.replaceState({}, document.title, cleanUrl);
            }
          }
        });
        
        // Also check immediately (in case session was already set)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        console.log('ResetPasswordPage: Session check result:', { 
          hasSession: !!data?.session, 
          sessionError,
          sessionUserId: data?.session?.user?.id 
        });
        
        if (!isMounted) return;
        
        if (data?.session) {
          console.log('ResetPasswordPage: Session found immediately');
          setSessionReady(true);
          // Clean up URL
          const cleanUrl = `${window.location.origin}/reset-password`;
          window.history.replaceState({}, document.title, cleanUrl);
          return;
        }
        
        // If no session after 1 second, check again after a longer wait
        setTimeout(async () => {
          if (!isMounted) return;
          
          const { data: retryData, error: retryError } = await supabase.auth.getSession();
          
          if (retryData?.session) {
            console.log('ResetPasswordPage: Session found on retry');
            setSessionReady(true);
            const cleanUrl = `${window.location.origin}/reset-password`;
            window.history.replaceState({}, document.title, cleanUrl);
          } else if (!retryData?.session && !retryError) {
            console.warn('ResetPasswordPage: No session found after retry. URL params:', urlParams);
            console.warn('ResetPasswordPage: Full URL:', window.location.href);
            
            // Check if there are any auth-related params in the URL that we might have missed
            const allParams = new URLSearchParams(window.location.search);
            const allHashParams = new URLSearchParams(window.location.hash.slice(1));
            console.log('ResetPasswordPage: All query params:', Array.from(allParams.entries()));
            console.log('ResetPasswordPage: All hash params:', Array.from(allHashParams.entries()));
            
            setStatus({
              state: 'error',
              message:
                'This reset link has expired. Request a new email from the login page.',
            });
          }
        }, 2000);
        
      } catch (error) {
        if (!isMounted) return;
        console.error('ResetPasswordPage: Error in ensureSession:', error);
        setStatus({
          state: 'error',
          message: error.message || 'Failed to validate reset link.',
        });
      }
    };
    
    ensureSession();
    
    return () => {
      isMounted = false;
      if (authStateSubscription) {
        authStateSubscription.data?.subscription?.unsubscribe();
      }
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


