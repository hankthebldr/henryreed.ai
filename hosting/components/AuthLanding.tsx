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
      // Store authentication state
      sessionStorage.setItem('authenticated', 'true');
      sessionStorage.setItem('auth_user', username);
      
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <pre className="text-cyan-400 text-sm font-mono leading-tight">
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
          <h1 className="text-3xl font-bold text-white mb-2">AI Terminal Access</h1>
          <p className="text-gray-400 text-sm">
            Secure access to Henry Reed AI Proof-of-Value CLI
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-colors font-mono"
                placeholder="Enter username"
                required
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-colors font-mono"
                placeholder="Enter password"
                required
                autoComplete="current-password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
                <div className="flex items-center">
                  <div className="text-red-400 mr-2">⚠️</div>
                  <div className="text-red-300 text-sm">{error}</div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
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
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">
                Authorized access only
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  <span>System Online</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                  <span>AI Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-8 text-xs text-gray-500">
          <p>Henry Reed AI Consulting Platform</p>
          <p className="mt-1">v2.1 • Proof-of-Value Terminal Interface</p>
        </div>
      </div>
    </div>
  );
}
