// legacy-orange: replaced by green per Cortex rebrand (2025-10-08)
/**
 * Management Dashboard
 * Comprehensive admin interface for user oversight, analytics, and system management
 */

import React, { useState, useEffect, useMemo, useCallback, ChangeEvent, FormEvent } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import CortexButton from './CortexButton';
import {
  userManagementService,
  UserProfile,
  UserActivity,
  UserMetrics,
  SystemMetrics,
  UserRole
} from '../lib/user-management';
import {
  platformSettingsService,
  FeatureFlagState,
  EnvironmentConfig,
  PlatformSettingsAuditEntry,
} from '../lib/platform-settings-service';

interface DashboardTab {
  id: string;
  name: string;
  icon: string;
  description: string;
}

type UserMutationState = {
  isSaving: boolean;
  error?: string;
};

export const ManagementDashboard: React.FC = () => {
  const { state, actions } = useAppState();
  const platformSettingsSnapshot = useMemo(() => platformSettingsService.getSnapshot(), []);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userMetrics, setUserMetrics] = useState<Record<string, UserMetrics>>({});
  const [activityFeed, setActivityFeed] = useState<UserActivity[]>([]);
  const [activityFilter, setActivityFilter] = useState<'all' | 'today' | 'week' | 'month'>('today');
  const [systemFeatureFlags, setSystemFeatureFlags] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlagState[]>(platformSettingsSnapshot.featureFlags);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [flagSavingKey, setFlagSavingKey] = useState<string | null>(null);
  const [environmentConfig, setEnvironmentConfig] = useState<EnvironmentConfig>(platformSettingsSnapshot.environment);
  const [environmentErrors, setEnvironmentErrors] = useState<Record<string, string>>({});
  const [environmentSaving, setEnvironmentSaving] = useState(false);
  const [auditLog, setAuditLog] = useState<PlatformSettingsAuditEntry[]>(platformSettingsSnapshot.auditLog);
  const [settingsMetadata, setSettingsMetadata] = useState<{ updatedAt: string; updatedBy: string } | null>({
    updatedAt: platformSettingsSnapshot.updatedAt,
    updatedBy: platformSettingsSnapshot.updatedBy,
  });
  const [userMutations, setUserMutations] = useState<Record<string, UserMutationState>>({});

  const setUserMutation = useCallback(
    (userId: string, mutation: Partial<UserMutationState>) => {
      setUserMutations((previous) => {
        const existing = previous[userId] ?? { isSaving: false };
        const next: UserMutationState = {
          ...existing,
          ...mutation,
        };
        return { ...previous, [userId]: next };
      });
    },
    [setUserMutations],
  );

  const clearUserMutation = useCallback(
    (userId: string) => {
      setUserMutations((previous) => {
        const { [userId]: _removed, ...rest } = previous;
        return rest;
      });
    },
    [setUserMutations],
  );

  const authUserId =
    state.auth.user?.id || state.auth.user?.email || 'system';
  const authUserRole = (state.auth.user?.role as UserRole | undefined) || 'analyst';

  const applyFeatureFlagSnapshotToUsers = useCallback((flags: FeatureFlagState[]) => {
    const snapshot = flags.reduce((acc, flag) => {
      acc[flag.key] = flag.enabled;
      return acc;
    }, {} as Record<string, boolean>);
    userManagementService.applyFeatureFlagSnapshot(snapshot);
  }, []);

  const loadPlatformSettings = useCallback(
    async (showLoading = false) => {
      if (showLoading) {
        setSettingsLoading(true);
      }

      try {
        const settings = await platformSettingsService.getSettings();
        setFeatureFlags(settings.featureFlags);
        setEnvironmentConfig(settings.environment);
        setAuditLog(settings.auditLog);
        setSettingsMetadata({ updatedAt: settings.updatedAt, updatedBy: settings.updatedBy });
        setEnvironmentErrors({});
        applyFeatureFlagSnapshotToUsers(settings.featureFlags);
      } catch (error) {
        console.error('Failed to load platform settings:', error);
        actions.notify('error', 'Failed to load platform settings');
      } finally {
        if (showLoading) {
          setSettingsLoading(false);
        }
      }
    },
    [actions, applyFeatureFlagSnapshotToUsers]
  );

  useEffect(() => {
    void loadPlatformSettings(true);
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      void loadPlatformSettings();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadPlatformSettings]);

  const loadDashboardData = useCallback(
    async (force = false) => {
      setIsLoading(true);
      try {
        let scope: 'all' | 'team' | 'self' = 'self';
        if (authUserRole === 'admin') {
          scope = 'all';
        } else if (authUserRole === 'manager') {
          scope = 'team';
        }

        const scopedUsers = await userManagementService.getUsers({
          scope,
          managerId: scope === 'team' ? authUserId : undefined,
          userId: authUserId,
          includeInactive: true,
          force,
        });

        setUsers(scopedUsers);
        setPage(0);
        setSelectedUser((previous) => {
          if (!scopedUsers.length) return null;
          if (!previous) return scopedUsers[0];
          return scopedUsers.find((user) => user.id === previous.id) || scopedUsers[0];
        });

        const userIds = scopedUsers.map((user) => user.id);
        if (userIds.length === 0) {
          setUserMetrics({});
          setSystemMetrics(null);
          setActivityFeed([]);
          setSystemFeatureFlags({});
          return;
        }

        const metricsMap = await userManagementService.getMetricsForUsers(userIds, { period: 'daily', force });
        setUserMetrics(metricsMap);

        const sysMetrics = await userManagementService.generateSystemMetrics(userIds, { period: 'daily', force });
        setSystemMetrics(sysMetrics);
        actions.updateData('analytics', sysMetrics);

        const activities = await userManagementService.getSystemActivities(100, { userIds, force });
        setActivityFeed(activities);

        setSystemFeatureFlags(userManagementService.getFeatureFlagSummary(userIds));
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        actions.notify('error', 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    },
    [actions, authUserId, authUserRole]
  );

  useEffect(() => {
    void loadDashboardData();
    const interval = setInterval(() => {
      void loadDashboardData();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  const handleFeatureFlagToggle = async (flagKey: string, enabled: boolean) => {
    const actor = {
      id: state.auth.user?.id || 'system',
      name: state.auth.user?.email || state.auth.user?.username || 'System Administrator',
    };

    setFlagSavingKey(flagKey);
    try {
      const { flag, settings } = await platformSettingsService.updateFeatureFlag(flagKey, enabled, actor);
      setFeatureFlags(settings.featureFlags);
      setAuditLog(settings.auditLog);
      setSettingsMetadata({ updatedAt: settings.updatedAt, updatedBy: settings.updatedBy });
      applyFeatureFlagSnapshotToUsers(settings.featureFlags);

      actions.notify('success', `${flag.name} ${enabled ? 'enabled' : 'disabled'}`);
      actions.logRBACEvent({
        userId: actor.id,
        userRole: state.auth.user?.role || 'admin',
        action: 'update',
        resource: `feature_flag:${flag.key}`,
        allowed: true,
        reason: `Set to ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Failed to update feature flag:', error);
      const message = error instanceof Error ? error.message : 'Failed to update feature flag';
      actions.notify('error', message);
      actions.logRBACEvent({
        userId: state.auth.user?.id || 'system',
        userRole: state.auth.user?.role || 'admin',
        action: 'update',
        resource: `feature_flag:${flagKey}`,
        allowed: false,
        reason: message,
      });
      await loadPlatformSettings();
    } finally {
      setFlagSavingKey(null);
    }
  };

  const handleEnvironmentChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = event.target as HTMLInputElement;
    const { name, type, value } = target;
    const nextValue = type === 'checkbox' ? target.checked : value;
    setEnvironmentConfig((prev) => ({
      ...prev,
      [name]: nextValue,
    } as EnvironmentConfig));

    setEnvironmentErrors((prev) => {
      if (!(name in prev)) {
        return prev;
      }
      const { [name]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const handleEnvironmentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEnvironmentSaving(true);

    const actor = {
      id: state.auth.user?.id || 'system',
      name: state.auth.user?.email || state.auth.user?.username || 'System Administrator',
    };

    try {
      const { settings } = await platformSettingsService.updateEnvironmentConfig(environmentConfig, actor);
      setEnvironmentConfig(settings.environment);
      setAuditLog(settings.auditLog);
      setSettingsMetadata({ updatedAt: settings.updatedAt, updatedBy: settings.updatedBy });
      setEnvironmentErrors({});

      actions.notify('success', 'Environment configuration saved');
      actions.logRBACEvent({
        userId: actor.id,
        userRole: state.auth.user?.role || 'admin',
        action: 'update',
        resource: 'environment_config',
        allowed: true,
        reason: `${settings.environment.environment} / ${settings.environment.releaseChannel}`,
      });
    } catch (error) {
      console.error('Failed to update environment configuration:', error);
      const validationErrors =
        error && typeof error === 'object' && 'validationErrors' in error
          ? (error as Error & { validationErrors: Record<string, string> }).validationErrors
          : {};

      if (Object.keys(validationErrors).length > 0) {
        setEnvironmentErrors(validationErrors);
        actions.notify('error', 'Please resolve the highlighted configuration issues.');
        actions.logRBACEvent({
          userId: actor.id,
          userRole: state.auth.user?.role || 'admin',
          action: 'update',
          resource: 'environment_config',
          allowed: false,
          reason: 'Validation failed',
        });
      } else {
        const message = error instanceof Error ? error.message : 'Failed to update environment configuration';
        actions.notify('error', message);
        actions.logRBACEvent({
          userId: actor.id,
          userRole: state.auth.user?.role || 'admin',
          action: 'update',
          resource: 'environment_config',
          allowed: false,
          reason: message,
        });
      }
    } finally {
      setEnvironmentSaving(false);
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
    const pageSize = 10;
    const teamOptions = useMemo(() => {
      const teamsMap = new Map<string, { id: string; name: string }>();
      users.forEach((user) => {
        (user.teams || []).forEach((team) => {
          if (team.id) {
            teamsMap.set(team.id, { id: team.id, name: team.name });
          }
        });
      });
      return Array.from(teamsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [users]);
    const filteredUsers = useMemo(() => {
      const query = searchTerm.toLowerCase().trim();
      return users.filter((user) => {
        const roleMatch = userFilter === 'all' || user.role === userFilter;
        const statusMatch = statusFilter === 'all' || user.status === statusFilter;
        const teamMatch = teamFilter === 'all' || (user.teams || []).some((team) => team.id === teamFilter);
        const normalized = `${user.firstName || ""} ${user.lastName || ""} ${user.email || ""}`.toLowerCase();
        const searchMatch = query.length === 0 || normalized.includes(query);
        return roleMatch && statusMatch && teamMatch && searchMatch;
      });
    }, [users, userFilter, statusFilter, teamFilter, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
    const paginatedUsers = filteredUsers.slice(page * pageSize, page * pageSize + pageSize);

    const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
      const targetUser = users.find((candidate) => candidate.id === userId);
      if (!targetUser) {
        return;
      }

      const previousUsersSnapshot = users.map((profile) => ({ ...profile }));
      const previousSelectedUser = selectedUser ? { ...selectedUser } : null;

      setUserMutation(userId, { isSaving: true, error: undefined });

      setUsers((currentUsers) =>
        currentUsers.map((profile) =>
          profile.id === userId
            ? { ...profile, role: newRole, updatedAt: new Date().toISOString() }
            : profile,
        ),
      );
      setSelectedUser((current) =>
        current && current.id === userId ? { ...current, role: newRole } : current,
      );

      try {
        await userManagementService.updateUser(userId, { role: newRole });
        await loadDashboardData(true);
        actions.notify(
          'success',
          `Updated ${targetUser.firstName} ${targetUser.lastName}'s role to ${newRole}`,
        );
        clearUserMutation(userId);
      } catch (error) {
        setUsers(previousUsersSnapshot);
        setSelectedUser(previousSelectedUser);
        const message = error instanceof Error ? error.message : 'Failed to update user role';
        setUserMutation(userId, { isSaving: false, error: message });
        actions.notify('error', message);
      }
    };

    const handleToggleUserStatus = async (userId: string) => {
      const targetUser = users.find((candidate) => candidate.id === userId);
      if (!targetUser) {
        return;
      }

      const previousUsersSnapshot = users.map((profile) => ({ ...profile }));
      const previousSelectedUser = selectedUser ? { ...selectedUser } : null;
      const nextStatus: UserProfile['status'] = targetUser.status === 'active' ? 'inactive' : 'active';

      setUserMutation(userId, { isSaving: true, error: undefined });

      setUsers((currentUsers) =>
        currentUsers.map((profile) =>
          profile.id === userId
            ? { ...profile, status: nextStatus, updatedAt: new Date().toISOString() }
            : profile,
        ),
      );
      setSelectedUser((current) =>
        current && current.id === userId ? { ...current, status: nextStatus } : current,
      );

      try {
        await userManagementService.updateUser(userId, { status: nextStatus });
        await loadDashboardData(true);
        actions.notify(
          'success',
          `${nextStatus === 'active' ? 'Activated' : 'Deactivated'} ${targetUser.firstName} ${targetUser.lastName}`,
        );
        clearUserMutation(userId);
      } catch (error) {
        setUsers(previousUsersSnapshot);
        setSelectedUser(previousSelectedUser);
        const message = error instanceof Error ? error.message : 'Failed to update user status';
        setUserMutation(userId, { isSaving: false, error: message });
        actions.notify('error', message);
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
                className="cortex-card p-2 border-cortex-border-secondary text-cortex-text-primary bg-cortex-bg-secondary rounded-md focus:ring-2 focus:ring-cortex-accent text-sm"
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
                className="cortex-card p-2 border-cortex-border-secondary text-cortex-text-primary bg-cortex-bg-secondary rounded-md focus:ring-2 focus:ring-cortex-accent text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-cortex-text-muted">Team:</span>
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="cortex-card p-2 border-cortex-border-secondary text-cortex-text-primary bg-cortex-bg-secondary rounded-md focus:ring-2 focus:ring-cortex-accent text-sm"
              >
                <option value="all">All Teams</option>
                {teamOptions.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-[220px]">
              <span className="text-sm text-cortex-text-muted">Search:</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Name or email"
                className="cortex-card w-full p-2 border-cortex-border-secondary text-sm bg-cortex-bg-secondary rounded-md focus:ring-2 focus:ring-cortex-accent"
              />
            </div>

            <div className="ml-auto text-sm text-cortex-text-muted">
              Showing {paginatedUsers.length} of {filteredUsers.length} users ({users.length} total)
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
                {paginatedUsers.map((user) => {
                  const metrics = userMetrics[user.id];
                  const mutation = userMutations[user.id];
                  const initials = `${(user.firstName || "")[0] || ""}${(user.lastName || "")[0] || ""}`.toUpperCase() || 'NA';
                  return (
                    <tr key={user.id} className="border-t border-cortex-border-secondary hover:bg-cortex-bg-hover">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-cortex-cyan to-cortex-blue rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {initials}
                          </div>
                          <div>
                            <div className="text-cortex-text-primary font-medium">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-cortex-text-muted">{user.email}</div>
                            {(user.teams?.length || 0) > 0 && (
                              <div className="text-xs text-cortex-text-muted">
                                Teams: {(user.teams || []).map((team) => team.name).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <select
                          value={user.role}
                          onChange={(e) => void handleUpdateUserRole(user.id, e.target.value as UserRole)}
                          className="cortex-card p-2 border-cortex-border-secondary text-cortex-text-primary bg-cortex-bg-secondary rounded-md focus:ring-2 focus:ring-cortex-accent text-sm"
                          disabled={Boolean(mutation?.isSaving)}
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
                        <div className="text-cortex-text-primary">{user.department || '—'}</div>
                        <div className="text-sm text-cortex-text-muted">{user.title || '—'}</div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            {
                              active: 'bg-cortex-success/20 text-cortex-success border border-cortex-success/30',
                              inactive: 'bg-cortex-bg-secondary/50 text-cortex-text-muted border border-cortex-border-secondary/50',
                              suspended: 'bg-cortex-error/20 text-cortex-error border border-cortex-error/30',
                              pending: 'bg-cortex-warning/20 text-cortex-warning border border-cortex-warning/30',
                            }[user.status]
                          }`}
                        >
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
                      <td className="p-4 text-sm text-cortex-text-muted">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—'}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex gap-2">
                            <CortexButton
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                              disabled={Boolean(mutation?.isSaving)}
                              ariaLabel={`View details for ${user.firstName} ${user.lastName}`}
                            >
                              View
                            </CortexButton>
                            <CortexButton
                              variant={user.status === 'active' ? 'danger' : 'success'}
                              size="sm"
                              onClick={() => void handleToggleUserStatus(user.id)}
                              disabled={Boolean(mutation?.isSaving)}
                              loading={Boolean(mutation?.isSaving)}
                            >
                              {mutation?.isSaving
                                ? 'Updating…'
                                : user.status === 'active'
                                  ? 'Deactivate'
                                  : 'Activate'}
                            </CortexButton>
                          </div>
                          {mutation?.error && (
                            <div className="text-xs text-cortex-error" role="alert">
                              {mutation.error}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-cortex-border-secondary bg-cortex-bg-secondary/30">
            <div className="text-xs text-cortex-text-muted">
              Page {page + 1} of {totalPages}
            </div>
            <div className="flex gap-2">
              <CortexButton
                variant="ghost"
                size="sm"
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                disabled={page === 0}
                ariaLabel="Go to previous page"
              >
                Previous
              </CortexButton>
              <CortexButton
                variant="ghost"
                size="sm"
                onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                disabled={page + 1 >= totalPages}
                ariaLabel="Go to next page"
              >
                Next
              </CortexButton>
            </div>
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
    const filteredActivities = useMemo(() => activityFeed.filter(activity => {
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
    }), [activityFeed, activityFilter]);

    return (
      <div className="space-y-6">
        {/* Activity Filters */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-4">
            <span className="text-cortex-text-muted text-sm">Time Period:</span>
            <div className="flex gap-2">
              {(['all', 'today', 'week', 'month'] as const).map(period => (
                <CortexButton
                  key={period}
                  variant={activityFilter === period ? 'info' : 'ghost'}
                  size="sm"
                  onClick={() => setActivityFilter(period)}
                  ariaLabel={`Show ${period} activity`}
                  className="capitalize"
                  glow={activityFilter === period}
                >
                  {period}
                </CortexButton>
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

  const SettingsTab = () => {
    const formatTimestamp = (timestamp: string) => {
      try {
        return new Date(timestamp).toLocaleString();
      } catch (error) {
        console.warn('Failed to format timestamp', timestamp, error);
        return timestamp;
      }
    };

    const renderMetadataChips = (metadata?: Record<string, string>) => {
      if (!metadata) return null;
      return (
        <div className="mt-1 flex flex-wrap gap-2">
          {Object.entries(metadata).map(([key, value]) => (
            <span
              key={`${key}-${value}`}
              className="text-xs font-mono bg-cortex-bg-secondary text-cortex-text-muted px-2 py-1 rounded"
            >
              {key}: {value}
            </span>
          ))}
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <div className="glass-card p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-bold text-cortex-text-primary">🚀 Feature Flags</h3>
              <p className="text-sm text-cortex-text-muted">
                Manage remote configuration for key platform capabilities. Changes persist across sessions for all admins.
              </p>
            </div>
            <div className="flex items-start gap-3 text-xs text-cortex-text-muted">
              {settingsMetadata && (
                <div className="text-right">
                  <div className="uppercase tracking-wide text-cortex-text-secondary">Last synced</div>
                  <div className="font-mono text-cortex-text-primary">{formatTimestamp(settingsMetadata.updatedAt)}</div>
                  <div className="mt-1">by {settingsMetadata.updatedBy}</div>
                </div>
              )}
              <CortexButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void loadPlatformSettings(true)}
                disabled={settingsLoading || flagSavingKey !== null || environmentSaving}
                loading={settingsLoading}
                ariaLabel="Refresh platform settings"
              >
                {settingsLoading ? 'Syncing…' : 'Refresh'}
              </CortexButton>
            </div>
          </div>

          <div className="space-y-3">
            {featureFlags.length === 0 && (
              <div className="text-sm text-cortex-text-muted">No feature flags configured in remote settings.</div>
            )}

            {featureFlags.map((flag) => (
              <div
                key={flag.key}
                className="cortex-card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <div className="text-cortex-text-primary font-medium">
                    {flag.name}
                    <span className="ml-2 text-xs uppercase tracking-wide text-cortex-text-muted">{flag.category}</span>
                  </div>
                  <div className="text-sm text-cortex-text-muted">{flag.description}</div>
                  <div className="text-xs text-cortex-text-muted mt-1">
                    Last updated {formatTimestamp(flag.lastModified)} by {flag.modifiedBy}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {flagSavingKey === flag.key && (
                    <span className="text-xs text-cortex-warning font-semibold">Saving…</span>
                  )}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={flag.enabled}
                      onChange={(event) => handleFeatureFlagToggle(flag.key, event.target.checked)}
                      disabled={flagSavingKey === flag.key || settingsLoading}
                    />
                    <div className="w-11 h-6 bg-cortex-bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cortex-cyan"></div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-cortex-text-primary mb-1">🔧 Environment Configuration</h3>
          <p className="text-sm text-cortex-text-muted mb-4">
            Configure API routing, analytics targets, and release cadence for the selected environment.
          </p>
          <form onSubmit={handleEnvironmentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-cortex-text-secondary" htmlFor="environment">
                  Deployment Environment
                </label>
                <select
                  id="environment"
                  name="environment"
                  value={environmentConfig.environment}
                  onChange={handleEnvironmentChange}
                  className={`cortex-card p-2 w-full bg-cortex-bg-secondary rounded-md focus:ring-2 transition-colors ${
                    environmentErrors.environment
                      ? 'border border-cortex-error/70 focus:ring-cortex-error text-cortex-error'
                      : 'border border-cortex-border-secondary focus:ring-cortex-accent'
                  }`}
                >
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                  <option value="qa">QA</option>
                  <option value="development">Development</option>
                </select>
                {environmentErrors.environment && (
                  <div className="text-xs text-cortex-error mt-1">{environmentErrors.environment}</div>
                )}
              </div>

              <div>
                <label className="text-sm text-cortex-text-secondary" htmlFor="releaseChannel">
                  Release Channel
                </label>
                <select
                  id="releaseChannel"
                  name="releaseChannel"
                  value={environmentConfig.releaseChannel}
                  onChange={handleEnvironmentChange}
                  className={`cortex-card p-2 w-full bg-cortex-bg-secondary rounded-md focus:ring-2 transition-colors ${
                    environmentErrors.releaseChannel
                      ? 'border border-cortex-error/70 focus:ring-cortex-error text-cortex-error'
                      : 'border border-cortex-border-secondary focus:ring-cortex-accent'
                  }`}
                >
                  <option value="stable">Stable</option>
                  <option value="beta">Beta</option>
                  <option value="canary">Canary</option>
                </select>
                {environmentErrors.releaseChannel && (
                  <div className="text-xs text-cortex-error mt-1">{environmentErrors.releaseChannel}</div>
                )}
              </div>

              <div>
                <label className="text-sm text-cortex-text-secondary" htmlFor="apiBaseUrl">
                  API Base URL
                </label>
                <input
                  id="apiBaseUrl"
                  name="apiBaseUrl"
                  type="url"
                  value={environmentConfig.apiBaseUrl}
                  onChange={handleEnvironmentChange}
                  className={`cortex-card p-2 w-full bg-cortex-bg-secondary rounded-md focus:ring-2 transition-colors ${
                    environmentErrors.apiBaseUrl
                      ? 'border border-cortex-error/70 focus:ring-cortex-error text-cortex-error'
                      : 'border border-cortex-border-secondary focus:ring-cortex-accent'
                  }`}
                  placeholder="https://api.henryreed.ai"
                />
                {environmentErrors.apiBaseUrl && (
                  <div className="text-xs text-cortex-error mt-1">{environmentErrors.apiBaseUrl}</div>
                )}
              </div>

              <div>
                <label className="text-sm text-cortex-text-secondary" htmlFor="analyticsDataset">
                  Analytics Dataset
                </label>
                <input
                  id="analyticsDataset"
                  name="analyticsDataset"
                  type="text"
                  value={environmentConfig.analyticsDataset}
                  onChange={handleEnvironmentChange}
                  className={`cortex-card p-2 w-full bg-cortex-bg-secondary rounded-md focus:ring-2 transition-colors ${
                    environmentErrors.analyticsDataset
                      ? 'border border-cortex-error/70 focus:ring-cortex-error text-cortex-error'
                      : 'border border-cortex-border-secondary focus:ring-cortex-accent'
                  }`}
                  placeholder="prod_cortex_events"
                />
                {environmentErrors.analyticsDataset && (
                  <div className="text-xs text-cortex-error mt-1">{environmentErrors.analyticsDataset}</div>
                )}
              </div>

              <div>
                <label className="text-sm text-cortex-text-secondary" htmlFor="region">
                  Primary Region
                </label>
                <input
                  id="region"
                  name="region"
                  type="text"
                  value={environmentConfig.region}
                  onChange={handleEnvironmentChange}
                  className={`cortex-card p-2 w-full bg-cortex-bg-secondary rounded-md focus:ring-2 transition-colors ${
                    environmentErrors.region
                      ? 'border border-cortex-error/70 focus:ring-cortex-error text-cortex-error'
                      : 'border border-cortex-border-secondary focus:ring-cortex-accent'
                  }`}
                  placeholder="us-central1"
                />
                {environmentErrors.region && (
                  <div className="text-xs text-cortex-error mt-1">{environmentErrors.region}</div>
                )}
              </div>

              <div className="md:col-span-2">
                <div className="cortex-card p-4 flex items-center justify-between">
                  <div>
                    <div className="text-cortex-text-primary font-medium">Maintenance Mode</div>
                    <div className="text-xs text-cortex-text-muted">
                      Toggle to broadcast planned downtime banners and limit write operations.
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="maintenanceMode"
                      className="sr-only peer"
                      checked={environmentConfig.maintenanceMode}
                      onChange={handleEnvironmentChange}
                    />
                    <div className="w-11 h-6 bg-cortex-bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cortex-warning"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="text-xs text-cortex-text-muted">
                Changes are tracked in the audit log for compliance reviews.
              </div>
              <CortexButton
                type="submit"
                variant="primary"
                size="md"
                loading={environmentSaving}
                disabled={environmentSaving}
                ariaLabel="Save environment configuration"
              >
                {environmentSaving ? 'Saving configuration…' : 'Save configuration'}
              </CortexButton>
            </div>
          </form>
        </div>

        <div className="glass-card p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h3 className="text-lg font-bold text-cortex-text-primary">🛡️ Recent Platform Changes</h3>
            <span className="text-xs text-cortex-text-muted">Audit events retained locally for demo purposes</span>
          </div>
          <div className="space-y-3">
            {auditLog.slice(0, 5).map((entry) => (
              <div key={entry.id} className="cortex-card p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <div className="text-cortex-text-primary font-medium">{entry.message}</div>
                    <div className="text-xs text-cortex-text-muted">{formatTimestamp(entry.timestamp)}</div>
                  </div>
                  <div className="text-xs text-cortex-text-muted">{entry.actor}</div>
                </div>
                {renderMetadataChips(entry.metadata)}
              </div>
            ))}

            {auditLog.length === 0 && (
              <div className="text-sm text-cortex-text-muted">No recent configuration changes recorded.</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      id="management-control-center"
      aria-labelledby="management-control-center-heading"
      className="p-8 space-y-8 scroll-mt-28"
    >
      <div className="glass-card p-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            id="management-control-center-heading"
            className="text-3xl font-bold text-cortex-text-primary mb-2"
          >
            ⚙️ Management Dashboard
          </h1>
          <p className="text-cortex-text-muted">Comprehensive system oversight and user management</p>
          {isLoading && (
            <div className="mt-2 text-yellow-400 text-sm">🔄 Refreshing data...</div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-cortex-bg-secondary p-1 rounded-lg overflow-x-auto terminal-scrollbar">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <CortexButton
                key={tab.id}
                variant="ghost"
                size="md"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 whitespace-nowrap min-w-fit px-4 py-2 ${
                  isActive
                    ? 'bg-cortex-cyan text-white border-cortex-cyan'
                    : 'text-cortex-text-muted hover:text-white hover:bg-cortex-bg-hover'
                }`}
                fullWidth
                glow={isActive}
                ariaLabel={`Switch to ${tab.name} tab`}
                tooltip={tab.description}
              >
                <span className="flex flex-col items-center text-center leading-tight">
                  <span className="font-medium">{tab.icon} {tab.name}</span>
                  <span className="text-xs opacity-75">{tab.description}</span>
                </span>
              </CortexButton>
            );
          })}
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
                <CortexButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                  ariaLabel="Close user details"
                >
                  ✕
                </CortexButton>
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
                  <CortexButton
                    variant="ghost"
                    size="md"
                    onClick={() => setSelectedUser(null)}
                    ariaLabel="Close user details"
                  >
                    Close
                  </CortexButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
