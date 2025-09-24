// Firebase Authentication hook with multi-tenant organization support
import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { User } from 'firebase/auth';
import { 
  onAuthStateChange, 
  signInWithEmail, 
  createAccount, 
  signOut,
  getFirebaseErrorMessage 
} from '../firebase/client';
import { getUserOrganizations } from '../../functions/src/middleware/auth';
import { useTRRStore } from '../../store/trr-store';
import { UserRole, Permission } from '../firebase/data-model';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface OrganizationMembership {
  organizationId: string;
  organizationName: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  joinedAt: string;
}

export interface AuthState {
  user: AuthUser | null;
  organizations: OrganizationMembership[];
  currentOrganization: OrganizationMembership | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  switchOrganization: (organizationId: string) => void;
  refreshOrganizations: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  clearError: () => void;
}

// ============================================================================
// Context and Provider
// ============================================================================

const AuthContext = createContext<(AuthState & AuthActions) | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    organizations: [],
    currentOrganization: null,
    isLoading: true,
    error: null,
    isInitialized: false,
  });

  const { setCurrentOrganization: setStoreOrganization } = useTRRStore();

  // ============================================================================
  // Helper Functions
  // ============================================================================

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const convertFirebaseUser = useCallback((firebaseUser: User): AuthUser => {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
    };
  }, []);

  const fetchUserOrganizations = useCallback(async (userId: string): Promise<OrganizationMembership[]> => {
    try {
      // This would typically make an API call to fetch user organizations
      // For now, we'll simulate it with a mock response
      
      // TODO: Replace with actual API call to get user organizations
      const mockOrganizations: OrganizationMembership[] = [
        {
          organizationId: 'default-org',
          organizationName: 'Default Organization',
          role: 'admin',
          permissions: [
            'read_trr',
            'write_trr',
            'delete_trr',
            'manage_projects',
            'manage_portfolios',
            'manage_users',
            'export_data',
            'view_analytics',
            'manage_integrations',
            'blockchain_signoff',
          ],
          isActive: true,
          joinedAt: new Date().toISOString(),
        },
      ];

      return mockOrganizations;
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
      return [];
    }
  }, []);

  const loadUserData = useCallback(async (firebaseUser: User) => {
    try {
      setLoading(true);
      setError(null);

      const authUser = convertFirebaseUser(firebaseUser);
      const organizations = await fetchUserOrganizations(firebaseUser.uid);
      
      // Set the first active organization as current
      const currentOrg = organizations.find(org => org.isActive) || organizations[0] || null;

      setState(prev => ({
        ...prev,
        user: authUser,
        organizations,
        currentOrganization: currentOrg,
        isLoading: false,
      }));

      // Update the store with the current organization
      if (currentOrg) {
        setStoreOrganization(currentOrg.organizationId);
      }

    } catch (error) {
      console.error('Failed to load user data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load user data');
      setLoading(false);
    }
  }, [convertFirebaseUser, fetchUserOrganizations, setStoreOrganization, setError, setLoading]);

  // ============================================================================
  // Authentication Actions
  // ============================================================================

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const firebaseUser = await signInWithEmail(email, password);
      await loadUserData(firebaseUser);

    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error);
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  }, [loadUserData, setError, setLoading]);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    try {
      setLoading(true);
      setError(null);

      const firebaseUser = await createAccount(email, password);
      
      // TODO: Update user profile with display name if provided
      // await updateProfile(firebaseUser, { displayName });

      await loadUserData(firebaseUser);

    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error);
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  }, [loadUserData, setError, setLoading]);

  const handleSignOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await signOut();

      // Clear state
      setState(prev => ({
        ...prev,
        user: null,
        organizations: [],
        currentOrganization: null,
        isLoading: false,
      }));

      // Clear store organization
      setStoreOrganization(null);

    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error);
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  }, [setStoreOrganization, setError, setLoading]);

  const switchOrganization = useCallback((organizationId: string) => {
    const organization = state.organizations.find(org => org.organizationId === organizationId);
    
    if (!organization) {
      setError('Organization not found');
      return;
    }

    if (!organization.isActive) {
      setError('Organization is not active');
      return;
    }

    setState(prev => ({
      ...prev,
      currentOrganization: organization,
      error: null,
    }));

    setStoreOrganization(organizationId);
  }, [state.organizations, setStoreOrganization, setError]);

  const refreshOrganizations = useCallback(async () => {
    if (!state.user) {
      setError('No user logged in');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const organizations = await fetchUserOrganizations(state.user.uid);
      const currentOrgId = state.currentOrganization?.organizationId;
      const currentOrg = organizations.find(org => org.organizationId === currentOrgId) || organizations[0] || null;

      setState(prev => ({
        ...prev,
        organizations,
        currentOrganization: currentOrg,
        isLoading: false,
      }));

      if (currentOrg) {
        setStoreOrganization(currentOrg.organizationId);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh organizations';
      setError(errorMessage);
      setLoading(false);
    }
  }, [state.user, state.currentOrganization?.organizationId, fetchUserOrganizations, setStoreOrganization, setError, setLoading]);

  // ============================================================================
  // Permission and Role Checks
  // ============================================================================

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!state.currentOrganization) return false;
    
    // Owners and admins have all permissions
    if (['owner', 'admin'].includes(state.currentOrganization.role)) {
      return true;
    }

    return state.currentOrganization.permissions.includes(permission);
  }, [state.currentOrganization]);

  const hasRole = useCallback((role: UserRole): boolean => {
    if (!state.currentOrganization) return false;
    return state.currentOrganization.role === role;
  }, [state.currentOrganization]);

  const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
    if (!state.currentOrganization) return false;
    return roles.includes(state.currentOrganization.role);
  }, [state.currentOrganization]);

  // ============================================================================
  // Firebase Auth State Listener
  // ============================================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        await loadUserData(firebaseUser);
      } else {
        setState(prev => ({
          ...prev,
          user: null,
          organizations: [],
          currentOrganization: null,
          isLoading: false,
          isInitialized: true,
        }));
        setStoreOrganization(null);
      }
    });

    return unsubscribe;
  }, [loadUserData, setStoreOrganization]);

  // Mark as initialized after first auth state check
  useEffect(() => {
    if (!state.isInitialized && !state.isLoading) {
      setState(prev => ({ ...prev, isInitialized: true }));
    }
  }, [state.isInitialized, state.isLoading]);

  // ============================================================================
  // Context Value
  // ============================================================================

  const contextValue: AuthState & AuthActions = {
    ...state,
    signIn,
    signUp,
    signOut: handleSignOut,
    switchOrganization,
    refreshOrganizations,
    hasPermission,
    hasRole,
    hasAnyRole,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================================
// Higher-Order Components and Hooks
// ============================================================================

export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions?: Permission[]
) => {
  return function AuthenticatedComponent(props: P) {
    const auth = useAuth();

    if (!auth.isInitialized) {
      return <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>;
    }

    if (!auth.user) {
      return <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Please sign in to access this feature.</div>
      </div>;
    }

    if (!auth.currentOrganization) {
      return <div className="flex items-center justify-center h-64">
        <div className="text-yellow-500">No organization selected. Please contact your administrator.</div>
      </div>;
    }

    if (requiredPermissions) {
      const hasAllPermissions = requiredPermissions.every(permission => 
        auth.hasPermission(permission)
      );

      if (!hasAllPermissions) {
        return <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Insufficient permissions to access this feature.</div>
        </div>;
      }
    }

    return <Component {...props} />;
  };
};

export const useAuthGuard = (requiredPermissions?: Permission[], requiredRoles?: UserRole[]) => {
  const auth = useAuth();

  const isAuthenticated = !!auth.user;
  const hasOrganization = !!auth.currentOrganization;
  
  const hasRequiredPermissions = !requiredPermissions || 
    requiredPermissions.every(permission => auth.hasPermission(permission));
  
  const hasRequiredRole = !requiredRoles || 
    requiredRoles.some(role => auth.hasRole(role));

  const canAccess = isAuthenticated && hasOrganization && hasRequiredPermissions && hasRequiredRole;

  return {
    isAuthenticated,
    hasOrganization,
    hasRequiredPermissions,
    hasRequiredRole,
    canAccess,
    user: auth.user,
    currentOrganization: auth.currentOrganization,
    isLoading: auth.isLoading,
  };
};

// ============================================================================
// Utility Functions
// ============================================================================

export const useCurrentUser = () => {
  const auth = useAuth();
  return {
    user: auth.user,
    organization: auth.currentOrganization,
    isLoading: auth.isLoading,
    error: auth.error,
  };
};

export const usePermissions = () => {
  const auth = useAuth();
  return {
    hasPermission: auth.hasPermission,
    hasRole: auth.hasRole,
    hasAnyRole: auth.hasAnyRole,
    permissions: auth.currentOrganization?.permissions || [],
    role: auth.currentOrganization?.role || null,
  };
};

export default useAuth;