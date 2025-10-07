/**
 * Management Dashboard
 * Comprehensive admin interface for user oversight, analytics, and system management
 */

import React, { useState, useEffect } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { 
  userManagementService, 
  UserProfile, 
  UserActivity, 
  UserMetrics, 
  SystemMetrics,
  UserRole 
} from '../lib/user-management';

interface DashboardTab {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const ManagementDashboard: React.FC = () => {
  const { state, actions } = useAppState();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userMetrics, setUserMetrics] = useState<Record<string, UserMetrics>>({});
  const [activityFilter, setActivityFilter] = useState<'all' | 'today' | 'week' | 'month'>('today');
  const [isLoading, setIsLoading] = useState(false);
  // Derive system-wide feature flags from the demo user store so the
  // feature flag UI reflects the current defaults instead of using a
  // hard-coded/inverted condition which caused incorrect rendering.
  const systemFeatureFlags: Record<string, boolean> = userManagementService.getAllUsers()[0]?.featureFlags || {};

  useEffect(() => {
    loadDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load users
      const allUsers = userManagementService.getAllUsers();
      setUsers(allUsers);
      
      // Load system metrics
      const sysMetrics = userManagementService.generateSystemMetrics();
      setSystemMetrics(sysMetrics);
      
      // Load user metrics for active users
      const metricsPromises = allUsers.map(async (user) => {
        const metrics = userManagementService.generateUserMetrics(user.id, 'daily');
        return { userId: user.id, metrics };
      });
      
      const metricsResults = await Promise.all(metricsPromises);
      const metricsMap: Record<string, UserMetrics> = {};
      metricsResults.forEach(({ userId, metrics }) => {
        metricsMap[userId] = metrics;
      });
      setUserMetrics(metricsMap);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      actions.notify('error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs: DashboardTab[] = [
    { id: 'overview', name: 'Overview', icon: '📊', description: 'System overview and key metrics' },
    { id: 'users', name: 'User Management', icon: '👥', description: 'Manage users, roles, and permissions' },
    { id: 'analytics', name: 'Analytics', icon: '📈', description: 'Detailed analytics and reporting' },
    { id: 'activity', name: 'Activity Feed', icon: '📝', description: 'Real-time user activity monitoring' },
    { id: 'system', name: 'System Health', icon: '⚙️', description: 'System performance and health monitoring' },
    { id: 'settings', name: 'Settings', icon: '🔧', description: 'System configuration and feature flags' }
  ];

  const OverviewTab = () => {
    if (!systemMetrics) return <div>Loading...</div>;

    const topUsers = users
      .map(user => ({
        user,
        metrics: userMetrics[user.id]
      }))
      .filter(({ metrics }) => metrics)
      .sort((a, b) => (b.metrics?.actionsPerformed || 0) - (a.metrics?.actionsPerformed || 0))
      .slice(0, 5);

    return (
      <div className="space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="cortex-card-elevated p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cortex-blue text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-cortex-text-primary">{systemMetrics.totalUsers}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
            <div className="mt-2 text-xs text-cortex-text-muted">
              +{systemMetrics.newUsers} new this period
            </div>
          </div>

          <div className="cortex-card-elevated p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cortex-success text-sm font-medium">Active Users</p>
                <p className="text-3xl font-bold text-cortex-text-primary">{systemMetrics.activeUsers}</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
            <div className="mt-2 text-xs text-cortex-text-muted">
              {Math.round((systemMetrics.activeUsers / systemMetrics.totalUsers) * 100)}% active rate
            </div>
          </div>

          <div className="cortex-card-elevated p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cortex-warning text-sm font-medium">TRR Volume</p>
                <p className="text-3xl font-bold text-cortex-text-primary">{systemMetrics.trrVolume.created}</p>
              </div>
              <div className="text-3xl">📋</div>
            </div>
            <div className="mt-2 text-xs text-cortex-text-muted">
              {systemMetrics.trrVolume.completed} completed
            </div>
          </div>

          <div className="cortex-card-elevated p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cortex-purple text-sm font-medium">System Health</p>
                <p className="text-3xl font-bold text-cortex-text-primary">{systemMetrics.uptime}%</p>
              </div>
              <div className="text-3xl">⚡</div>
            </div>
            <div className="mt-2 text-xs text-cortex-text-muted">
              {systemMetrics.averageLoadTime}ms avg load
            </div>
          </div>
        </div>

        {/* Feature Adoption */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-cortex-text-primary mb-4">🚀 Feature Adoption</h3>
          <div className="space-y-3">
            {Object.entries(systemMetrics.featureAdoption).map(([feature, data]) => (
              <div key={feature} className="cortex-card p-3 flex items-center justify-between">
                <div>
                  <div className="text-cortex-text-primary font-medium capitalize">{feature.replace('_', ' ')}</div>
                  <div className="text-sm text-cortex-text-muted">{data.totalUsers} users</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 bg-cortex-bg-secondary rounded-full h-2">
                    <div 
                      className="bg-cortex-cyan h-2 rounded-full"
                      style={{ width: `${data.adoptionRate}%` }}
                    ></div>
                  </div>
                  <span className="text-cortex-cyan font-mono text-sm">{data.adoptionRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Users */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-cortex-text-primary mb-4">🏆 Most Active Users</h3>
          <div className="space-y-3">
            {topUsers.map(({ user, metrics }, index) => (
              <div key={user.id} className="cortex-card p-3 flex items-center justify-between cortex-interactive">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-cortex-cyan to-cortex-blue rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-cortex-text-primary font-medium">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-cortex-text-muted">{user.title} • {user.department}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-cortex-cyan font-mono">{metrics?.actionsPerformed || 0}</div>
                  <div className="text-xs text-cortex-text-muted">actions today</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const UsersTab = () => {
    const [userFilter, setUserFilter] = useState<UserRole | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filteredUsers = users.filter(user => {
      const roleMatch = userFilter === 'all' || user.role === userFilter;
      const statusMatch = statusFilter === 'all' || user.status === statusFilter;
      return roleMatch && statusMatch;
    });

    const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
      try {
        // In a real implementation, this would call an API
        const user = users.find(u => u.id === userId);
        if (user) {
          user.role = newRole;
          user.permissions = userManagementService['getDefaultPermissions'](newRole);
          user.updatedAt = new Date().toISOString();
          setUsers([...users]);
          actions.notify('success', `Updated ${user.firstName} ${user.lastName}'s role to ${newRole}`);
        }
      } catch (error) {
        actions.notify('error', 'Failed to update user role');
      }
    };

    const handleToggleUserStatus = async (userId: string) => {
      try {
        const user = users.find(u => u.id === userId);
        if (user) {
          user.status = user.status === 'active' ? 'inactive' : 'active';
          user.updatedAt = new Date().toISOString();
          setUsers([...users]);
          actions.notify('success', `${user.status === 'active' ? 'Activated' : 'Deactivated'} ${user.firstName} ${user.lastName}`);
        }
      } catch (error) {
        actions.notify('error', 'Failed to update user status');
      }
    };

    return (
      <div className="space-y-6">
        {/* Filters */}
        <div className="glass-card p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-cortex-text-muted">Role:</span>
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value as UserRole | 'all')}
                className="cortex-card p-2 border-cortex-border-secondary text-cortex-text-primary bg-cortex-bg-secondary rounded-md focus:ring-2 focus:ring-cortex-orange text-sm"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="senior_dc">Senior DC</option>
                <option value="dc">Domain Consultant</option>
                <option value="se">Solutions Engineer</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-cortex-text-muted">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="cortex-card p-2 border-cortex-border-secondary text-cortex-text-primary bg-cortex-bg-secondary rounded-md focus:ring-2 focus:ring-cortex-orange text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="flex-1"></div>

            <div className="text-sm text-cortex-text-muted">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto terminal-scrollbar">
            <table className="w-full">
              <thead className="bg-cortex-bg-secondary">
                <tr>
                  <th className="text-left p-4 text-cortex-text-secondary font-medium">User</th>
                  <th className="text-left p-4 text-cortex-text-secondary font-medium">Role</th>
                  <th className="text-left p-4 text-cortex-text-secondary font-medium">Department</th>
                  <th className="text-left p-4 text-cortex-text-secondary font-medium">Status</th>
                  <th className="text-left p-4 text-cortex-text-secondary font-medium">Activity</th>
                  <th className="text-left p-4 text-cortex-text-secondary font-medium">Last Login</th>
                  <th className="text-left p-4 text-cortex-text-secondary font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => {
                  const metrics = userMetrics[user.id];
                  return (
                    <tr key={user.id} className="border-t border-cortex-border-secondary hover:bg-cortex-bg-hover">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-cortex-cyan to-cortex-blue rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div>
                            <div className="text-cortex-text-primary font-medium">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-cortex-text-muted">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateUserRole(user.id, e.target.value as UserRole)}
                          className="cortex-card p-2 border-cortex-border-secondary text-cortex-text-primary bg-cortex-bg-secondary rounded-md focus:ring-2 focus:ring-cortex-orange text-sm"
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="senior_dc">Senior DC</option>
                          <option value="dc">Domain Consultant</option>
                          <option value="se">Solutions Engineer</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <div className="text-cortex-text-primary">{user.department}</div>
                        <div className="text-sm text-cortex-text-muted">{user.title}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${{
                          'active': 'bg-cortex-success/20 text-cortex-success border border-cortex-success/30',
                          'inactive': 'bg-cortex-bg-secondary/50 text-cortex-text-muted border border-cortex-border-secondary/50',
                          'suspended': 'bg-cortex-error/20 text-cortex-error border border-cortex-error/30',
                          'pending': 'bg-cortex-warning/20 text-cortex-warning border border-cortex-warning/30'
                        }[user.status]}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {metrics ? (
                          <div>
                            <div className="text-cortex-text-primary font-mono">{metrics.actionsPerformed}</div>
                            <div className="text-xs text-cortex-text-muted">actions today</div>
                          </div>
                        ) : (
                          <span className="text-cortex-text-muted">No data</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-cortex-text-primary text-sm">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="btn-modern button-hover-lift cortex-interactive px-2 py-1 bg-cortex-blue hover:bg-cortex-blue-dark text-white rounded text-xs transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(user.id)}
                            className={`btn-modern button-hover-lift cortex-interactive px-2 py-1 rounded text-xs transition-colors ${
                              user.status === 'active' 
                                ? 'bg-cortex-error hover:bg-cortex-error-dark text-white'
                                : 'bg-cortex-success hover:bg-cortex-success-dark text-white'
                            }`}
                          >
                            {user.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const AnalyticsTab = () => {
    if (!systemMetrics) return <div>Loading...</div>;

    return (
      <div className="space-y-6">
        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="cortex-card-elevated p-6">
            <h3 className="text-lg font-bold text-cortex-text-primary mb-4">⚡ Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-cortex-text-muted">Average Load Time</span>
                <span className="text-cortex-text-primary font-mono">{systemMetrics.averageLoadTime}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cortex-text-muted">Error Rate</span>
                <span className="text-cortex-text-primary font-mono">{(systemMetrics.errorRate * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cortex-text-muted">Uptime</span>
                <span className="text-cortex-success font-mono">{systemMetrics.uptime}%</span>
              </div>
            </div>
          </div>

          <div className="cortex-card-elevated p-6">
            <h3 className="text-lg font-bold text-cortex-text-primary mb-4">📊 Usage Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-cortex-text-muted">TRRs Created</span>
                <span className="text-cortex-text-primary font-mono">{systemMetrics.trrVolume.created}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cortex-text-muted">SDWs Created</span>
                <span className="text-cortex-text-primary font-mono">{systemMetrics.sdwVolume.created}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cortex-text-muted">Retention Rate</span>
                <span className="text-cortex-text-primary font-mono">{Math.round((systemMetrics.retainedUsers / systemMetrics.totalUsers) * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="cortex-card-elevated p-6">
            <h3 className="text-lg font-bold text-cortex-text-primary mb-4">🏥 System Health</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-cortex-text-muted">CPU Usage</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-cortex-bg-secondary rounded-full h-2">
                    <div 
                      className="bg-cortex-blue h-2 rounded-full"
                      style={{ width: `${systemMetrics.systemHealth.cpu}%` }}
                    ></div>
                  </div>
                  <span className="text-cortex-text-primary font-mono text-sm">{systemMetrics.systemHealth.cpu}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cortex-text-muted">Memory</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-cortex-bg-secondary rounded-full h-2">
                    <div 
                      className="bg-cortex-warning h-2 rounded-full"
                      style={{ width: `${systemMetrics.systemHealth.memory}%` }}
                    ></div>
                  </div>
                  <span className="text-cortex-text-primary font-mono text-sm">{systemMetrics.systemHealth.memory}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cortex-text-muted">Storage</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-cortex-bg-secondary rounded-full h-2">
                    <div 
                      className="bg-cortex-success h-2 rounded-full"
                      style={{ width: `${systemMetrics.systemHealth.storage}%` }}
                    ></div>
                  </div>
                  <span className="text-cortex-text-primary font-mono text-sm">{systemMetrics.systemHealth.storage}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Activity Heatmap */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-cortex-text-primary mb-4">🔥 User Activity Heatmap</h3>
          <div className="text-cortex-text-muted text-sm">
            Activity tracking shows peak usage during business hours with TRR management being the most used feature.
          </div>
        </div>
      </div>
    );
  };

  const ActivityTab = () => {
    const [activities, setActivities] = useState<UserActivity[]>([]);
    
    useEffect(() => {
      const systemActivities = userManagementService.getSystemActivities(50);
      setActivities(systemActivities);
    }, []);

    const filteredActivities = activities.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      const now = new Date();
      
      switch (activityFilter) {
        case 'today':
          return activityDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return activityDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return activityDate >= monthAgo;
        default:
          return true;
      }
    });

    return (
      <div className="space-y-6">
        {/* Activity Filters */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-4">
            <span className="text-cortex-text-muted text-sm">Time Period:</span>
            <div className="flex gap-2">
              {(['all', 'today', 'week', 'month'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => setActivityFilter(period)}
                  className={`btn-modern button-hover-lift cortex-interactive px-3 py-1 rounded text-sm transition-colors capitalize ${
                    activityFilter === period
                      ? 'bg-cortex-cyan text-white'
                      : 'bg-cortex-bg-secondary text-cortex-text-muted hover:bg-cortex-bg-hover'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
            <div className="flex-1"></div>
            <span className="text-cortex-text-muted text-sm">{filteredActivities.length} activities</span>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="glass-card">
          <div className="p-4 border-b border-cortex-border-secondary">
            <h3 className="text-lg font-bold text-cortex-text-primary">📝 Recent Activity</h3>
          </div>
          <div className="max-h-96 overflow-y-auto terminal-scrollbar">
            {filteredActivities.length === 0 ? (
              <div className="p-8 text-center text-cortex-text-muted">
                No activities found for the selected time period.
              </div>
            ) : (
              <div className="divide-y divide-cortex-border-secondary">
                {filteredActivities.map(activity => {
                  const user = users.find(u => u.id === activity.userId);
                  const timestamp = new Date(activity.timestamp);
                  
                  return (
                    <div key={activity.id} className="p-4 hover:bg-cortex-bg-hover transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${{
                            true: 'bg-cortex-success',
                            false: 'bg-cortex-error'
                          }[activity.metadata.success.toString()]}`}></div>
                          <div>
                            <div className="text-cortex-text-primary text-sm">
                              <span className="font-medium">
                                {user ? `${user.firstName} ${user.lastName}` : 'Unknown User'}
                              </span>
                              <span className="text-cortex-text-muted ml-1">performed</span>
                              <span className="text-cortex-cyan ml-1 font-medium">
                                {activity.action.replace(/_/g, ' ')}
                              </span>
                              <span className="text-cortex-text-muted ml-1">in</span>
                              <span className="text-cortex-blue ml-1 capitalize">
                                {activity.feature.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <div className="text-xs text-cortex-text-muted mt-1">
                              {activity.metadata.page} • {activity.category}
                              {activity.performance.loadTime && (
                                <span> • {activity.performance.loadTime}ms</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-cortex-text-muted whitespace-nowrap">
                          {timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const SystemTab = () => {
    if (!systemMetrics) return <div>Loading...</div>;

    return (
      <div className="space-y-6">
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-cortex-text-primary mb-4">🏥 System Health Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="cortex-card-elevated p-4 text-center">
              <div className="text-2xl mb-2">💻</div>
              <div className="text-cortex-text-primary font-medium">CPU Usage</div>
              <div className="text-lg font-mono text-cortex-blue">{systemMetrics.systemHealth.cpu}%</div>
            </div>
            <div className="cortex-card-elevated p-4 text-center">
              <div className="text-2xl mb-2">🧠</div>
              <div className="text-cortex-text-primary font-medium">Memory Usage</div>
              <div className="text-lg font-mono text-cortex-warning">{systemMetrics.systemHealth.memory}%</div>
            </div>
            <div className="cortex-card-elevated p-4 text-center">
              <div className="text-2xl mb-2">💾</div>
              <div className="text-cortex-text-primary font-medium">Storage Usage</div>
              <div className="text-lg font-mono text-cortex-success">{systemMetrics.systemHealth.storage}%</div>
            </div>
            <div className="cortex-card-elevated p-4 text-center">
              <div className="text-2xl mb-2">🗄️</div>
              <div className="text-cortex-text-primary font-medium">Database</div>
              <div className={`text-lg font-mono ${{
                'healthy': 'text-cortex-success',
                'warning': 'text-cortex-warning',
                'critical': 'text-cortex-error'
              }[systemMetrics.systemHealth.database]}`}>
                {systemMetrics.systemHealth.database}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-cortex-text-muted">
          Additional system monitoring charts and logs would be displayed here in a production environment.
        </div>
      </div>
    );
  };

  const SettingsTab = () => (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-cortex-text-primary mb-4">🚀 Feature Flags</h3>
        <div className="space-y-3">
          {[{
            name: 'Beta Features',
            key: 'beta_features',
            description: 'Enable access to beta features for all users'
          }, {
            name: 'Advanced Analytics',
            key: 'advanced_analytics',
            description: 'Enable advanced analytics dashboard'
          }, {
            name: 'AI Recommendations',
            key: 'ai_recommendations',
            description: 'Enable AI-powered recommendations'
          }, {
            name: 'PDF Export',
            key: 'export_to_pdf',
            description: 'Allow PDF export functionality'
          }, {
            name: 'Team Collaboration',
            key: 'team_collaboration',
            description: 'Enable team collaboration features'
          }, {
            name: 'Mobile App',
            key: 'mobile_app',
            description: 'Enable mobile application access'
          }].map(flag => (
            <div key={flag.key} className="cortex-card p-3 flex items-center justify-between">
              <div>
                <div className="text-cortex-text-primary font-medium">{flag.name}</div>
                <div className="text-sm text-cortex-text-muted">{flag.description}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                {/* Use the systemFeatureFlags value for the checkbox initial state. */}
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked={!!systemFeatureFlags[flag.key]}
                />
                <div className="w-11 h-6 bg-cortex-bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cortex-cyan"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-cortex-text-primary mb-4">🔧 System Configuration</h3>
        <div className="text-cortex-text-muted">
          System configuration options would be available here for administrators.
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8">
      <div className="glass-card p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cortex-text-primary mb-2">⚙️ Management Dashboard</h1>
          <p className="text-cortex-text-muted">Comprehensive system oversight and user management</p>
          {isLoading && (
            <div className="mt-2 text-yellow-400 text-sm">🔄 Refreshing data...</div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-cortex-bg-secondary p-1 rounded-lg overflow-x-auto terminal-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 text-center transition-colors rounded-md cortex-interactive whitespace-nowrap min-w-fit ${
                activeTab === tab.id
                  ? 'bg-cortex-cyan text-white'
                  : 'text-cortex-text-muted hover:text-white hover:bg-cortex-bg-hover'
              }`}
              title={tab.description}
            >
              <div className="font-medium">{tab.icon} {tab.name}</div>
              <div className="text-xs opacity-75">{tab.description}</div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'activity' && <ActivityTab />}
          {activeTab === 'system' && <SystemTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-card p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto terminal-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-cortex-text-primary">👤 User Details</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-cortex-text-muted hover:text-white cortex-interactive"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-cortex-cyan to-cortex-blue rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                  </div>
                  <div>
                    <div className="text-xl font-bold text-cortex-text-primary">{selectedUser.firstName} {selectedUser.lastName}</div>
                    <div className="text-cortex-text-muted">{selectedUser.title} • {selectedUser.department}</div>
                    <div className="text-sm text-cortex-text-muted">{selectedUser.email}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-cortex-text-primary font-medium mb-2">Account Info</h4>
                    <div className="text-sm text-cortex-text-secondary space-y-1">
                      <div>Role: {selectedUser.role}</div>
                      <div>Status: {selectedUser.status}</div>
                      <div>Region: {selectedUser.region}</div>
                      <div>Timezone: {selectedUser.timezone}</div>
                      <div>Last Login: {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-cortex-text-primary font-medium mb-2">Activity Metrics</h4>
                    {userMetrics[selectedUser.id] ? (
                      <div className="text-sm text-cortex-text-secondary space-y-1">
                        <div>Actions Today: {userMetrics[selectedUser.id].actionsPerformed}</div>
                        <div>Time Spent: {userMetrics[selectedUser.id].totalTimeSpent}min</div>
                        <div>TRRs Created: {userMetrics[selectedUser.id].trrsCreated}</div>
                        <div>SDWs Created: {userMetrics[selectedUser.id].sdwsCreated}</div>
                        <div>Login Streak: {userMetrics[selectedUser.id].loginStreak} days</div>
                      </div>
                    ) : (
                      <div className="text-sm text-cortex-text-muted">No activity data available</div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="btn-modern button-hover-lift cortex-interactive px-4 py-2 bg-cortex-bg-secondary hover:bg-cortex-bg-hover text-cortex-text-primary rounded transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};