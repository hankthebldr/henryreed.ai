'use client';

import { Metadata } from 'next';
import { useState } from 'react';

// Mock user data - replace with actual authentication
const mockUser = {
  id: 1,
  username: 'henryreed',
  email: 'henry@henryreed.ai',
  displayName: 'Henry Reed',
  bio: 'Software developer passionate about terminal interfaces and modern web technologies.',
  joinDate: '2024-01-01',
  postsCount: 5,
  role: 'admin',
  avatar: null,
};

export default function AccountPage() {
  const [user, setUser] = useState(mockUser);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user.displayName,
    email: user.email,
    bio: user.bio,
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // In a real app, you'd check authentication here
  const isAuthenticated = true; // Mock authentication

  if (!isAuthenticated) {
    // Redirect to login in a real app
    return (
      <div className="min-h-screen bg-hack-background p-6 flex items-center justify-center">
        <div className="bg-hack-surface border border-terminal-amber rounded-lg p-8 text-center">
          <h1 className="text-2xl font-mono text-terminal-amber mb-4">
            ACCESS_DENIED
          </h1>
          <p className="text-terminal-green font-mono mb-6">
            Please log in to access your account.
          </p>
          <a
            href="/login"
            className="inline-block px-4 py-2 border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-hack-background transition-all font-mono"
          >
            LOGIN_NOW
          </a>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // In a real app, this would update the user via API
      console.log('Updating user:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUser(prev => ({
        ...prev,
        ...formData,
      }));
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    // In a real app, this would clear authentication and redirect
    console.log('Logging out...');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-hack-background p-6">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-8">
          <a
            href="/"
            className="text-terminal-cyan font-mono hover:text-terminal-green transition-colors"
          >
            &lt; BACK_TO_HOME
          </a>
        </nav>

        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-terminal-green mb-4 font-mono">
            &gt; ACCOUNT_PROFILE.EXE
          </h1>
          <p className="text-terminal-cyan font-mono">
            Manage your account settings and profile
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <div className="bg-hack-surface border border-terminal-green rounded-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-mono text-terminal-green">
                  PROFILE_DATA
                </h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 border border-terminal-cyan text-terminal-cyan hover:bg-terminal-cyan hover:text-hack-background transition-all font-mono text-sm"
                >
                  {isEditing ? 'CANCEL_EDIT' : 'EDIT_PROFILE'}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveChanges} className="space-y-6">
                  <div>
                    <label className="block text-terminal-green font-mono text-sm mb-2">
                      DISPLAY_NAME
                    </label>
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="w-full bg-hack-background border border-terminal-green text-terminal-green font-mono p-3 rounded focus:border-terminal-cyan focus:outline-none"
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
                      className="w-full bg-hack-background border border-terminal-green text-terminal-green font-mono p-3 rounded focus:border-terminal-cyan focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-terminal-green font-mono text-sm mb-2">
                      BIO
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full bg-hack-background border border-terminal-green text-terminal-green font-mono p-3 rounded focus:border-terminal-cyan focus:outline-none resize-vertical"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-6 py-2 border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-hack-background transition-all font-mono disabled:opacity-50"
                    >
                      {isUpdating ? 'SAVING...' : 'SAVE_CHANGES'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 border border-terminal-amber text-terminal-amber hover:bg-terminal-amber hover:text-hack-background transition-all font-mono"
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-terminal-cyan font-mono text-sm mb-1">USERNAME</div>
                      <div className="text-terminal-green font-mono">{user.username}</div>
                    </div>
                    <div>
                      <div className="text-terminal-cyan font-mono text-sm mb-1">DISPLAY_NAME</div>
                      <div className="text-terminal-green font-mono">{user.displayName}</div>
                    </div>
                    <div>
                      <div className="text-terminal-cyan font-mono text-sm mb-1">EMAIL</div>
                      <div className="text-terminal-green font-mono">{user.email}</div>
                    </div>
                    <div>
                      <div className="text-terminal-cyan font-mono text-sm mb-1">ROLE</div>
                      <div className="text-terminal-amber font-mono uppercase">{user.role}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-terminal-cyan font-mono text-sm mb-1">BIO</div>
                    <div className="text-terminal-green font-mono">{user.bio}</div>
                  </div>
                  
                  <div>
                    <div className="text-terminal-cyan font-mono text-sm mb-1">MEMBER_SINCE</div>
                    <div className="text-terminal-green font-mono">{user.joinDate}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-hack-surface border border-terminal-cyan rounded-lg p-6">
              <h3 className="text-lg font-mono text-terminal-cyan mb-4">
                USER_STATS
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-terminal-green font-mono text-sm">POSTS</span>
                  <span className="text-terminal-green font-mono">{user.postsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-green font-mono text-sm">VIEWS</span>
                  <span className="text-terminal-green font-mono">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-green font-mono text-sm">COMMENTS</span>
                  <span className="text-terminal-green font-mono">42</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-hack-surface border border-terminal-green rounded-lg p-6">
              <h3 className="text-lg font-mono text-terminal-green mb-4">
                QUICK_ACTIONS
              </h3>
              <div className="space-y-3">
                <a
                  href="/blog/create"
                  className="block w-full text-center px-4 py-2 border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-hack-background transition-all font-mono text-sm"
                >
                  CREATE_POST
                </a>
                <a
                  href="/blog"
                  className="block w-full text-center px-4 py-2 border border-terminal-cyan text-terminal-cyan hover:bg-terminal-cyan hover:text-hack-background transition-all font-mono text-sm"
                >
                  VIEW_BLOG
                </a>
                <button
                  onClick={() => console.log('Opening settings...')}
                  className="block w-full text-center px-4 py-2 border border-terminal-amber text-terminal-amber hover:bg-terminal-amber hover:text-hack-background transition-all font-mono text-sm"
                >
                  SETTINGS
                </button>
              </div>
            </div>

            {/* Security */}
            <div className="bg-hack-surface border border-terminal-red rounded-lg p-6">
              <h3 className="text-lg font-mono text-terminal-red mb-4">
                SECURITY
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => console.log('Change password...')}
                  className="block w-full text-center px-4 py-2 border border-terminal-amber text-terminal-amber hover:bg-terminal-amber hover:text-hack-background transition-all font-mono text-sm"
                >
                  CHANGE_PASSWORD
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-center px-4 py-2 border border-terminal-red text-terminal-red hover:bg-terminal-red hover:text-hack-background transition-all font-mono text-sm"
                >
                  LOGOUT
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="bg-hack-surface border border-terminal-green rounded-lg p-8">
            <h3 className="text-xl font-mono text-terminal-green mb-6">
              RECENT_ACTIVITY.LOG
            </h3>
            <div className="space-y-3 font-mono text-sm">
              <div className="text-terminal-green">
                <span className="text-terminal-cyan">[2024-01-15]</span> Created new post: "Building Terminal Interfaces"
              </div>
              <div className="text-terminal-green">
                <span className="text-terminal-cyan">[2024-01-14]</span> Updated profile information
              </div>
              <div className="text-terminal-green">
                <span className="text-terminal-cyan">[2024-01-10]</span> Published article: "XTerm.js Integration Patterns"
              </div>
              <div className="text-terminal-green">
                <span className="text-terminal-cyan">[2024-01-08]</span> Account created
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
