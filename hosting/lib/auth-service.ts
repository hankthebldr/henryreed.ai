'use client';

// Authentication service with support for multiple providers
// Currently supports simple username/password auth with structure for future Okta integration

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  viewMode: 'admin' | 'user';
  permissions: string[];
  lastLogin: string;
  authProvider: 'local' | 'okta' | 'firebase';
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

  // Valid credentials for local auth (temporary)
  private readonly VALID_CREDENTIALS = {
    username: 'cortex',
    password: 'xsiam'
  };

  // Mock user for local development
  private readonly MOCK_USER: AuthUser = {
    id: 'cortex-001',
    username: 'cortex',
    email: 'cortex@paloaltonetworks.com',
    role: 'admin',
    viewMode: 'admin',
    permissions: ['scenario:execute', 'pov:create', 'system:admin', 'trr:manage'],
    lastLogin: new Date().toISOString(),
    authProvider: 'local'
  };

  /**
   * Authenticate user with local credentials
   * TODO: Replace with Okta authentication
   */
  async authenticate(credentials: AuthCredentials): Promise<AuthResult> {
    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 800));

      if (credentials.username === this.VALID_CREDENTIALS.username && 
          credentials.password === this.VALID_CREDENTIALS.password) {
        
        const user: AuthUser = {
          ...this.MOCK_USER,
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
          error: 'Invalid credentials. Please check your username and password.'
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
   * Authenticate with Okta (future implementation)
   */
  async authenticateWithOkta(): Promise<AuthResult> {
    // TODO: Implement Okta authentication
    return {
      success: false,
      error: 'Okta authentication not yet implemented'
    };
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
      // TODO: Call Okta logout if using Okta auth
      this.clearSession();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local session even if remote logout fails
      this.clearSession();
    }
  }

  /**
   * Refresh authentication token (for future Okta integration)
   */
  async refreshToken(): Promise<boolean> {
    // TODO: Implement token refresh for Okta
    return false;
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