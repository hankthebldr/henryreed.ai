'use client';

import React, { useState, useEffect } from 'react';
import CortexButton from './CortexButton';

interface User {
  id: string;
  username: string;
  email?: string;
  role: 'admin' | 'manager' | 'senior_dc' | 'dc' | 'analyst';
  viewMode?: 'admin' | 'user';
  lastLogin?: string;
  assignedProjects?: string[];
  assignedCustomers?: string[];
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onViewModeChange?: (mode: 'admin' | 'user') => void;
  onLogout?: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  user,
  onViewModeChange,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'view-mode' | 'auth' | 'system'>('profile');
  const [viewMode, setViewMode] = useState<'admin' | 'user'>(user?.viewMode || 'user');

  useEffect(() => {
    if (user?.viewMode) {
      setViewMode(user.viewMode);
    }
  }, [user?.viewMode]);

  if (!isOpen) return null;

  const handleViewModeToggle = (mode: 'admin' | 'user') => {
    setViewMode(mode);
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  const authProvider = process.env.NEXT_PUBLIC_AUTH_PROVIDER || 'local';
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || '2.2.0';
  const buildEnv = process.env.NODE_ENV || 'development';

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    ...(['admin', 'manager'].includes(user?.role || '') ? [{ id: 'view-mode', name: 'View Mode', icon: '⚙️' }] : []),
    { id: 'auth', name: 'Authentication', icon: '🔐' },
    ...(['admin', 'manager'].includes(user?.role || '') ? [{ id: 'system', name: 'System', icon: '🖥️' }] : [])
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-cortex-bg-primary border border-cortex-border-secondary rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cortex-border-secondary">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⚙️</span>
            <div>
              <h2 className="text-xl font-bold text-cortex-text-primary">Settings</h2>
              <p className="text-sm text-cortex-text-secondary">
                Manage your preferences and system configuration
              </p>
            </div>
          </div>
          <CortexButton
            variant="ghost"
            size="sm"
            icon="✕"
            onClick={onClose}
            className="text-cortex-text-muted hover:text-cortex-text-primary"
          >
            Close
          </CortexButton>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-48 bg-cortex-bg-secondary border-r border-cortex-border-secondary p-4">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-cortex-green text-black font-medium'
                      : 'text-cortex-text-secondary hover:text-cortex-text-primary hover:bg-cortex-bg-hover'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">User Profile</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-cortex-text-secondary">Username</label>
                        <div className="mt-1 text-cortex-text-primary">{user?.username || 'Not set'}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-cortex-text-secondary">Role</label>
                        <div className="mt-1">
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                            user?.role === 'admin' 
                              ? 'bg-red-500/20 text-red-400' 
                              : user?.role === 'manager'
                                ? 'bg-orange-500/20 text-orange-400'
                                : user?.role === 'senior_dc'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : user?.role === 'dc'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {user?.role?.toUpperCase() || 'UNKNOWN'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {user?.email && (
                      <div>
                        <label className="text-sm font-medium text-cortex-text-secondary">Email</label>
                        <div className="mt-1 text-cortex-text-primary">{user.email}</div>
                      </div>
                    )}
                    
                    {user?.lastLogin && (
                      <div>
                        <label className="text-sm font-medium text-cortex-text-secondary">Last Login</label>
                        <div className="mt-1 text-cortex-text-primary">{user.lastLogin}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'view-mode' && ['admin', 'manager'].includes(user?.role || '') && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">View Mode</h3>
                  <p className="text-sm text-cortex-text-secondary mb-6">
                    Switch between admin and user experiences. This affects available features and interface complexity.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-cortex-border-secondary rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-cortex-error/20 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">👨‍💼</span>
                        </div>
                        <div>
                          <div className="font-medium text-cortex-text-primary">Admin Experience</div>
                          <div className="text-sm text-cortex-text-secondary">
                            Full system access, advanced features, user management
                          </div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="viewMode"
                        checked={viewMode === 'admin'}
                        onChange={() => handleViewModeToggle('admin')}
                        className="w-4 h-4 text-cortex-green"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-cortex-border-secondary rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-cortex-info/20 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">👨‍💻</span>
                        </div>
                        <div>
                          <div className="font-medium text-cortex-text-primary">User Experience</div>
                          <div className="text-sm text-cortex-text-secondary">
                            Simplified interface, guided workflows, essential features
                          </div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="viewMode"
                        checked={viewMode === 'user'}
                        onChange={() => handleViewModeToggle('user')}
                        className="w-4 h-4 text-cortex-green"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-cortex-info/10 border border-cortex-info/30 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <span className="text-cortex-info mt-0.5">ℹ️</span>
                      <div className="text-sm text-cortex-info">
                        <strong>Current Mode:</strong> {viewMode === 'admin' ? 'Admin' : 'User'} Experience
                        <br />
                        Changes take effect immediately without requiring a page refresh.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'auth' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">Authentication</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-cortex-text-secondary">Auth Provider</label>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                          authProvider === 'okta' 
                            ? 'bg-cortex-success/20 text-cortex-success'
                            : 'bg-cortex-warning/20 text-cortex-warning'
                        }`}>
                          {authProvider === 'okta' ? 'OKTA SSO' : 'Local Development'}
                        </span>
                        <div className="w-2 h-2 bg-cortex-success rounded-full"></div>
                        <span className="text-sm text-cortex-text-muted">Connected</span>
                      </div>
                    </div>
                    
                    {authProvider === 'local' && (
                      <div>
                        <CortexButton
                          variant="outline"
                          size="sm"
                          icon="🔑"
                          onClick={() => {
                            // TODO: Implement password change
                            alert('Password change functionality not yet implemented');
                          }}
                        >
                          Change Password
                        </CortexButton>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t border-cortex-border-secondary">
                      <CortexButton
                        variant="danger"
                        icon="🚪"
                        onClick={onLogout}
                      >
                        Sign Out
                      </CortexButton>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && user?.role === 'admin' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-cortex-text-primary mb-4">System Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-cortex-text-secondary">Application Version</label>
                        <div className="mt-1 text-cortex-text-primary font-mono">{appVersion}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-cortex-text-secondary">Environment</label>
                        <div className="mt-1">
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                            buildEnv === 'production' 
                              ? 'bg-cortex-success/20 text-cortex-success' 
                              : 'bg-cortex-warning/20 text-cortex-warning'
                          }`}>
                            {buildEnv.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-cortex-text-secondary">System Status</label>
                      <div className="mt-2 flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-cortex-success rounded-full"></div>
                          <span className="text-cortex-text-muted">Terminal Online</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-cortex-success rounded-full"></div>
                          <span className="text-cortex-text-muted">Commands Ready</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-cortex-success rounded-full"></div>
                          <span className="text-cortex-text-muted">Auth Active</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-cortex-border-secondary">
                      <div className="text-sm text-cortex-text-secondary">
                        <div className="flex justify-between">
                          <span>Active Users:</span>
                          <span className="text-cortex-text-primary">1</span>
                        </div>
                        <div className="flex justify-between">
                          <span>POV Projects:</span>
                          <span className="text-cortex-text-primary">3</span>
                        </div>
                        <div className="flex justify-between">
                          <span>TRR Requests:</span>
                          <span className="text-cortex-text-primary">7</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Floating Settings Gear Component
export const SettingsGear: React.FC<{
  onClick: () => void;
  className?: string;
}> = ({ onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed top-4 right-4 z-40 w-12 h-12 bg-cortex-bg-secondary hover:bg-cortex-bg-hover border border-cortex-border-secondary hover:border-cortex-green rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl group ${className}`}
      title="Open Settings"
    >
      <span className="text-xl group-hover:rotate-45 transition-transform duration-200">⚙️</span>
    </button>
  );
};

export default SettingsPanel;