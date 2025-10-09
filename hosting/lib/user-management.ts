/**
 * User Management System
 * Comprehensive user authentication, profiles, roles, and permissions
 */

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department: string;
  title: string;
  region: string;
  timezone: string;
  avatar?: string;
  
  // Account Status
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  
  // Preferences
  preferences: UserPreferences;
  
  // Feature Access
  permissions: UserPermissions;
  featureFlags: Record<string, boolean>;
  
  // Onboarding
  onboardingCompleted: boolean;
  onboardingStep?: string;
  
  // Analytics Consent
  analyticsConsent: boolean;
  dataRetentionConsent: boolean;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto';
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  
  // Notifications
  notifications: {
    email: boolean;
    browser: boolean;
    trrUpdates: boolean;
    sdwReminders: boolean;
    systemAlerts: boolean;
  };
  
  // Dashboard
  dashboardLayout: string;
  defaultView: string;
  
  // Privacy
  profileVisibility: 'public' | 'team' | 'private';
  activityTracking: boolean;
}

export interface UserPermissions {
  // Core Features
  trrManagement: {
    create: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
    view: 'own' | 'team' | 'all';
  };
  
  sdwManagement: {
    create: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
    export: boolean;
    view: 'own' | 'team' | 'all';
  };
  
  povManagement: {
    create: boolean;
    edit: boolean;
    delete: boolean;
    view: 'own' | 'team' | 'all';
  };
  
  // Analytics and Reporting
  analytics: {
    viewReports: boolean;
    exportData: boolean;
    viewTeamMetrics: boolean;
    viewSystemMetrics: boolean;
  };
  
  // Administration
  admin: {
    userManagement: boolean;
    systemSettings: boolean;
    auditLogs: boolean;
    featureFlags: boolean;
  };
  
  // AI Features
  aiAssistant: {
    access: boolean;
    advancedFeatures: boolean;
    dataTraining: boolean;
  };
}

export type UserRole = 'admin' | 'manager' | 'senior_dc' | 'dc' | 'se' | 'viewer';

export interface UserSession {
  id: string;
  userId: string;
  deviceInfo: {
    userAgent: string;
    ip: string;
    location?: string;
    device: string;
    browser: string;
  };
  
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  
  // Security
  isActive: boolean;
  loginMethod: 'password' | 'sso' | 'oauth';
  
  // Feature Usage
  featuresUsed: string[];
  currentPage?: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  sessionId: string;
  
  // Activity Details
  action: string;
  feature: string;
  category: 'navigation' | 'crud' | 'export' | 'analytics' | 'system';
  
  // Context
  metadata: {
    page: string;
    component?: string;
    duration?: number;
    success: boolean;
    errorMessage?: string;
    
    // Business Context
    trrId?: string;
    sdwId?: string;
    povId?: string;
    customerId?: string;
  };
  
  // Performance
  performance: {
    loadTime?: number;
    responseTime?: number;
    memoryUsage?: number;
  };
  
  timestamp: string;
}

export interface UserMetrics {
  userId: string;
  period: 'daily' | 'weekly' | 'monthly';
  date: string;
  
  // Usage Metrics
  sessionCount: number;
  totalTimeSpent: number; // minutes
  pagesViewed: number;
  actionsPerformed: number;
  
  // Feature Usage
  featuresUsed: Record<string, number>;
  mostUsedFeature: string;
  
  // Productivity Metrics
  trrsCreated: number;
  trrsCompleted: number;
  sdwsCreated: number;
  sdwsCompleted: number;
  povsManaged: number;
  
  // Performance
  averageTaskTime: number;
  errorRate: number;
  
  // Engagement
  loginStreak: number;
  helpDocumentsAccessed: number;
  aiQueriesCount: number;
}

export interface SystemMetrics {
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  timestamp: string;
  
  // User Metrics
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  retainedUsers: number;
  
  // Feature Adoption
  featureAdoption: Record<string, {
    totalUsers: number;
    activeUsers: number;
    adoptionRate: number;
  }>;
  
  // Performance
  averageLoadTime: number;
  errorRate: number;
  uptime: number;
  
  // Business Metrics
  trrVolume: {
    created: number;
    completed: number;
    averageTime: number;
  };
  
  sdwVolume: {
    created: number;
    completed: number;
    averageTime: number;
  };
  
  // System Health
  systemHealth: {
    cpu: number;
    memory: number;
    storage: number;
    database: 'healthy' | 'warning' | 'critical';
  };
}

/**
 * User Management Service
 */
export class UserManagementService {
  private users: Record<string, UserProfile> = {};
  private sessions: Record<string, UserSession> = {};
  private activities: UserActivity[] = [];
  private metrics: UserMetrics[] = [];
  private systemMetrics: SystemMetrics[] = [];

  constructor() {
    this.initializeDefaultUsers();
    this.initializeDemoData();
  }
  
  // User Management
  async createUser(userData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
    const user: UserProfile = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      permissions: this.getDefaultPermissions(userData.role),
      featureFlags: this.getDefaultFeatureFlags(),
      onboardingCompleted: false
    };
    
    this.users[user.id] = user;
    this.logActivity(user.id, '', 'user_created', 'system', { success: true });
    
    return user;
  }
  
  async authenticateUser(email: string, password: string): Promise<{ user: UserProfile; session: UserSession } | null> {
    // In production, this would verify against secure password storage
    const user = Object.values(this.users).find(u => u.email === email);
    if (!user || user.status !== 'active') return null;
    
    const session = await this.createSession(user.id, {
      userAgent: 'Demo Browser',
      ip: '127.0.0.1',
      device: 'Desktop',
      browser: 'Chrome'
    });
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    user.updatedAt = new Date().toISOString();
    
    this.logActivity(user.id, session.id, 'user_login', 'system', { success: true });
    
    return { user, session };
  }
  
  async createSession(userId: string, deviceInfo: UserSession['deviceInfo']): Promise<UserSession> {
    const session: UserSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      deviceInfo,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      isActive: true,
      loginMethod: 'password',
      featuresUsed: []
    };
    
    this.sessions[session.id] = session;
    return session;
  }
  
  // Activity Tracking
  logActivity(
    userId: string,
    sessionId: string,
    action: string,
    feature: string,
    metadata: Partial<UserActivity['metadata']> = {}
  ): void {
    const activity: UserActivity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      sessionId,
      action,
      feature,
      category: this.categorizeAction(action),
      metadata: {
        page: metadata.page || 'unknown',
        success: metadata.success ?? true,
        ...metadata
      },
      performance: {},
      timestamp: new Date().toISOString()
    };
    
    this.activities.push(activity);
    
    // Update session
    if (sessionId && this.sessions[sessionId]) {
      this.sessions[sessionId].lastActivity = activity.timestamp;
      if (!this.sessions[sessionId].featuresUsed.includes(feature)) {
        this.sessions[sessionId].featuresUsed.push(feature);
      }
    }
    
    // Cleanup old activities (keep last 10000)
    if (this.activities.length > 10000) {
      this.activities = this.activities.slice(-8000);
    }
  }
  
  private categorizeAction(action: string): UserActivity['category'] {
    if (action.includes('navigate') || action.includes('page')) return 'navigation';
    if (action.includes('create') || action.includes('update') || action.includes('delete')) return 'crud';
    if (action.includes('export') || action.includes('download')) return 'export';
    if (action.includes('analytics') || action.includes('report')) return 'analytics';
    return 'system';
  }
  
  // Analytics and Metrics
  generateUserMetrics(userId: string, period: 'daily' | 'weekly' | 'monthly'): UserMetrics {
    const user = this.users[userId];
    if (!user) throw new Error('User not found');
    
    const now = new Date();
    const periodStart = this.getPeriodStart(now, period);
    
    const userActivities = this.activities.filter(a => 
      a.userId === userId && 
      new Date(a.timestamp) >= periodStart
    );
    
    const userSessions = Object.values(this.sessions).filter(s => 
      s.userId === userId && 
      new Date(s.createdAt) >= periodStart
    );
    
    // Calculate feature usage
    const featureUsage: Record<string, number> = {};
    userActivities.forEach(a => {
      featureUsage[a.feature] = (featureUsage[a.feature] || 0) + 1;
    });
    
    const mostUsedFeature = Object.entries(featureUsage)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';
    
    // Calculate time spent
    const totalTimeSpent = userSessions.reduce((total, session) => {
      const start = new Date(session.createdAt).getTime();
      const end = new Date(session.lastActivity).getTime();
      return total + Math.max(0, (end - start) / 1000 / 60); // minutes
    }, 0);
    
    return {
      userId,
      period,
      date: now.toISOString().split('T')[0],
      sessionCount: userSessions.length,
      totalTimeSpent: Math.round(totalTimeSpent),
      pagesViewed: userActivities.filter(a => a.category === 'navigation').length,
      actionsPerformed: userActivities.length,
      featuresUsed: featureUsage,
      mostUsedFeature,
      trrsCreated: userActivities.filter(a => a.action === 'trr_created').length,
      trrsCompleted: userActivities.filter(a => a.action === 'trr_completed').length,
      sdwsCreated: userActivities.filter(a => a.action === 'sdw_created').length,
      sdwsCompleted: userActivities.filter(a => a.action === 'sdw_completed').length,
      povsManaged: userActivities.filter(a => a.feature === 'pov_management').length,
      averageTaskTime: 0, // Would calculate based on task completion times
      errorRate: userActivities.filter(a => !a.metadata.success).length / Math.max(1, userActivities.length),
      loginStreak: this.calculateLoginStreak(userId),
      helpDocumentsAccessed: userActivities.filter(a => a.feature === 'help').length,
      aiQueriesCount: userActivities.filter(a => a.feature === 'ai_assistant').length
    };
  }
  
  generateSystemMetrics(): SystemMetrics {
    const now = new Date();
    const dayStart = new Date(now.setHours(0, 0, 0, 0));
    
    const todayActivities = this.activities.filter(a => new Date(a.timestamp) >= dayStart);
    const activeSessions = Object.values(this.sessions).filter(s => s.isActive);
    
    // Feature adoption rates
    const featureAdoption: Record<string, any> = {};
    const totalUsers = Object.keys(this.users).length;
    
    // Calculate feature usage
    const featureUsers: Record<string, Set<string>> = {};
    this.activities.forEach(a => {
      if (!featureUsers[a.feature]) featureUsers[a.feature] = new Set();
      featureUsers[a.feature].add(a.userId);
    });
    
    Object.entries(featureUsers).forEach(([feature, users]) => {
      featureAdoption[feature] = {
        totalUsers: users.size,
        activeUsers: users.size, // Simplified
        adoptionRate: Math.round((users.size / totalUsers) * 100)
      };
    });
    
    return {
      period: 'daily',
      timestamp: new Date().toISOString(),
      totalUsers,
      activeUsers: activeSessions.length,
      newUsers: Object.values(this.users).filter(u => 
        new Date(u.createdAt) >= dayStart
      ).length,
      retainedUsers: activeSessions.filter(s => 
        new Date(s.createdAt) < dayStart
      ).length,
      featureAdoption,
      averageLoadTime: 250, // Mock data
      errorRate: todayActivities.filter(a => !a.metadata.success).length / Math.max(1, todayActivities.length),
      uptime: 99.9,
      trrVolume: {
        created: todayActivities.filter(a => a.action === 'trr_created').length,
        completed: todayActivities.filter(a => a.action === 'trr_completed').length,
        averageTime: 0
      },
      sdwVolume: {
        created: todayActivities.filter(a => a.action === 'sdw_created').length,
        completed: todayActivities.filter(a => a.action === 'sdw_completed').length,
        averageTime: 0
      },
      systemHealth: {
        cpu: 45,
        memory: 68,
        storage: 23,
        database: 'healthy'
      }
    };
  }
  
  // Utility Methods
  private getPeriodStart(date: Date, period: string): Date {
    const start = new Date(date);
    switch (period) {
      case 'daily':
        start.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        start.setDate(start.getDate() - start.getDay());
        start.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
    }
    return start;
  }
  
  private calculateLoginStreak(userId: string): number {
    // Simplified calculation - would be more sophisticated in production
    const userSessions = Object.values(this.sessions)
      .filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return Math.min(userSessions.length, 7); // Max 7 day streak for demo
  }
  
  private getDefaultPermissions(role: UserRole): UserPermissions {
    const basePermissions: UserPermissions = {
      trrManagement: { create: false, edit: false, delete: false, approve: false, view: 'own' },
      sdwManagement: { create: false, edit: false, delete: false, approve: false, export: false, view: 'own' },
      povManagement: { create: false, edit: false, delete: false, view: 'own' },
      analytics: { viewReports: false, exportData: false, viewTeamMetrics: false, viewSystemMetrics: false },
      admin: { userManagement: false, systemSettings: false, auditLogs: false, featureFlags: false },
      aiAssistant: { access: false, advancedFeatures: false, dataTraining: false }
    };
    
    switch (role) {
      case 'admin':
        return {
          trrManagement: { create: true, edit: true, delete: true, approve: true, view: 'all' },
          sdwManagement: { create: true, edit: true, delete: true, approve: true, export: true, view: 'all' },
          povManagement: { create: true, edit: true, delete: true, view: 'all' },
          analytics: { viewReports: true, exportData: true, viewTeamMetrics: true, viewSystemMetrics: true },
          admin: { userManagement: true, systemSettings: true, auditLogs: true, featureFlags: true },
          aiAssistant: { access: true, advancedFeatures: true, dataTraining: true }
        };
      
      case 'manager':
        return {
          ...basePermissions,
          trrManagement: { create: true, edit: true, delete: false, approve: true, view: 'team' },
          sdwManagement: { create: true, edit: true, delete: false, approve: true, export: true, view: 'team' },
          povManagement: { create: true, edit: true, delete: false, view: 'team' },
          analytics: { viewReports: true, exportData: true, viewTeamMetrics: true, viewSystemMetrics: false },
          aiAssistant: { access: true, advancedFeatures: true, dataTraining: false }
        };
      
      case 'senior_dc':
      case 'dc':
        return {
          ...basePermissions,
          trrManagement: { create: true, edit: true, delete: false, approve: false, view: 'own' },
          sdwManagement: { create: true, edit: true, delete: false, approve: false, export: true, view: 'own' },
          povManagement: { create: true, edit: true, delete: false, view: 'own' },
          analytics: { viewReports: true, exportData: false, viewTeamMetrics: false, viewSystemMetrics: false },
          aiAssistant: { access: true, advancedFeatures: role === 'senior_dc', dataTraining: false }
        };
      
      default:
        return {
          ...basePermissions,
          analytics: { viewReports: true, exportData: false, viewTeamMetrics: false, viewSystemMetrics: false },
          aiAssistant: { access: true, advancedFeatures: false, dataTraining: false }
        };
    }
  }
  
  private getDefaultFeatureFlags(): Record<string, boolean> {
    return {
      beta_features: false,
      advanced_analytics: false,
      ai_recommendations: true,
      export_to_pdf: true,
      team_collaboration: true,
      mobile_app: false
    };
  }

  getGlobalFeatureFlagSnapshot(): Record<string, boolean> {
    const [firstUser] = Object.values(this.users);
    return firstUser ? { ...firstUser.featureFlags } : this.getDefaultFeatureFlags();
  }

  applyFeatureFlagSnapshot(snapshot: Record<string, boolean>): void {
    const timestamp = new Date().toISOString();
    Object.values(this.users).forEach(user => {
      user.featureFlags = {
        ...user.featureFlags,
        ...snapshot
      };
      user.updatedAt = timestamp;
    });
  }
  
  private initializeDefaultUsers(): void {
    // Create demo users
    const demoUsers = [
      {
        email: 'admin@cortex.com',
        username: 'admin',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'admin' as UserRole,
        department: 'IT',
        title: 'System Admin',
        region: 'Global',
        timezone: 'UTC',
        status: 'active' as const,
        emailVerified: true,
        analyticsConsent: true,
        dataRetentionConsent: true,
        preferences: this.getDefaultPreferences()
      },
      {
        email: 'manager@cortex.com', 
        username: 'manager1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'manager' as UserRole,
        department: 'Sales Engineering',
        title: 'DC Manager',
        region: 'Americas',
        timezone: 'America/New_York',
        status: 'active' as const,
        emailVerified: true,
        analyticsConsent: true,
        dataRetentionConsent: true,
        preferences: this.getDefaultPreferences()
      },
      {
        email: 'dc@cortex.com',
        username: 'dc1', 
        firstName: 'John',
        lastName: 'Smith',
        role: 'dc' as UserRole,
        department: 'Sales Engineering',
        title: 'Domain Consultant',
        region: 'Americas',
        timezone: 'America/Los_Angeles',
        status: 'active' as const,
        emailVerified: true,
        analyticsConsent: true,
        dataRetentionConsent: true,
        preferences: this.getDefaultPreferences()
      }
    ];
    
    demoUsers.forEach(userData => {
      const user: UserProfile = {
        ...userData,
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissions: this.getDefaultPermissions(userData.role),
        featureFlags: this.getDefaultFeatureFlags(),
        onboardingCompleted: true
      };
      
      this.users[user.id] = user;
    });
  }
  
  private getDefaultPreferences(): UserPreferences {
    return {
      theme: 'dark',
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      notifications: {
        email: true,
        browser: true,
        trrUpdates: true,
        sdwReminders: true,
        systemAlerts: true
      },
      dashboardLayout: 'default',
      defaultView: 'dashboard',
      profileVisibility: 'team',
      activityTracking: true
    };
  }
  
  private initializeDemoData(): void {
    // Generate some demo activity data
    const userIds = Object.keys(this.users);
    const features = ['trr_management', 'sdw_workflow', 'pov_management', 'ai_assistant', 'analytics'];
    const actions = ['page_view', 'create', 'edit', 'delete', 'export', 'validate'];
    
    // Generate activities for the last 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      userIds.forEach(userId => {
        // 5-15 activities per user per day
        const activityCount = Math.floor(Math.random() * 10) + 5;
        
        for (let j = 0; j < activityCount; j++) {
          const feature = features[Math.floor(Math.random() * features.length)];
          const action = actions[Math.floor(Math.random() * actions.length)];
          
          const activity: UserActivity = {
            id: `activity_${date.getTime()}_${j}_${userId}`,
            userId,
            sessionId: `session_${userId}_${i}`,
            action: `${feature}_${action}`,
            feature,
            category: this.categorizeAction(action),
            metadata: {
              page: feature.replace('_', '-'),
              success: Math.random() > 0.1, // 90% success rate
            },
            performance: {
              loadTime: Math.floor(Math.random() * 3000) + 100,
              responseTime: Math.floor(Math.random() * 500) + 50
            },
            timestamp: new Date(date.getTime() + (j * 60000)).toISOString() // Spread activities across the day
          };
          
          this.activities.push(activity);
        }
      });
    }
  }
  
  // Getters for data access
  getAllUsers(): UserProfile[] {
    return Object.values(this.users);
  }
  
  getUser(id: string): UserProfile | undefined {
    return this.users[id];
  }
  
  getUserActivities(userId: string, limit = 100): UserActivity[] {
    return this.activities
      .filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
  
  getSystemActivities(limit = 100): UserActivity[] {
    return this.activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
  
  // Additional methods for UnifiedTerminal compatibility
  async getCurrentUser(): Promise<UserProfile | null> {
    // For demo purposes, return the first user
    const users = this.getAllUsers();
    return users.length > 0 ? users[0] : null;
  }
  
  async getUsers(): Promise<UserProfile[]> {
    return this.getAllUsers();
  }
  
  async getUserMetrics(): Promise<{
    totalUsers: number;
    activeSessions: number;
    roleDistribution: Record<string, number>;
  }> {
    const users = this.getAllUsers();
    const roleDistribution = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalUsers: users.length,
      activeSessions: Math.floor(users.length * 0.6), // Simulate 60% active
      roleDistribution
    };
  }
}

// Export singleton instance
export const userManagementService = new UserManagementService();
