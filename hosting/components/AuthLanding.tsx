'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const VALID_CREDENTIALS = {
  username: 'cortex',
  password: 'xsiam'
};

export default function AuthLanding() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simple delay to simulate authentication
    await new Promise(resolve => setTimeout(resolve, 800));

    if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
      // Store authentication state (unified keys)
      sessionStorage.setItem('dc_authenticated', 'true');
      sessionStorage.setItem('dc_user', username);
      
      // Route to terminal
      router.push('/terminal');
    } else {
      setError('Invalid credentials. Please try again.');
      setIsLoading(false);
      // Clear password field on error
      setPassword('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e as any);
    }
  };

  return (
    <div className="min-h-screen bg-cortex-bg-primary flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,204,102,0.3) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
<pre className="text-cortex-green text-sm font-mono leading-tight">
{`
 ██╗  ██╗███████╗██╗ █████╗ ███╗   ███╗
 ╚██╗██╔╝██╔════╝██║██╔══██╗████╗ ████║
  ╚███╔╝ ███████╗██║███████║██╔████╔██║
  ██╔██╗ ╚════██║██║██╔══██║██║╚██╔╝██║
 ██╔╝ ██╗███████║██║██║  ██║██║ ╚═╝ ██║
 ╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═╝╚═╝     ╚═╝
`}
            </pre>
          </div>
<h1 className="text-3xl font-bold text-cortex-text-primary mb-2">Cortex Terminal Access</h1>
          <p className="text-cortex-text-muted text-sm">
            Secure access to the XSIAM & Cortex POV-CLI
          </p>
        </div>

        {/* Login Card */}
        <div className="cortex-card-elevated p-8">
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
              disabled={isLoading}
              className="w-full btn-cortex-primary disabled:bg-cortex-bg-hover disabled:text-cortex-text-disabled disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="cortex-spinner mr-3"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <span className="mr-2">🔐</span>
                  Access Terminal
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-6 pt-6 border-t border-cortex-border-secondary">
            <div className="text-center">
              <p className="text-xs text-cortex-text-muted mb-2">
                Authorized access only
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-cortex-text-muted">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-cortex-green rounded-full mr-1 animate-pulse"></div>
                  <span>System Online</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-cortex-info rounded-full mr-1"></div>
                  <span>AI Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-8 text-xs text-cortex-text-muted">
          <p>Developed by Henry Reed</p>
          <p className="mt-1">v2.1 • XSIAM/Cortex Proof-of-Value Terminal</p>
        </div>
      </div>
    </div>
  );
}
