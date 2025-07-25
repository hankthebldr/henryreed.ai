'use client';

import { Metadata } from 'next';
import { useState } from 'react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error || successMessage) {
      setError('');
      setSuccessMessage('');
    }
  };

  const validatePasswords = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswords()) return;

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // In a real app, this would register the user via API
      console.log('Registration attempt:', { username: formData.username, email: formData.email });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Assume registration success
      setSuccessMessage('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setError('REGISTRATION_FAILED: Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hack-background p-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-terminal-green mb-4 font-mono">
            &gt; REGISTER.EXE
          </h1>
          <p className="text-terminal-cyan font-mono">
            Create your account
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

            {successMessage && (
              <div className="bg-hack-background border border-terminal-green rounded p-4">
                <div className="text-terminal-green font-mono text-sm">
                  {successMessage}
                </div>
              </div>
            )}

            <div>
              <label className="block text-terminal-green font-mono text-sm mb-2">
                USERNAME
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full bg-hack-background border border-terminal-green text-terminal-green font-mono p-3 rounded focus:border-terminal-cyan focus:outline-none"
                placeholder="Choose a username"
              />
            </div>

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
                placeholder="you@domain.com"
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
                placeholder="Enter a secure password"
              />
            </div>

            <div>
              <label className="block text-terminal-green font-mono text-sm mb-2">
                CONFIRM_PASSWORD
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full bg-hack-background border border-terminal-green text-terminal-green font-mono p-3 rounded focus:border-terminal-cyan focus:outline-none"
                placeholder="Re-enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-hack-background transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'REGISTERING...' : 'REGISTER'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-terminal-green">
            <div className="text-center">
              <span className="text-terminal-green font-mono text-sm">
                ALREADY_REGISTERED?{' '}
              </span>
              <a
                href="/login"
                className="text-terminal-cyan font-mono text-sm hover:text-terminal-green transition-colors"
              >
                LOGIN_HERE
              </a>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-8 text-center">
            <div className="text-terminal-green font-mono text-xs opacity-75">
              SECURE_CONNECTION: SSL/TLS ENCRYPTED
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
      </div>
    </div>
  );
}

