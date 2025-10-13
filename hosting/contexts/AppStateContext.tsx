'use client';

import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect, useRef } from 'react';

type RBACModule = typeof import('../lib/rbac-middleware');

// User and authentication types
export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'admin' | 'manager' | 'senior_dc' | 'dc' | 'analyst';
  viewMode?: 'admin' | 'user';
  permissions?: string[];
  lastLogin?: string;
  assignedProjects?: string[];
  assignedCustomers?: string[];
}

// Terminal integration types
export interface CloudEnvironmentConfig {
  provider: 'aws' | 'gcp' | 'azure';
  connectionType: 'ssh' | 'api' | 'websocket';
  credentials: {
    accessKey?: string;
    secretKey?: string;
    region?: string;
    projectId?: string;
    subscriptionId?: string;
    keyFilePath?: string;
  };
  endpoints: {
    terminalProxy: string;
    commandExecutor: string;
    fileSystem: string;
  };
  enabled: boolean;
}

export interface IntegrationSettings {
  contentHubIntegration: boolean;
  detectionEngineIntegration: boolean;
  cloudExecution: boolean;
  realTimeUpdates: boolean;
}

// RBAC types
export interface DataScope {
  canViewAllUsers: boolean;
  canViewAllPOVs: boolean;
  canViewAllTRRs: boolean;
  canModifySystemSettings: boolean;
  allowedCustomers: string[] | 'all';
  allowedProjects: string[] | 'all';
}

export interface UserPermissions {
  canView: string[];
  canCreate: string[];
  canUpdate: string[];
  canDelete: string[];
}

export interface RBACEvent {
  timestamp: string;
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  allowed: boolean;
  reason?: string;
}

// Types for unified app state
export interface AppState {
  // Current interface mode
  mode: 'terminal' | 'gui';
  
  // Authentication state
  auth: {
    user: User | null;
    isAuthenticated: boolean;
    viewMode: 'admin' | 'user';
    permissions: Set<string>;
  };
  
  // Terminal state
  terminal: {
    isVisible: boolean;
    ref: React.RefObject<any> | null;
    hostType: 'overlay' | 'sidebar';
    cloudConfig?: CloudEnvironmentConfig;
    integrationSettings: IntegrationSettings;
    connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
    isEnabled: boolean;
  };
  
  // RBAC state
  rbac: {
    userPermissions: UserPermissions;
    dataScope: DataScope;
    auditLog: RBACEvent[];
  };
  
  // Navigation state
  navigation: {
    activeGUITab: string;
    terminalHistory: string[];
    breadcrumbs: Array<{ label: string; path: string }>;
  };
  
  // Data state (synchronized between terminal and GUI)
  data: {
    analytics: any;
    povs: any[];
    trrs: any[];
    projects: any[];
    scenarios: any[];
    detections: any[];
    currentPovId?: string;
  };
  
  // UI state
  ui: {
    notifications: Array<{ id: string; type: 'success' | 'error' | 'info' | 'warning'; message: string; timestamp: number }>;
    loadingStates: Record<string, boolean>;
    modals: Record<string, { open: boolean; data?: any }>;
  };
  
  // Command bridge state
  commandBridge: {
    lastExecutedCommand: string | null;
    pendingGUIAction: string | null;
    pendingExecution: boolean;
    crossInterfaceData: any;
  };
}

type AppAction = 
  | { type: 'SET_MODE'; payload: 'terminal' | 'gui' }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_VIEW_MODE'; payload: 'admin' | 'user' }
  | { type: 'SET_TERMINAL_VISIBLE'; payload: boolean }
  | { type: 'SET_TERMINAL_REF'; payload: React.RefObject<any> }
  | { type: 'SET_TERMINAL_HOST_TYPE'; payload: 'overlay' | 'sidebar' }
  | { type: 'SET_ACTIVE_GUI_TAB'; payload: string }
  | { type: 'ADD_TERMINAL_COMMAND'; payload: string }
  | { type: 'UPDATE_BREADCRUMBS'; payload: Array<{ label: string; path: string }> }
  | { type: 'UPDATE_DATA'; payload: { key: keyof AppState['data']; data: any } }
  | { type: 'ADD_NOTIFICATION'; payload: { id: string; type: 'success' | 'error' | 'info' | 'warning'; message: string; timestamp: number } }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_LOADING'; payload: { key: string; loading: boolean } }
  | { type: 'OPEN_MODAL'; payload: { key: string; data?: any } }
  | { type: 'CLOSE_MODAL'; payload: string }
  | { type: 'SET_COMMAND_BRIDGE'; payload: Partial<AppState['commandBridge']> }
  | { type: 'CLEAR_PENDING_EXECUTION' }
  | { type: 'TRIGGER_GUI_ACTION'; payload: { action: string; data?: any } }
  | { type: 'UPDATE_TERMINAL_SETTINGS'; payload: { cloudConfig: CloudEnvironmentConfig; integrationSettings: IntegrationSettings; connectionStatus: boolean } }
  | { type: 'SET_TERMINAL_CONNECTION_STATUS'; payload: 'disconnected' | 'connecting' | 'connected' | 'error' }
  | { type: 'UPDATE_USER_PERMISSIONS'; payload: UserPermissions }
  | { type: 'LOG_RBAC_EVENT'; payload: Omit<RBACEvent, 'timestamp'> }
  | { type: 'CLEAR_RBAC_LOG' };

const initialState: AppState = {
  mode: 'gui',
  auth: {
    user: null,
    isAuthenticated: false,
    viewMode: 'user',
    permissions: new Set<string>(),
  },
  terminal: {
    isVisible: false,
    ref: null,
    hostType: 'overlay',
    integrationSettings: {
      contentHubIntegration: true,
      detectionEngineIntegration: true,
      cloudExecution: false, // Cloud execution disabled by default
      realTimeUpdates: true
    },
    connectionStatus: 'disconnected',
    isEnabled: false
  },
  rbac: {
    userPermissions: {
      canView: [],
      canCreate: [],
      canUpdate: [],
      canDelete: []
    },
    dataScope: {
      canViewAllUsers: false,
      canViewAllPOVs: false,
      canViewAllTRRs: false,
      canModifySystemSettings: false,
      allowedCustomers: [],
      allowedProjects: []
    },
    auditLog: []
  },
  navigation: {
    activeGUITab: 'dashboard',
    terminalHistory: [],
    breadcrumbs: [{ label: 'Home', path: '/gui' }],
  },
  data: {
    analytics: null,
    povs: [],
    trrs: [],
    projects: [],
    scenarios: [],
    detections: [],
    currentPovId: undefined,
  },
  ui: {
    notifications: [],
    loadingStates: {},
    modals: {},
  },
  commandBridge: {
    lastExecutedCommand: null,
    pendingGUIAction: null,
    pendingExecution: false,
    crossInterfaceData: null,
  },
};

function appStateReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload };
      
    case 'SET_USER':
      return {
        ...state,
        auth: {
          ...state.auth,
          user: action.payload,
          isAuthenticated: !!action.payload,
          viewMode: action.payload?.viewMode || state.auth.viewMode,
          permissions: new Set(action.payload?.permissions ?? []),
        },
      };
      
    case 'SET_VIEW_MODE':
      return {
        ...state,
        auth: {
          ...state.auth,
          viewMode: action.payload,
        },
      };
      
    case 'SET_TERMINAL_VISIBLE':
      return {
        ...state,
        terminal: { ...state.terminal, isVisible: action.payload },
      };
      
    case 'SET_TERMINAL_REF':
      return {
        ...state,
        terminal: { ...state.terminal, ref: action.payload },
      };

    case 'SET_TERMINAL_HOST_TYPE':
      return {
        ...state,
        terminal: { ...state.terminal, hostType: action.payload },
      };
      
    case 'SET_ACTIVE_GUI_TAB':
      return {
        ...state,
        navigation: { ...state.navigation, activeGUITab: action.payload },
      };
      
    case 'ADD_TERMINAL_COMMAND':
      return {
        ...state,
        navigation: {
          ...state.navigation,
          terminalHistory: [...state.navigation.terminalHistory, action.payload].slice(-50), // Keep last 50 commands
        },
      };
      
    case 'UPDATE_BREADCRUMBS':
      return {
        ...state,
        navigation: { ...state.navigation, breadcrumbs: action.payload },
      };
      
    case 'UPDATE_DATA':
      return {
        ...state,
        data: { ...state.data, [action.payload.key]: action.payload.data },
      };
      
    case 'ADD_NOTIFICATION':
      const notification = action.payload;
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, notification].slice(-10), // Keep last 10 notifications
        },
      };
      
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(n => n.id !== action.payload),
        },
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        ui: {
          ...state.ui,
          loadingStates: { ...state.ui.loadingStates, [action.payload.key]: action.payload.loading },
        },
      };
      
    case 'OPEN_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: { ...state.ui.modals, [action.payload.key]: { open: true, data: action.payload.data } },
        },
      };
      
    case 'CLOSE_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: { ...state.ui.modals, [action.payload]: { open: false } },
        },
      };
      
    case 'SET_COMMAND_BRIDGE':
      return {
        ...state,
        commandBridge: { ...state.commandBridge, ...action.payload },
      };
      
    case 'CLEAR_PENDING_EXECUTION':
      return {
        ...state,
        commandBridge: { ...state.commandBridge, pendingExecution: false },
      };
      
    case 'TRIGGER_GUI_ACTION':
      return {
        ...state,
        commandBridge: {
          ...state.commandBridge,
          pendingGUIAction: action.payload.action,
          crossInterfaceData: action.payload.data,
        },
      };
      
    case 'UPDATE_TERMINAL_SETTINGS':
      return {
        ...state,
        terminal: {
          ...state.terminal,
          cloudConfig: action.payload.cloudConfig,
          integrationSettings: action.payload.integrationSettings,
          connectionStatus: action.payload.connectionStatus ? 'connected' : 'disconnected',
          isEnabled: action.payload.cloudConfig.enabled
        }
      };
      
    case 'SET_TERMINAL_CONNECTION_STATUS':
      return {
        ...state,
        terminal: {
          ...state.terminal,
          connectionStatus: action.payload
        }
      };
      
    case 'UPDATE_USER_PERMISSIONS':
      return {
        ...state,
        rbac: {
          ...state.rbac,
          userPermissions: action.payload
        }
      };
      
    case 'LOG_RBAC_EVENT':
      const rbacEvent: RBACEvent = {
        ...action.payload,
        timestamp: new Date().toISOString()
      };
      return {
        ...state,
        rbac: {
          ...state.rbac,
          auditLog: [...state.rbac.auditLog, rbacEvent].slice(-1000) // Keep last 1000 events
        }
      };
      
    case 'CLEAR_RBAC_LOG':
      return {
        ...state,
        rbac: {
          ...state.rbac,
          auditLog: []
        }
      };
      
    default:
      return state;
  }
}

const AppStateContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    // Mode and navigation actions
    setMode: (mode: 'terminal' | 'gui') => void;
    setActiveGUITab: (tab: string) => void;
    addTerminalCommand: (command: string) => void;
    updateBreadcrumbs: (breadcrumbs: Array<{ label: string; path: string }>) => void;
    
    // Authentication actions
    setUser: (user: User | null) => void;
    setViewMode: (mode: 'admin' | 'user') => void;
    hasPermission: (permission: string) => boolean;
    
    // Terminal actions
    openTerminal: () => void;
    closeTerminal: () => void;
    focusTerminal: () => void;
    setTerminalRef: (ref: React.RefObject<any>) => void;
    setTerminalHostType: (hostType: 'overlay' | 'sidebar') => void;
    
    // Data management actions
    updateData: (key: keyof AppState['data'], data: any) => void;
    
    // UI actions
    notify: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
    setLoading: (key: string, loading: boolean) => void;
    openModal: (key: string, data?: any) => void;
    closeModal: (key: string) => void;
    
    // Command bridge actions
    executeCommandFromGUI: (command: string, options?: { open?: boolean; focus?: boolean; track?: boolean; context?: any }) => Promise<void>;
    clearPendingExecution: () => void;
    triggerGUIAction: (action: string, data?: any) => void;
    
    // Terminal integration actions
    updateTerminalSettings: (settings: { cloudConfig: CloudEnvironmentConfig; integrationSettings: IntegrationSettings; connectionStatus: boolean }) => void;
    setTerminalConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
    
    // RBAC actions
    updateUserPermissions: (permissions: UserPermissions) => void;
    logRBACEvent: (event: Omit<RBACEvent, 'timestamp'>) => void;
    clearRBACLog: () => void;
    canAccessResource: (resource: string, action: string) => boolean;
  };
} | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appStateReducer, initialState);

  const stateRef = useRef(state);
  const rbacModuleRef = useRef<RBACModule | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let isMounted = true;

    import('../lib/rbac-middleware')
      .then((module) => {
        if (isMounted) {
          rbacModuleRef.current = module;
        }
      })
      .catch((error) => {
        console.error('Error loading RBAC middleware:', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const setMode = useCallback((mode: 'terminal' | 'gui') => {
    dispatch({ type: 'SET_MODE', payload: mode });
  }, [dispatch]);

  const setActiveGUITab = useCallback((tab: string) => {
    dispatch({ type: 'SET_ACTIVE_GUI_TAB', payload: tab });
  }, [dispatch]);

  const addTerminalCommand = useCallback((command: string) => {
    dispatch({ type: 'ADD_TERMINAL_COMMAND', payload: command });
    dispatch({ type: 'SET_COMMAND_BRIDGE', payload: { lastExecutedCommand: command } });
  }, [dispatch]);

  const updateBreadcrumbs = useCallback((breadcrumbs: Array<{ label: string; path: string }>) => {
    dispatch({ type: 'UPDATE_BREADCRUMBS', payload: breadcrumbs });
  }, [dispatch]);

  const setUser = useCallback((user: User | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  }, [dispatch]);

  const setViewMode = useCallback((mode: 'admin' | 'user') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, [dispatch]);

  const hasPermission = useCallback((permission: string) => {
    const currentState = stateRef.current;
    if (currentState.auth.viewMode === 'admin') {
      return true;
    }
    const currentUser = currentState.auth.user;
    return currentUser?.permissions?.includes(permission) || false;
  }, []);

  const openTerminal = useCallback(() => {
    dispatch({ type: 'SET_TERMINAL_VISIBLE', payload: true });
  }, [dispatch]);

  const closeTerminal = useCallback(() => {
    dispatch({ type: 'SET_TERMINAL_VISIBLE', payload: false });
  }, [dispatch]);

  const focusTerminal = useCallback(() => {
    const terminalRef = stateRef.current.terminal.ref;
    terminalRef?.current?.focus?.();
  }, []);

  const setTerminalRef = useCallback((ref: React.RefObject<any>) => {
    dispatch({ type: 'SET_TERMINAL_REF', payload: ref });
  }, [dispatch]);

  const setTerminalHostType = useCallback((hostType: 'overlay' | 'sidebar') => {
    dispatch({ type: 'SET_TERMINAL_HOST_TYPE', payload: hostType });
  }, [dispatch]);

  const updateData = useCallback((key: keyof AppState['data'], data: any) => {
    dispatch({ type: 'UPDATE_DATA', payload: { key, data } });
  }, [dispatch]);

  const notify = useCallback((type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const notificationId = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now();

    dispatch({ type: 'ADD_NOTIFICATION', payload: { id: notificationId, type, message, timestamp } });

    setTimeout(() => {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId });
    }, 5000);
  }, [dispatch]);

  const setLoading = useCallback((key: string, loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: { key, loading } });
  }, [dispatch]);

  const openModal = useCallback((key: string, data?: any) => {
    dispatch({ type: 'OPEN_MODAL', payload: { key, data } });
  }, [dispatch]);

  const closeModal = useCallback((key: string) => {
    dispatch({ type: 'CLOSE_MODAL', payload: key });
  }, [dispatch]);

  const executeCommandFromGUI = useCallback(async (command: string, options: { open?: boolean; focus?: boolean; track?: boolean; context?: any } = {}) => {
    const { open = true, focus = true, track = false, context = null } = options;

    try {
      if (track) {
        console.log('Command executed from GUI:', { command, context, timestamp: new Date().toISOString() });
      }

      if (open) {
        dispatch({ type: 'SET_TERMINAL_VISIBLE', payload: true });
      }

      dispatch({ type: 'ADD_TERMINAL_COMMAND', payload: command });

      dispatch({
        type: 'SET_COMMAND_BRIDGE',
        payload: {
          lastExecutedCommand: command,
          pendingExecution: true,
          crossInterfaceData: context
        }
      });

      if (focus) {
        setTimeout(() => {
          const terminalRef = stateRef.current.terminal.ref;
          terminalRef?.current?.focus?.();
        }, 100);
      }

      return Promise.resolve();
    } catch (error) {
      console.error('Error executing command from GUI:', error);
      const notificationId = Math.random().toString(36).substring(2, 15);
      const timestamp = Date.now();
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: notificationId,
          type: 'error',
          message: `Failed to execute command: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp
        }
      });
      throw error;
    }
  }, [dispatch]);

  const clearPendingExecution = useCallback(() => {
    dispatch({ type: 'CLEAR_PENDING_EXECUTION' });
  }, [dispatch]);

  const triggerGUIAction = useCallback((action: string, data?: any) => {
    dispatch({ type: 'TRIGGER_GUI_ACTION', payload: { action, data } });
  }, [dispatch]);

  const updateTerminalSettings = useCallback((settings: { cloudConfig: CloudEnvironmentConfig; integrationSettings: IntegrationSettings; connectionStatus: boolean }) => {
    dispatch({ type: 'UPDATE_TERMINAL_SETTINGS', payload: settings });
  }, [dispatch]);

  const setTerminalConnectionStatus = useCallback((status: 'disconnected' | 'connecting' | 'connected' | 'error') => {
    dispatch({ type: 'SET_TERMINAL_CONNECTION_STATUS', payload: status });
  }, [dispatch]);

  const updateUserPermissions = useCallback((permissions: UserPermissions) => {
    dispatch({ type: 'UPDATE_USER_PERMISSIONS', payload: permissions });
  }, [dispatch]);

  const logRBACEvent = useCallback((event: Omit<RBACEvent, 'timestamp'>) => {
    dispatch({ type: 'LOG_RBAC_EVENT', payload: event });
  }, [dispatch]);

  const clearRBACLog = useCallback(() => {
    dispatch({ type: 'CLEAR_RBAC_LOG' });
  }, [dispatch]);

  const canAccessResource = useCallback((resource: string, action: string) => {
    const currentState = stateRef.current;
    const module = rbacModuleRef.current;

    if (!module) {
      console.warn('RBAC middleware not yet loaded; denying access by default.');
      return false;
    }

    try {
      return module.RBACMiddleware.canAccessResource(
        currentState.auth.user?.role || 'analyst',
        resource,
        action,
        { userId: currentState.auth.user?.id }
      );
    } catch (error) {
      console.error('Error checking resource access:', error);
      return false;
    }
  }, []);

  const actions = useMemo(() => ({
    setMode,
    setActiveGUITab,
    addTerminalCommand,
    updateBreadcrumbs,
    setUser,
    setViewMode,
    hasPermission,
    openTerminal,
    closeTerminal,
    focusTerminal,
    setTerminalRef,
    setTerminalHostType,
    updateData,
    notify,
    setLoading,
    openModal,
    closeModal,
    executeCommandFromGUI,
    clearPendingExecution,
    triggerGUIAction,
    updateTerminalSettings,
    setTerminalConnectionStatus,
    updateUserPermissions,
    logRBACEvent,
    clearRBACLog,
    canAccessResource,
  }), [
    setMode,
    setActiveGUITab,
    addTerminalCommand,
    updateBreadcrumbs,
    setUser,
    setViewMode,
    hasPermission,
    openTerminal,
    closeTerminal,
    focusTerminal,
    setTerminalRef,
    setTerminalHostType,
    updateData,
    notify,
    setLoading,
    openModal,
    closeModal,
    executeCommandFromGUI,
    clearPendingExecution,
    triggerGUIAction,
    updateTerminalSettings,
    setTerminalConnectionStatus,
    updateUserPermissions,
    logRBACEvent,
    clearRBACLog,
    canAccessResource,
  ]);

  const contextValue = useMemo(() => ({
    state,
    dispatch,
    actions
  }), [state, actions]);
  
  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}

export default AppStateContext;