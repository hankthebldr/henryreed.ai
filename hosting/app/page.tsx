'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { ThemeProvider } from '../providers/ThemeProvider';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, user, loading } = useAuth();
  const router = useRouter();

  // If already authenticated, redirect to GUI
  useEffect(() => {
    if (user && !loading) {
      router.push('/gui');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await signIn(username, password);
      // The useEffect hook will handle navigation after successful login
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed. Please try again.');
      setPassword('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e as any);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cortex-bg-secondary via-cortex-bg-primary to-cortex-bg-secondary flex items-center justify-center">
        <div className="bg-cortex-bg-tertiary/80 backdrop-blur-xl border border-cortex-border-secondary rounded-2xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cortex-border-muted border-t-cortex-accent mx-auto mb-6"></div>
          <div className="text-cortex-text-primary text-xl font-semibold mb-2">Authenticating</div>
          <div className="text-cortex-text-muted text-sm">Verifying your credentials...</div>
          <div className="mt-6 w-48 bg-cortex-bg-quaternary rounded-full h-2 mx-auto">
            <div className="bg-cortex-accent h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cortex-bg-secondary via-cortex-bg-primary to-cortex-bg-secondary relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cortex-accent/10 via-transparent to-cortex-success/10" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,204,102,0.15) 1px, transparent 0)`,
            backgroundSize: '30px 30px'
          }}></div>
        </div>
      </div>
      
      {/* Header Bar */}
      <div className="relative z-10 bg-cortex-bg-primary/20 backdrop-blur-sm border-b border-cortex-border-secondary/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gradient-to-r from-cortex-primary to-cortex-primary-light rounded-lg flex items-center justify-center shadow-lg shadow-cortex-primary/25">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 2L3 6v6c0 5.5 4 10 9 12 5-2 9-6.5 9-12V6l-9-4z" fill="currentColor"/>
                  <circle cx="12" cy="10" r="2.5" fill="#000000" opacity="0.8"/>
                  <path d="M10.5 10l1 1L14 8.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                </svg>
              </div>
              <div>
                <h1 className="text-cortex-text-primary font-bold text-lg">Cortex Domain Consultant Platform</h1>
                <p className="text-cortex-text-muted text-xs">Professional Services Portal</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cortex-success rounded-full animate-pulse"></div>
                <span className="text-cortex-text-secondary">System Online</span>
              </div>
              <div className="text-cortex-text-muted">v2.5.1</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
        <div className="w-full max-w-md">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cortex-primary to-cortex-primary-light rounded-2xl shadow-2xl shadow-cortex-primary/25 mb-4 animate-glow-pulse hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24">
                  <path d="M12 2L3 6v6c0 5.5 4 10 9 12 5-2 9-6.5 9-12V6l-9-4z" fill="currentColor" stroke="#00B359" strokeWidth="0.5"/>
                  <circle cx="12" cy="10" r="3" fill="#000000" opacity="0.2"/>
                  <path d="M10 10l1.5 1.5L15 8.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <rect x="8" y="15" width="8" height="1" rx="0.5" fill="#ffffff" opacity="0.6"/>
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-cortex-text-primary mb-3">Welcome Back</h2>
            <p className="text-cortex-text-muted text-lg mb-2">Access your Domain Consultant workspace</p>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-cortex-accent/20 to-cortex-success/20 border border-cortex-accent/30 backdrop-blur-sm">
              <span className="text-cortex-accent text-sm font-medium">🛡️ Powered by Palo Alto Networks</span>
            </div>
          </div>

          {/* Login Card */}
          <div className="glass-card p-8 shadow-2xl shadow-cortex-orange/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-semibold text-cortex-text-secondary">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-cortex-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-10 pr-4 py-3 bg-cortex-bg-primary/50 border border-cortex-border-muted rounded-xl text-cortex-text-primary placeholder-cortex-text-disabled focus:outline-none focus:ring-2 focus:ring-cortex-accent focus:border-transparent transition-all duration-200"
                    placeholder="Enter your username"
                    required
                    disabled={loading}
                    autoComplete="username"
                  />
                  {username && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="h-5 w-5 text-cortex-success" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-cortex-text-secondary">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-cortex-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-10 pr-12 py-3 bg-cortex-bg-primary/50 border border-cortex-border-muted rounded-xl text-cortex-text-primary placeholder-cortex-text-disabled focus:outline-none focus:ring-2 focus:ring-cortex-accent focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-cortex-text-muted hover:text-cortex-text-primary transition-colors"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="status-error">
                  <div className="font-medium">Authentication Failed</div>
                  <div>{error}</div>
                </div>
              )}

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading || !username || !password}
                className="w-full btn-modern bg-gradient-to-r from-cortex-primary to-cortex-primary-light hover:from-cortex-primary/90 hover:to-cortex-primary-light/90 text-white py-3 px-6 rounded-xl font-semibold shadow-lg shadow-cortex-primary/25 focus:outline-none focus:ring-2 focus:ring-cortex-accent focus:ring-offset-2 focus:ring-offset-cortex-bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Access DC Portal</span>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Demo Access */}
            <div className="mt-6 pt-6 border-t border-cortex-border-secondary">
              <div className="text-center">
                <p className="text-cortex-text-muted text-sm mb-4 font-medium">Quick Demo Access</p>
                <button
                  onClick={() => {
                    setUsername('demo');
                    setPassword('demo');
                    setError('');
                  }}
                  className="inline-flex items-center px-4 py-2 bg-cortex-bg-quaternary/50 hover:bg-cortex-bg-hover/50 border border-cortex-border-muted rounded-lg text-sm text-cortex-text-secondary transition-all duration-200 group"
                  disabled={loading}
                >
                  <svg className="h-4 w-4 mr-2 text-cortex-text-muted group-hover:text-cortex-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="group-hover:text-cortex-text-primary">Use Demo Credentials</span>
                </button>
                <p className="text-xs text-cortex-text-disabled mt-2">Username: demo • Password: demo</p>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center space-y-4">
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cortex-success rounded-full animate-pulse"></div>
                <span className="text-cortex-text-muted">Portal Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cortex-primary-light rounded-full"></div>
                <span className="text-cortex-text-muted">XSIAM Ready</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cortex-accent rounded-full"></div>
                <span className="text-cortex-text-muted">Cloud Connected</span>
              </div>
            </div>
            <div className="text-xs text-cortex-text-disabled">
              <p className="font-medium text-cortex-text-muted">Cortex Domain Consultant Platform v2.6 2025</p>
              <p className="mt-1">Developed by Henry Reed v2.6 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ThemeProvider>
      <LoginPage />
    </ThemeProvider>
  );
}
