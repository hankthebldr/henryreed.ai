// User Management Service
import { httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { functions, db } from '../src/lib/firebase';

// ============================================================================
// INTERFACES
// ============================================================================

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: 'user' | 'admin' | 'analyst' | 'manager';
  organizationId: string | null;
  department: string | null;
  permissions: string[];
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
  metadata: {
    createdAt: any;
    lastActive: any;
    loginCount: number;
    emailVerified: boolean;
    providerData: any[];
  };
  status: 'active' | 'inactive' | 'pending' | 'suspended';
}

export interface CreateUserRequest {
  email: string;
  displayName: string;
  role?: string;
  department?: string;
  organizationId?: string;
  theme?: 'light' | 'dark';
  notifications?: boolean;
  language?: string;
}

export interface UpdateUserRequest {
  uid?: string;
  displayName?: string;
  department?: string;
  role?: string;
  status?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    language?: string;
  };
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: any;
  timestamp: any;
}

export interface UserSettings {
  userId: string;
  dashboard: {
    layout: string;
    widgets: string[];
  };
  notifications: {
    email: boolean;
    browser: boolean;
    mobile: boolean;
    frequency: string;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
  };
  createdAt: any;
}

// ============================================================================
// USER MANAGEMENT SERVICE CLASS
// ============================================================================

export class UserManagementService {
  
  // Firebase Functions
  private createUserProfileFn = httpsCallable(functions, 'createUserProfile');
  private updateUserProfileFn = httpsCallable(functions, 'updateUserProfile');

  // ============================================================================
  // USER PROFILE OPERATIONS
  // ============================================================================

  /**
   * Create a new user profile
   */
  async createUser(userData: CreateUserRequest): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    try {
      const result: HttpsCallableResult<any> = await this.createUserProfileFn(userData);
      return result.data;
    } catch (error: any) {
      console.error('Error creating user:', error);
      return {
        success: false,
        error: error.message || 'Failed to create user'
      };
    }
  }

  /**
   * Update user profile
   */
  async updateUser(updates: UpdateUserRequest): Promise<{ success: boolean; error?: string }> {
    try {
      const result: HttpsCallableResult<any> = await this.updateUserProfileFn(updates);
      return result.data;
    } catch (error: any) {
      console.error('Error updating user:', error);
      return {
        success: false,
        error: error.message || 'Failed to update user'
      };
    }
  }

  /**
   * Get user profile by UID
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return { uid, ...userDoc.data() } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Get all users with optional filters
   */
  async getUsers(filters?: {
    role?: string;
    status?: string;
    organizationId?: string;
    limit?: number;
  }): Promise<UserProfile[]> {
    try {
      let q = query(collection(db, 'users'));

      // Apply filters
      if (filters?.role) {
        q = query(q, where('role', '==', filters.role));
      }
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters?.organizationId) {
        q = query(q, where('organizationId', '==', filters.organizationId));
      }

      // Order by creation date
      q = query(q, orderBy('metadata.createdAt', 'desc'));

      // Apply limit
      if (filters?.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as UserProfile));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  /**
   * Subscribe to users collection changes
   */
  subscribeToUsers(
    callback: (users: UserProfile[]) => void,
    filters?: {
      role?: string;
      status?: string;
      organizationId?: string;
      limit?: number;
    }
  ): Unsubscribe {
    let q = query(collection(db, 'users'));

    // Apply filters
    if (filters?.role) {
      q = query(q, where('role', '==', filters.role));
    }
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters?.organizationId) {
      q = query(q, where('organizationId', '==', filters.organizationId));
    }

    // Order by creation date
    q = query(q, orderBy('metadata.createdAt', 'desc'));

    // Apply limit
    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }

    return onSnapshot(q, (querySnapshot) => {
      const users = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as UserProfile));
      callback(users);
    });
  }

  // ============================================================================
  // ACTIVITY TRACKING
  // ============================================================================

  /**
   * Get user activity logs
   */
  async getUserActivity(userId?: string, limitCount: number = 50): Promise<UserActivity[]> {
    try {
      let q = query(collection(db, 'activityLogs'));
      
      if (userId) {
        q = query(q, where('userId', '==', userId));
      }
      
      q = query(q, orderBy('timestamp', 'desc'), limit(limitCount));

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UserActivity));
    } catch (error) {
      console.error('Error fetching activity:', error);
      return [];
    }
  }

  /**
   * Subscribe to activity logs
   */
  subscribeToActivity(
    callback: (activities: UserActivity[]) => void,
    userId?: string,
    limitCount: number = 50
  ): Unsubscribe {
    let q = query(collection(db, 'activityLogs'));
    
    if (userId) {
      q = query(q, where('userId', '==', userId));
    }
    
    q = query(q, orderBy('timestamp', 'desc'), limit(limitCount));

    return onSnapshot(q, (querySnapshot) => {
      const activities = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UserActivity));
      callback(activities);
    });
  }

  /**
   * Log user activity
   */
  async logActivity(activity: Omit<UserActivity, 'id' | 'timestamp'>): Promise<void> {
    try {
      await addDoc(collection(db, 'activityLogs'), {
        ...activity,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  // ============================================================================
  // USER SETTINGS
  // ============================================================================

  /**
   * Get user settings
   */
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const settingsDoc = await getDoc(doc(db, 'userSettings', userId));
      if (settingsDoc.exists()) {
        return settingsDoc.data() as UserSettings;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return null;
    }
  }

  /**
   * Update user settings
   */
  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'userSettings', userId), settings);
      return true;
    } catch (error) {
      console.error('Error updating user settings:', error);
      return false;
    }
  }

  // ============================================================================
  // ORGANIZATION MANAGEMENT
  // ============================================================================

  /**
   * Get organization members
   */
  async getOrganizationMembers(organizationId: string): Promise<UserProfile[]> {
    return this.getUsers({ organizationId });
  }

  /**
   * Add user to organization
   */
  async addUserToOrganization(userId: string, organizationId: string): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        organizationId,
        'metadata.lastModified': new Date()
      });

      // Update organization member count
      const orgRef = doc(db, 'organizations', organizationId);
      const orgDoc = await getDoc(orgRef);
      
      if (orgDoc.exists()) {
        const currentMembers = orgDoc.data().members || [];
        if (!currentMembers.includes(userId)) {
          await updateDoc(orgRef, {
            members: [...currentMembers, userId],
            memberCount: currentMembers.length + 1,
            lastUpdated: new Date()
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Error adding user to organization:', error);
      return false;
    }
  }

  /**
   * Remove user from organization
   */
  async removeUserFromOrganization(userId: string, organizationId: string): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        organizationId: null,
        'metadata.lastModified': new Date()
      });

      // Update organization member count
      const orgRef = doc(db, 'organizations', organizationId);
      const orgDoc = await getDoc(orgRef);
      
      if (orgDoc.exists()) {
        const currentMembers = orgDoc.data().members || [];
        const updatedMembers = currentMembers.filter((id: string) => id !== userId);
        await updateDoc(orgRef, {
          members: updatedMembers,
          memberCount: updatedMembers.length,
          lastUpdated: new Date()
        });
      }

      return true;
    } catch (error) {
      console.error('Error removing user from organization:', error);
      return false;
    }
  }

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, limitCount: number = 20): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: string): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Create notification
   */
  async createNotification(notification: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }): Promise<boolean> {
    try {
      await addDoc(collection(db, 'notifications'), {
        ...notification,
        read: false,
        createdAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  }

  // ============================================================================
  // ANALYTICS & REPORTING
  // ============================================================================

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsersThisWeek: number;
    usersByRole: Record<string, number>;
    usersByStatus: Record<string, number>;
  }> {
    try {
      const users = await this.getUsers();
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const stats = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'active').length,
        newUsersThisWeek: users.filter(u => 
          u.metadata.createdAt && 
          new Date(u.metadata.createdAt.seconds * 1000) > weekAgo
        ).length,
        usersByRole: {} as Record<string, number>,
        usersByStatus: {} as Record<string, number>
      };

      // Count by role
      users.forEach(user => {
        stats.usersByRole[user.role] = (stats.usersByRole[user.role] || 0) + 1;
        stats.usersByStatus[user.status] = (stats.usersByStatus[user.status] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsersThisWeek: 0,
        usersByRole: {},
        usersByStatus: {}
      };
    }
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(
    userIds: string[], 
    updates: Partial<Pick<UserProfile, 'role' | 'status' | 'organizationId'>>
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const userId of userIds) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          ...updates,
          'metadata.lastModified': new Date()
        });
        success++;
      } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
        failed++;
      }
    }

    return { success, failed };
  }

  /**
   * Export users data
   */
  async exportUsers(filters?: {
    role?: string;
    status?: string;
    organizationId?: string;
  }): Promise<UserProfile[]> {
    return this.getUsers(filters);
  }
}

// Create singleton instance
export const userManagementService = new UserManagementService();
export default userManagementService;