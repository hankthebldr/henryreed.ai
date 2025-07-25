'use client';

import { Metadata } from 'next';
import { useState } from 'react';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // In a real app, this would authenticate via API
      console.log('Login attempt:', { email: formData.email, rememberMe: formData.rememberMe });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication logic
      if (formData.email === 'henry@henryreed.ai' && formData.password === 'terminal123') {
        // Successful login - redirect to account or previous page
        window.location.href = '/account';
      } else {
        setError('Invalid credentials. Try henry@henryreed.ai / terminal123');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('LOGIN_FAILED: Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hack-background p-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-terminal-green mb-4 font-mono">
            &gt; LOGIN.EXE
          </h1>
          <p className="text-terminal-cyan font-mono">
            Access restricted terminal
          </p>
        </div>

        <div className="bg-hack-surface border border-terminal-green rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-hack-background border border-terminal-red rounded p-4">
                <div className="text-terminal-red font-mono text-sm">
                  ERROR: {error}
                </div>
              </div>
            )}

            <div>
              <label className="block text-terminal-green font-mono text-sm mb-2">
                EMAIL_ADDRESS
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full bg-hack-background border border-terminal-green text-terminal-green font-mono p-3 rounded focus:border-terminal-cyan focus:outline-none"
                placeholder="user@domain.com"
              />
            </div>

            <div>
              <label className="block text-terminal-green font-mono text-sm mb-2">
                PASSWORD
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full bg-hack-background border border-terminal-green text-terminal-green font-mono p-3 rounded focus:border-terminal-cyan focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="mr-2 w-4 h-4 text-terminal-green bg-hack-background border border-terminal-green rounded focus:ring-terminal-cyan"
                />
                <span className="text-terminal-green font-mono text-sm">
                  REMEMBER_SESSION
                </span>
              </label>

              <a
                href="/reset-password"
                className="text-terminal-cyan font-mono text-sm hover:text-terminal-green transition-colors"
              >
                FORGOT_PASSWORD?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.email || !formData.password}
              className="w-full py-3 border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-hack-background transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'AUTHENTICATING...' : 'LOGIN'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-terminal-green">
            <div className="text-center">
              <span className="text-terminal-green font-mono text-sm">
                NEW_USER?{' '}
              </span>
              <a
                href="/register"
                className="text-terminal-cyan font-mono text-sm hover:text-terminal-green transition-colors"
              >
                CREATE_ACCOUNT
              </a>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-hack-background border border-terminal-amber rounded">
            <div className="text-terminal-amber font-mono text-xs mb-2">
              DEMO_CREDENTIALS:
            </div>
            <div className="text-terminal-green font-mono text-xs space-y-1">
              <div>Email: henry@henryreed.ai</div>
              <div>Password: terminal123</div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <a
            href="/"
            className="text-terminal-cyan font-mono text-sm hover:text-terminal-green transition-colors"
          >
            &lt; BACK_TO_HOME
          </a>
        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center">
          <div className="text-terminal-green font-mono text-xs opacity-75">
            SECURE_CONNECTION: SSL/TLS ENCRYPTED
          </div>
        </div>
      </div>
    </div>
  );
}
