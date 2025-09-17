'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const VALID_CREDENTIALS = {
  username: 'cortex',
  password: 'xsiam'
};

export default function Page() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInterface, setSelectedInterface] = useState<'gui' | 'terminal'>('gui');
  const [showInterfaceSelection, setShowInterfaceSelection] = useState(false);
  const router = useRouter();

  // If already authenticated, send users straight to GUI
  useEffect(() => {
    const authenticated = sessionStorage.getItem('dc_authenticated');
    if (authenticated === 'true') {
      router.push('/gui');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simple delay to simulate authentication
    await new Promise(resolve => setTimeout(resolve, 800));

    if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
      // Store authentication state
      sessionStorage.setItem('dc_authenticated', 'true');
      sessionStorage.setItem('dc_user', username);
      
      // Show interface selection instead of directly routing
      setShowInterfaceSelection(true);
      setIsLoading(false);
    } else {
      setError('Invalid credentials. Please try again.');
      setIsLoading(false);
      // Clear password field on error
      setPassword('');
    }
  };

  const handleInterfaceSelection = (interfaceType: 'gui' | 'terminal') => {
    router.push(`/${interfaceType}`);
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

        {/* Login Card / Interface Selection */}
        <div className="cortex-card-elevated p-8">
          {showInterfaceSelection ? (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-cortex-green mb-2">Choose Your Experience</h2>
                <p className="text-cortex-text-secondary text-sm">
                  Select your preferred interface for the Cortex DC Portal
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* GUI Option */}
                <button
                  onClick={() => handleInterfaceSelection('gui')}
                  className="group p-6 border-2 border-cortex-border-secondary hover:border-cortex-green rounded-lg transition-all duration-200 hover:shadow-lg hover:cortex-glow-green text-left"
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🎨</div>
                  <h3 className="text-xl font-bold text-cortex-text-primary mb-2">Graphical Interface</h3>
                  <p className="text-cortex-text-secondary text-sm mb-3">
                    Modern web interface with forms, dashboards, and visual workflows. Perfect for comprehensive project management and data visualization.
                  </p>
                  <div className="text-xs text-cortex-green">
                    ✓ Visual dashboards  ✓ Form-based inputs  ✓ Charts & reports
                  </div>
                </button>
                
                {/* Terminal Option */}
                <button
                  onClick={() => handleInterfaceSelection('terminal')}
                  className="group p-6 border-2 border-cortex-border-secondary hover:border-cortex-info rounded-lg transition-all duration-200 hover:shadow-lg text-left"
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">💻</div>
                  <h3 className="text-xl font-bold text-cortex-text-primary mb-2">Terminal Interface</h3>
                  <p className="text-cortex-text-secondary text-sm mb-3">
                    Command-line experience for power users. Fast, efficient, and scriptable. Ideal for automation and advanced workflows.
                  </p>
                  <div className="text-xs text-cortex-info">
                    ✓ Command-line power  ✓ Scriptable workflows  ✓ Expert efficiency
                  </div>
                </button>
              </div>
              
              <div className="text-center pt-4 border-t border-cortex-border-secondary">
                <p className="text-xs text-cortex-text-muted mb-2">
                  You can switch between interfaces at any time using the navigation header
                </p>
                <button
                  onClick={() => setShowInterfaceSelection(false)}
                  className="text-cortex-text-accent hover:text-cortex-green text-sm underline"
                >
                  ← Back to Login
                </button>
              </div>
            </div>
          ) : (
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
                  <span className="mr-2">🛡️</span>
                  Access Portal
                </>
              )}
            </button>
          </form>
          )}

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
