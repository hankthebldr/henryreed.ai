'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Types for unified app state
export interface AppState {
  // Current interface mode
  mode: 'terminal' | 'gui';
  
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
    crossInterfaceData: any;
  };
}

type AppAction = 
  | { type: 'SET_MODE'; payload: 'terminal' | 'gui' }
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
  | { type: 'TRIGGER_GUI_ACTION'; payload: { action: string; data?: any } };

const initialState: AppState = {
  mode: 'gui',
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
  },
  ui: {
    notifications: [],
    loadingStates: {},
    modals: {},
  },
  commandBridge: {
    lastExecutedCommand: null,
    pendingGUIAction: null,
    crossInterfaceData: null,
  },
};

function appStateReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload };
      
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
      
    case 'TRIGGER_GUI_ACTION':
      return {
        ...state,
        commandBridge: {
          ...state.commandBridge,
          pendingGUIAction: action.payload.action,
          crossInterfaceData: action.payload.data,
        },
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
    
    // Data management actions
    updateData: (key: keyof AppState['data'], data: any) => void;
    
    // UI actions
    notify: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
    setLoading: (key: string, loading: boolean) => void;
    openModal: (key: string, data?: any) => void;
    closeModal: (key: string) => void;
    
    // Command bridge actions
    executeCommandFromGUI: (command: string, data?: any) => void;
    triggerGUIAction: (action: string, data?: any) => void;
  };
} | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appStateReducer, initialState);
  
  const actions = {
    setMode: useCallback((mode: 'terminal' | 'gui') => {
      dispatch({ type: 'SET_MODE', payload: mode });
    }, []),
    
    setActiveGUITab: useCallback((tab: string) => {
      dispatch({ type: 'SET_ACTIVE_GUI_TAB', payload: tab });
    }, []),
    
    addTerminalCommand: useCallback((command: string) => {
      dispatch({ type: 'ADD_TERMINAL_COMMAND', payload: command });
      dispatch({ type: 'SET_COMMAND_BRIDGE', payload: { lastExecutedCommand: command } });
    }, []),
    
    updateBreadcrumbs: useCallback((breadcrumbs: Array<{ label: string; path: string }>) => {
      dispatch({ type: 'UPDATE_BREADCRUMBS', payload: breadcrumbs });
    }, []),
    
    updateData: useCallback((key: keyof AppState['data'], data: any) => {
      dispatch({ type: 'UPDATE_DATA', payload: { key, data } });
    }, []),
    
    notify: useCallback((type: 'success' | 'error' | 'info' | 'warning', message: string) => {
      const notificationId = Math.random().toString(36).substring(2, 15);
      const timestamp = Date.now();
      
      dispatch({ type: 'ADD_NOTIFICATION', payload: { id: notificationId, type, message, timestamp } });
      
      // Auto-remove notifications after 5 seconds
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId });
      }, 5000);
    }, []),
    
    setLoading: useCallback((key: string, loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: { key, loading } });
    }, []),
    
    openModal: useCallback((key: string, data?: any) => {
      dispatch({ type: 'OPEN_MODAL', payload: { key, data } });
    }, []),
    
    closeModal: useCallback((key: string) => {
      dispatch({ type: 'CLOSE_MODAL', payload: key });
    }, []),
    
    executeCommandFromGUI: useCallback((command: string, data?: any) => {
      dispatch({ type: 'SET_COMMAND_BRIDGE', payload: { 
        lastExecutedCommand: command,
        crossInterfaceData: data 
      }});
    }, []),
    
    triggerGUIAction: useCallback((action: string, data?: any) => {
      dispatch({ type: 'TRIGGER_GUI_ACTION', payload: { action, data } });
    }, []),
  };
  
  return (
    <AppStateContext.Provider value={{ state, dispatch, actions }}>
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