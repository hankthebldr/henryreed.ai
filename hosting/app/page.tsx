'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function Page() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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

  return (
    <div className="min-h-screen bg-cortex-bg-primary flex items-center justify-center relative overflow-hidden">
      {/* Modern Background Pattern with Cortex Branding */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 gradient-mesh"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,204,102,0.3) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      {/* Subtle Cortex Logo Watermark */}
      <div className="absolute top-8 right-8 opacity-10">
        <svg width="64" height="64" viewBox="0 0 32 32" className="text-cortex-green">
          <circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" strokeWidth="1"/>
          <path d="M 10 8 C 20 8, 24 12, 24 16 C 24 20, 20 24, 10 24 C 8 24, 6 22, 6 20 L 8 20 C 8 21, 9 22, 10 22 C 18 22, 22 18, 22 16 C 22 14, 18 10, 10 10 C 9 10, 8 11, 8 12 L 6 12 C 6 10, 8 8, 10 8 Z" fill="currentColor"/>
          <circle cx="24" cy="8" r="2" fill="#00CC66" opacity="0.6"/>
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header with Cortex Branding */}
        <div className="text-center mb-8 relative">
          {/* Subtle glow effect behind ASCII art */}
          <div className="absolute inset-0 bg-cortex-green/5 blur-xl rounded-full"></div>
          <div className="mb-4 relative">
<pre className="text-cortex-green text-sm font-mono leading-tight drop-shadow-lg">
{`
 ██████╗ ██████╗ ██████╗ ████████╗███████╗██╗  ██╗    ██████╗  ██████╗
██╔════╝██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝╚██╗██╔╝    ██╔══██╗██╔════╝
██║     ██║   ██║██████╔╝   ██║   █████╗   ╚███╔╝     ██║  ██║██║     
██║     ██║   ██║██╔══██╗   ██║   ██╔══╝   ██╔██╗     ██║  ██║██║     
╚██████╗╚██████╔╝██║  ██║   ██║   ███████╗██╔╝ ██╗    ██████╔╝╚██████╗
 ╚═════╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝    ╚═════╝  ╚═════╝
`}
            </pre>
          </div>
<h1 className="text-3xl font-bold text-cortex-text-primary mb-2">Cortex DC Access</h1>
          <p className="text-cortex-text-muted text-sm">
            Secure access to the Cortex DC Engagement Portal
          </p>
        </div>

        {/* Modern Login Card with Glassmorphism */}
        <div className="glass-card p-8 animate-scale-in backdrop-blur-xl border border-cortex-green/20 hover:border-cortex-green/40 transition-all duration-500">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-cortex-text-secondary mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:border-cortex-green focus:ring-2 focus:ring-cortex-green/20 transition-colors font-mono"
                placeholder="Enter username"
                required
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-cortex-text-secondary mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 bg-cortex-bg-tertiary border border-cortex-border-secondary rounded-lg text-cortex-text-primary placeholder-cortex-text-muted focus:outline-none focus:border-cortex-green focus:ring-2 focus:ring-cortex-green/20 transition-colors font-mono"
                placeholder="Enter password"
                required
                autoComplete="current-password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 status-error rounded-lg">
                <div className="flex items-center">
                  <div className="mr-2">⚠️</div>
                  <div className="text-sm">{error}</div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-modern btn-cortex-primary disabled:bg-cortex-bg-hover disabled:text-cortex-text-disabled disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 hover:shadow-glow-green group"
            >
              {loading ? (
                <>
                  <div className="cortex-spinner mr-3"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <span className="mr-2 transition-transform group-hover:scale-110">🛡️</span>
                  <span className="font-semibold">Access Portal</span>
                  <span className="ml-2 text-xs opacity-60 group-hover:opacity-100 transition-opacity">→</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-6 pt-6 border-t border-cortex-border-secondary">
            <div className="text-center">
              <p className="text-xs text-cortex-text-muted mb-2">
                Authorized domain consultants only
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-cortex-text-muted">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-cortex-green rounded-full mr-1 animate-pulse"></div>
                  <span>System Online</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-cortex-green rounded-full mr-1"></div>
                  <span>Portal Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-8 text-xs text-cortex-text-muted">
          <p>Cortex DC Engagement Portal</p>
          <p className="mt-1">v2.2 • Professional POV Management Platform</p>
        </div>
      </div>
    </div>
  );
}
