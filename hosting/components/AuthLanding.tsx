'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { PaloAltoLogo, BrandedButton } from '../src/components/branding';

export default function AuthLanding() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, user, loading, isMockMode } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      router.push('/terminal');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await signIn(username, password);
      // AuthContext will handle user state and redirect via useEffect
    } catch (error) {
      console.error('Authentication error:', error);
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
          {/* Palo Alto Networks Official Logo */}
          <div className="flex justify-center mb-4">
            <PaloAltoLogo size="lg" className="drop-shadow-lg" />
          </div>
          
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
          <p className="text-cortex-text-muted text-sm mb-2">
            Secure access to the XSIAM & Cortex POV-CLI
          </p>
          <div className="text-xs text-pan-orange font-medium">
            Powered by Palo Alto Networks Security Platform
          </div>
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
            <BrandedButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              loadingText="Authenticating..."
              leftIcon={<span className="text-lg">🔐</span>}
              disabled={loading}
            >
              <span className="font-semibold">Access Terminal</span>
            </BrandedButton>
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
          <p className="text-cortex-text-primary font-medium">XSIAM/Cortex Proof-of-Value Terminal</p>
          <p className="mt-1">v2.1 • Developed by Henry Reed</p>
          <div className="flex items-center justify-center mt-2 space-x-2">
            <span>Secured by</span>
            <PaloAltoLogo size="sm" className="opacity-60" />
          </div>
        </div>
      </div>
    </div>
  );
}
