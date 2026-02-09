'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/toast-provider';

const Signup: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signup, loginWithProvider, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match', {
        description: 'Please make sure your passwords match.',
      });
      return;
    }

    if (password.length < 8) {
      toast.error('Password too short', {
        description: 'Password must be at least 8 characters.',
      });
      return;
    }

    try {
      await signup(email, password);
      toast.success('Account created!', {
        description: 'Welcome to AI CodeMate.',
      });
    } catch (error) {
      toast.error('Signup failed', {
        description: 'Please try again later.',
      });
    }
  };

  const handleOAuthSignup = async (provider: 'google' | 'github') => {
    try {
      await loginWithProvider(provider);
      toast.success(`Signed up with ${provider}!`);
    } catch (error) {
      toast.error(`${provider} signup failed`, {
        description: 'Please try again later.',
      });
    }
  };

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length > 7) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(password);

  const getStrengthColor = (s: number) => {
    if (s <= 2) return 'bg-red-500 text-red-500';
    if (s === 3) return 'bg-amber-500 text-amber-500';
    return 'bg-emerald-500 text-emerald-500';
  };

  const getStrengthText = (s: number) => {
    if (s <= 2) return 'Weak';
    if (s === 3) return 'Medium';
    return 'Strong';
  };

  const strengthColorClass = getStrengthColor(strength);
  const barColorClass = strengthColorClass.split(' ')[0];
  const textColorClass = strengthColorClass.split(' ')[1];

  return (
    <div className="bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-slate-50 antialiased min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Blobs */}
      <div
        className="absolute top-[-20%] right-[20%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse"
        style={{ animationDuration: '4s' }}
      ></div>
      <div className="absolute bottom-[-20%] left-[10%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <header className="w-full border-b border-transparent p-6 z-50">
        <div className="layout-container flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="size-8 text-primary flex items-center justify-center bg-primary/10 rounded-md">
              <span className="material-symbols-outlined !text-[24px]">terminal</span>
            </div>
            <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
              AI CodeMate
            </h2>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 z-10">
        <div className="w-full max-w-[440px]">
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl shadow-2xl p-8 md:p-10">
            <div className="text-center mb-8 animate-fade-in-up">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Create Account
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Join the ecosystem to start building
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 animate-fade-in-up delay-100">
              <button
                onClick={() => handleOAuthSignup('google')}
                disabled={loading}
                className="flex items-center justify-center gap-2 h-11 px-4 rounded-lg border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-hover hover:bg-slate-50 dark:hover:bg-[#1f3528] text-slate-700 dark:text-slate-200 transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="size-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  ></path>
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  ></path>
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  ></path>
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  ></path>
                </svg>
                Google
              </button>
              <button
                onClick={() => handleOAuthSignup('github')}
                disabled={loading}
                className="flex items-center justify-center gap-2 h-11 px-4 rounded-lg border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-hover hover:bg-slate-50 dark:hover:bg-[#1f3528] text-slate-700 dark:text-slate-200 transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="size-5 dark:fill-white fill-slate-900"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                </svg>
                GitHub
              </button>
            </div>

            <div className="relative mb-6 animate-fade-in-up delay-150">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-border-dark"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-surface-dark px-2 text-slate-500 dark:text-slate-400">
                  Or sign up with email
                </span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2 animate-fade-in-up delay-200">
                <label
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  htmlFor="email"
                >
                  Email address
                </label>
                <input
                  className="w-full h-11 px-4 rounded-lg bg-slate-50 dark:bg-input-bg border border-slate-200 dark:border-border-dark text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                  id="email"
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2 animate-fade-in-up delay-300">
                <label
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    className="w-full h-11 px-4 pr-10 rounded-lg bg-slate-50 dark:bg-input-bg border border-slate-200 dark:border-border-dark text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                    id="password"
                    placeholder="••••••••"
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center justify-center"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1 h-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-full w-full rounded-full transition-colors duration-300 ${
                            i < strength ? barColorClass : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <p
                      className={`text-xs text-right font-medium transition-colors duration-300 ${textColorClass}`}
                    >
                      {getStrengthText(strength)}
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-2 animate-fade-in-up delay-400">
                <label
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  htmlFor="confirm-password"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    className={`w-full h-11 px-4 pr-10 rounded-lg bg-slate-50 dark:bg-input-bg border text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 transition-all outline-none ${
                      confirmPassword && confirmPassword !== password
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-slate-200 dark:border-border-dark focus:border-primary focus:ring-primary'
                    }`}
                    id="confirm-password"
                    placeholder="••••••••"
                    required
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center justify-center"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showConfirmPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              <button
                className={`w-full h-11 rounded-lg bg-primary text-primary-foreground font-bold text-base shadow-lg shadow-primary/20 transition-all duration-200 flex items-center justify-center mt-2 animate-fade-in-up delay-500 ${
                  loading
                    ? 'opacity-70 cursor-not-allowed'
                    : 'hover:bg-primary-dark hover:shadow-primary/30 hover:translate-y-[-1px]'
                }`}
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-primary-foreground"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  'Sign Up'
                )}
              </button>

              <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400 animate-fade-in-up delay-600">
                Already have an account?
                <Link
                  href="/login"
                  className="text-primary hover:text-primary-dark font-semibold ml-1 transition-colors"
                >
                  Log in
                </Link>
              </div>
            </form>

            <div className="mt-6 text-center animate-fade-in-up delay-700">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-primary hover:underline">
                  Terms
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center z-10">
        <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
          <a href="#" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">
            Docs
          </a>
          <a href="#" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">
            Contact
          </a>
        </div>
        <p className="mt-4 text-xs text-slate-600 dark:text-slate-500">© 2024 AI CodeMate Inc.</p>
      </footer>
    </div>
  );
};

export default Signup;
