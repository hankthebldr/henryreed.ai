'use client';

// Authentication service with simple username/password authentication
// Supports two user accounts: user1/paloalto1 and cortex/xsiam

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  viewMode: 'admin' | 'user';
  permissions: string[];
  lastLogin: string;
  authProvider: 'local';
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

class AuthService {
  private readonly STORAGE_KEYS = {
    AUTHENTICATED: 'dc_authenticated',
    USER: 'dc_user',
    SESSION_ID: 'dc_session_id'
  };

  // Valid credentials and corresponding user profiles
  private readonly VALID_USERS = {
    'user1': {
      password: 'paloalto1',
      profile: {
        id: 'user1-001',
        username: 'user1',
        email: 'user1@paloaltonetworks.com',
        role: 'user' as const,
        viewMode: 'user' as const,
        permissions: ['scenario:execute', 'pov:create', 'trr:create'],
        authProvider: 'local' as const
      }
    },
    'cortex': {
      password: 'xsiam',
      profile: {
        id: 'cortex-001',
        username: 'cortex',
        email: 'cortex@paloaltonetworks.com',
        role: 'admin' as const,
        viewMode: 'admin' as const,
        permissions: ['scenario:execute', 'pov:create', 'system:admin', 'trr:manage', 'user:manage'],
        authProvider: 'local' as const
      }
    }
  };

  /**
   * Authenticate user with local credentials
   * Supports: user1/paloalto1 and cortex/xsiam
   */
  async authenticate(credentials: AuthCredentials): Promise<AuthResult> {
    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const userConfig = this.VALID_USERS[credentials.username as keyof typeof this.VALID_USERS];
      
      if (userConfig && credentials.password === userConfig.password) {
        const user: AuthUser = {
          ...userConfig.profile,
          lastLogin: new Date().toISOString()
        };

        // Store authentication state
        this.setSession(user);

        return {
          success: true,
          user
        };
      } else {
        return {
          success: false,
          error: 'Invalid credentials. Use user1/paloalto1 or cortex/xsiam.'
        };
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed. Please try again.'
      };
    }
  }


  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(this.STORAGE_KEYS.AUTHENTICATED) === 'true';
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userStr = sessionStorage.getItem(this.STORAGE_KEYS.USER);
      if (!userStr) return null;
      
      return JSON.parse(userStr);
    } catch (error) {
      console.warn('Failed to parse user from session:', error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Store authentication session
   */
  private setSession(user: AuthUser): void {
    if (typeof window === 'undefined') return;

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    sessionStorage.setItem(this.STORAGE_KEYS.AUTHENTICATED, 'true');
    sessionStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
    sessionStorage.setItem(this.STORAGE_KEYS.SESSION_ID, sessionId);
  }

  /**
   * Clear authentication session
   */
  clearSession(): void {
    if (typeof window === 'undefined') return;

    sessionStorage.removeItem(this.STORAGE_KEYS.AUTHENTICATED);
    sessionStorage.removeItem(this.STORAGE_KEYS.USER);
    sessionStorage.removeItem(this.STORAGE_KEYS.SESSION_ID);
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      this.clearSession();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local session even if logout fails
      this.clearSession();
    }
  }

  /**
   * Check if user has permission
   */
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Admin users have all permissions
    if (user.viewMode === 'admin') return true;
    
    return user.permissions.includes(permission);
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;