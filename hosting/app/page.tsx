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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden">
      {/* Modern Background Pattern with Cortex DC Branding */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(250,88,45,0.1) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      {/* Palo Alto Networks Logo Watermark */}
      <div className="absolute top-8 right-8 opacity-15">
        <img src="/assets/branding/logos/pan-logo-dark.svg" alt="Palo Alto Networks" width="120" height="24" className="filter invert opacity-30" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header with Palo Alto Networks & Cortex DC Branding */}
        <div className="text-center mb-8 relative">
          {/* Palo Alto Networks Official Logo with background */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <img src="/assets/branding/logos/pan-logo-dark.svg" alt="Palo Alto Networks" width="180" height="35" className="filter invert" />
            </div>
          </div>
          
          {/* Cortex DC Portal Title */}
          <div className="mb-4 relative">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              <h1 className="text-4xl font-bold mb-2">Cortex DC Portal</h1>
            </div>
            <div className="text-lg font-semibold text-gray-300 mb-2">
              Domain Consultant Engagement Platform
            </div>
          </div>
          
          <p className="text-gray-400 text-sm mb-2">
            Professional POV Management & Customer Engagement Hub
          </p>
          <div className="text-xs text-orange-400 font-medium">
            Powered by Palo Alto Networks Cortex Platform
          </div>
        </div>

        {/* Modern Login Card */}
        <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700 rounded-lg p-8 shadow-2xl hover:border-orange-500/40 transition-all duration-500">
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
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
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
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
                placeholder="Enter password"
                required
                autoComplete="current-password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-900/50 border border-red-600 rounded-lg">
                <div className="flex items-center">
                  <div className="mr-2">⚠️</div>
                  <div className="text-sm text-red-200">{error}</div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>Authenticating...</>
              ) : (
                <><span className="text-lg mr-2">🚀</span>Access DC Portal<span className="text-sm opacity-75 ml-2">→</span></>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-2">
                Authorized Domain Consultants Only
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  <span>Portal Online</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-1"></div>
                  <span>Cortex Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-8 text-xs text-gray-400">
          <p className="text-white font-medium">Cortex Domain Consultant Portal</p>
          <p className="mt-1">v2.5 • Professional POV & Customer Engagement Platform</p>
          <div className="flex items-center justify-center mt-3 space-x-2">
            <span>Powered by</span>
            <div className="bg-gray-800 px-2 py-1 rounded">
              <img src="/assets/branding/logos/pan-logo-dark.svg" alt="Palo Alto Networks" width="60" height="12" className="filter invert opacity-80" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
