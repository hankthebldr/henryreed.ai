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
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-900/20 p-6 rounded-lg border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-blue-300">{systemMetrics.totalUsers}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
            <div className="mt-2 text-xs text-blue-400">
              +{systemMetrics.newUsers} new this period
            </div>
          </div>

          <div className="bg-green-900/20 p-6 rounded-lg border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium">Active Users</p>
                <p className="text-3xl font-bold text-green-300">{systemMetrics.activeUsers}</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
            <div className="mt-2 text-xs text-green-400">
              {Math.round((systemMetrics.activeUsers / systemMetrics.totalUsers) * 100)}% active rate
            </div>
          </div>

          <div className="bg-yellow-900/20 p-6 rounded-lg border border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-400 text-sm font-medium">TRR Volume</p>
                <p className="text-3xl font-bold text-yellow-300">{systemMetrics.trrVolume.created}</p>
              </div>
              <div className="text-3xl">📋</div>
            </div>
            <div className="mt-2 text-xs text-yellow-400">
              {systemMetrics.trrVolume.completed} completed
            </div>
          </div>

          <div className="bg-purple-900/20 p-6 rounded-lg border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-sm font-medium">System Health</p>
                <p className="text-3xl font-bold text-purple-300">{systemMetrics.uptime}%</p>
              </div>
              <div className="text-3xl">⚡</div>
            </div>
            <div className="mt-2 text-xs text-purple-400">
              {systemMetrics.averageLoadTime}ms avg load
            </div>
          </div>
        </div>

        {/* Feature Adoption */}
        <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">🚀 Feature Adoption</h3>
          <div className="space-y-3">
            {Object.entries(systemMetrics.featureAdoption).map(([feature, data]) => (
              <div key={feature} className="flex items-center justify-between p-3 bg-gray-800/30 rounded">
                <div>
                  <div className="text-white font-medium capitalize">{feature.replace('_', ' ')}</div>
                  <div className="text-sm text-gray-400">{data.totalUsers} users</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-cyan-500 h-2 rounded-full"
                      style={{ width: `${data.adoptionRate}%` }}
                    ></div>
                  </div>
                  <span className="text-cyan-400 font-mono text-sm">{data.adoptionRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">🏆 Most Active Users</h3>
          <div className="space-y-3">
            {topUsers.map(({ user, metrics }, index) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded hover:bg-gray-700/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-white font-medium">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-gray-400">{user.title} • {user.department}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-cyan-400 font-mono">{metrics?.actionsPerformed || 0}</div>
                  <div className="text-xs text-gray-400">actions today</div>
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
        <div className="bg-gray-900/50 p-4 rounded border border-gray-700">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Role:</span>
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value as UserRole | 'all')}
                className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
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
              <span className="text-sm text-gray-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="flex-1"></div>

            <div className="text-sm text-gray-400">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-900/50 rounded border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left p-4 text-gray-300 font-medium">User</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Role</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Department</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Activity</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Last Login</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => {
                  const metrics = userMetrics[user.id];
                  return (
                    <tr key={user.id} className="border-t border-gray-700 hover:bg-gray-800/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div>
                            <div className="text-white font-medium">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateUserRole(user.id, e.target.value as UserRole)}
                          className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
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
                        <div className="text-white">{user.department}</div>
                        <div className="text-sm text-gray-400">{user.title}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.status === 'active' ? 'bg-green-900/20 text-green-400 border border-green-500/30' :
                          user.status === 'inactive' ? 'bg-gray-900/20 text-gray-400 border border-gray-500/30' :
                          user.status === 'suspended' ? 'bg-red-900/20 text-red-400 border border-red-500/30' :
                          'bg-yellow-900/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {metrics ? (
                          <div>
                            <div className="text-white font-mono">{metrics.actionsPerformed}</div>
                            <div className="text-xs text-gray-400">actions today</div>
                          </div>
                        ) : (
                          <span className="text-gray-500">No data</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-white text-sm">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(user.id)}
                            className={`px-2 py-1 rounded text-xs transition-colors ${
                              user.status === 'active' 
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
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
          <div className="bg-gray-900/50 p-6 rounded border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">⚡ Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Average Load Time</span>
                <span className="text-white font-mono">{systemMetrics.averageLoadTime}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Error Rate</span>
                <span className="text-white font-mono">{(systemMetrics.errorRate * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Uptime</span>
                <span className="text-green-400 font-mono">{systemMetrics.uptime}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 p-6 rounded border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">📊 Usage Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">TRRs Created</span>
                <span className="text-white font-mono">{systemMetrics.trrVolume.created}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">SDWs Created</span>
                <span className="text-white font-mono">{systemMetrics.sdwVolume.created}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Retention Rate</span>
                <span className="text-white font-mono">{Math.round((systemMetrics.retainedUsers / systemMetrics.totalUsers) * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 p-6 rounded border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">🏥 System Health</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">CPU Usage</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${systemMetrics.systemHealth.cpu}%` }}
                    ></div>
                  </div>
                  <span className="text-white font-mono text-sm">{systemMetrics.systemHealth.cpu}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Memory</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${systemMetrics.systemHealth.memory}%` }}
                    ></div>
                  </div>
                  <span className="text-white font-mono text-sm">{systemMetrics.systemHealth.memory}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Storage</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${systemMetrics.systemHealth.storage}%` }}
                    ></div>
                  </div>
                  <span className="text-white font-mono text-sm">{systemMetrics.systemHealth.storage}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Activity Heatmap */}
        <div className="bg-gray-900/50 p-6 rounded border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">🔥 User Activity Heatmap</h3>
          <div className="text-gray-400 text-sm">
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
        <div className="bg-gray-900/50 p-4 rounded border border-gray-700">
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">Time Period:</span>
            <div className="flex gap-2">
              {(['all', 'today', 'week', 'month'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => setActivityFilter(period)}
                  className={`px-3 py-1 rounded text-sm transition-colors capitalize ${
                    activityFilter === period
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
            <div className="flex-1"></div>
            <span className="text-gray-400 text-sm">{filteredActivities.length} activities</span>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-gray-900/50 rounded border border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-bold text-white">📝 Recent Activity</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {filteredActivities.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No activities found for the selected time period.
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {filteredActivities.map(activity => {
                  const user = users.find(u => u.id === activity.userId);
                  const timestamp = new Date(activity.timestamp);
                  
                  return (
                    <div key={activity.id} className="p-4 hover:bg-gray-800/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            activity.metadata.success ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <div>
                            <div className="text-white text-sm">
                              <span className="font-medium">
                                {user ? `${user.firstName} ${user.lastName}` : 'Unknown User'}
                              </span>
                              <span className="text-gray-400 ml-1">performed</span>
                              <span className="text-cyan-400 ml-1 font-medium">
                                {activity.action.replace(/_/g, ' ')}
                              </span>
                              <span className="text-gray-400 ml-1">in</span>
                              <span className="text-blue-400 ml-1 capitalize">
                                {activity.feature.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {activity.metadata.page} • {activity.category}
                              {activity.performance.loadTime && (
                                <span> • {activity.performance.loadTime}ms</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 whitespace-nowrap">
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
        <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 p-6 rounded-lg border border-green-500/30">
          <h2 className="text-xl font-bold text-green-400 mb-4">🏥 System Health Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">💻</div>
              <div className="text-white font-medium">CPU Usage</div>
              <div className="text-lg font-mono text-blue-400">{systemMetrics.systemHealth.cpu}%</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🧠</div>
              <div className="text-white font-medium">Memory Usage</div>
              <div className="text-lg font-mono text-yellow-400">{systemMetrics.systemHealth.memory}%</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">💾</div>
              <div className="text-white font-medium">Storage Usage</div>
              <div className="text-lg font-mono text-green-400">{systemMetrics.systemHealth.storage}%</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🗄️</div>
              <div className="text-white font-medium">Database</div>
              <div className={`text-lg font-mono ${
                systemMetrics.systemHealth.database === 'healthy' ? 'text-green-400' :
                systemMetrics.systemHealth.database === 'warning' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {systemMetrics.systemHealth.database}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-400">
          Additional system monitoring charts and logs would be displayed here in a production environment.
        </div>
      </div>
    );
  };

  const SettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-900/50 p-6 rounded border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">🚀 Feature Flags</h3>
        <div className="space-y-3">
          {[
            { name: 'Beta Features', key: 'beta_features', description: 'Enable access to beta features for all users' },
            { name: 'Advanced Analytics', key: 'advanced_analytics', description: 'Enable advanced analytics dashboard' },
            { name: 'AI Recommendations', key: 'ai_recommendations', description: 'Enable AI-powered recommendations' },
            { name: 'PDF Export', key: 'export_to_pdf', description: 'Allow PDF export functionality' },
            { name: 'Team Collaboration', key: 'team_collaboration', description: 'Enable team collaboration features' },
            { name: 'Mobile App', key: 'mobile_app', description: 'Enable mobile application access' }
          ].map(flag => (
            <div key={flag.key} className="flex items-center justify-between p-3 bg-gray-800/30 rounded">
              <div>
                <div className="text-white font-medium">{flag.name}</div>
                <div className="text-sm text-gray-400">{flag.description}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={flag.key !== 'beta_features'} />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900/50 p-6 rounded border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">🔧 System Configuration</h3>
        <div className="text-gray-400">
          System configuration options would be available here for administrators.
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">⚙️ Management Dashboard</h1>
          <p className="text-gray-400">Comprehensive system oversight and user management</p>
          {isLoading && (
            <div className="mt-2 text-yellow-400 text-sm">🔄 Refreshing data...</div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-800/30 p-1 rounded-lg overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-center transition-colors rounded-lg whitespace-nowrap min-w-fit ${
                activeTab === tab.id
                  ? 'bg-cyan-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
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
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">👤 User Details</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{selectedUser.firstName} {selectedUser.lastName}</div>
                    <div className="text-gray-400">{selectedUser.title} • {selectedUser.department}</div>
                    <div className="text-sm text-gray-500">{selectedUser.email}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-white font-medium mb-2">Account Info</h4>
                    <div className="text-sm text-gray-300 space-y-1">
                      <div>Role: {selectedUser.role}</div>
                      <div>Status: {selectedUser.status}</div>
                      <div>Region: {selectedUser.region}</div>
                      <div>Timezone: {selectedUser.timezone}</div>
                      <div>Last Login: {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2">Activity Metrics</h4>
                    {userMetrics[selectedUser.id] ? (
                      <div className="text-sm text-gray-300 space-y-1">
                        <div>Actions Today: {userMetrics[selectedUser.id].actionsPerformed}</div>
                        <div>Time Spent: {userMetrics[selectedUser.id].totalTimeSpent}min</div>
                        <div>TRRs Created: {userMetrics[selectedUser.id].trrsCreated}</div>
                        <div>SDWs Created: {userMetrics[selectedUser.id].sdwsCreated}</div>
                        <div>Login Streak: {userMetrics[selectedUser.id].loginStreak} days</div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No activity data available</div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
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