'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { THEME_CONFIG } from '../providers/ThemeProvider';

// Navigation item interface
interface NavItem {
  id: string;
  name: string;
  icon: string;
  path: string;
  description: string;
  badge?: string;
  disabled?: boolean;
}

// Loading skeleton component
const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-cortex-bg-quaternary rounded ${className}`} />
);

// Navigation items configuration
const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: '📊',
    path: '/gui',
    description: 'POV Management & Analytics'
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: '💻',
    path: '/terminal',
    description: 'Command Interface'
  },
  {
    id: 'projects',
    name: 'Projects',
    icon: '🎯',
    path: '/gui?tab=projects',
    description: 'POV & TRR Management'
  },
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    icon: '🤖',
    path: '/gui?tab=ai',
    description: 'Gemini AI Analysis'
  },
  {
    id: 'scenarios',
    name: 'Scenarios',
    icon: '🎭',
    path: '/gui?tab=scenarios',
    description: 'Security Test Scenarios'
  },
  {
    id: 'content',
    name: 'Content',
    icon: '📝',
    path: '/content',
    description: 'Knowledge Base'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: '📈',
    path: '/gui?tab=data',
    description: 'Performance Metrics'
  }
];

// Header component with user info and actions
const AppHeader: React.FC<{
  user: any;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleSidebar: () => void;
}> = ({ user, onLogout, isCollapsed, onToggleSidebar }) => {
  return (
    <header className="h-16 bg-cortex-bg-secondary border-b border-cortex-border-primary flex items-center justify-between px-6 backdrop-blur-xl bg-opacity-95 sticky top-0 z-50">
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-cortex-bg-hover transition-colors duration-200 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5 text-cortex-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-cortex-primary rounded-lg flex items-center justify-center text-black font-bold text-sm">
            C
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-cortex-text-primary">
              Cortex DC Portal
            </h1>
            <p className="text-xs text-cortex-text-muted">
              Domain Consultant Platform
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Status indicator */}
        <div className="hidden md:flex items-center space-x-2 text-xs">
          <div className="w-2 h-2 bg-cortex-success rounded-full animate-pulse" />
          <span className="text-cortex-text-muted">System Online</span>
        </div>

        {/* User menu */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:block text-right">
            <div className="text-sm font-medium text-cortex-text-primary">
              {user?.displayName || user?.email || 'User'}
            </div>
            <div className="text-xs text-cortex-text-muted">
              Domain Consultant
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="p-2 rounded-lg hover:bg-cortex-bg-hover transition-all duration-200 text-cortex-text-muted hover:text-cortex-error"
            title="Sign Out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

// Sidebar navigation component
const Sidebar: React.FC<{
  items: NavItem[];
  activeItem: string;
  onNavigate: (item: NavItem) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}> = ({ items, activeItem, onNavigate, isCollapsed, onToggle }) => {
  return (
    <aside className={`
      fixed lg:relative inset-y-0 left-0 z-40
      ${isCollapsed ? 'w-20' : 'w-72'}
      bg-cortex-bg-tertiary border-r border-cortex-border-primary
      transition-all duration-300 ease-in-out
      flex flex-col
    `}>
      {/* Sidebar header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-cortex-border-primary">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-pan-orange to-cortex-teal rounded-md" />
            <span className="font-bold text-cortex-text-primary text-sm">
              Palo Alto Networks
            </span>
          </div>
        )}
        
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-cortex-bg-hover transition-colors duration-200 hidden lg:flex"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={`w-4 h-4 text-cortex-text-muted transition-transform duration-200 ${
              isCollapsed ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item)}
            disabled={item.disabled}
            className={`
              group w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
              transition-all duration-200 relative overflow-hidden
              ${
                activeItem === item.id
                  ? 'bg-cortex-primary text-black shadow-lg'
                  : 'text-cortex-text-secondary hover:bg-cortex-bg-hover hover:text-cortex-text-primary'
              }
              ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            title={isCollapsed ? `${item.name} - ${item.description}` : item.description}
          >
            {/* Active indicator */}
            {activeItem === item.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-cortex-primary to-cortex-primary opacity-10 rounded-lg" />
            )}
            
            {/* Icon */}
            <div className={`
              flex-shrink-0 text-lg
              ${isCollapsed ? 'mr-0' : 'mr-3'}
            `}>
              {item.icon}
            </div>

            {/* Label and description */}
            {!isCollapsed && (
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-cortex-secondary rounded-full text-black">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="text-xs text-cortex-text-muted truncate mt-0.5">
                  {item.description}
                </div>
              </div>
            )}

            {/* Hover effect */}
            <div className="absolute inset-0 bg-cortex-primary opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-200" />
          </button>
        ))}
      </nav>

      {/* Footer info */}
      {!isCollapsed && (
        <div className="p-4 border-t border-cortex-border-primary">
          <div className="text-xs text-cortex-text-muted text-center">
            <div className="font-mono">v2.5.0</div>
            <div className="mt-1">Cortex DC Platform</div>
          </div>
        </div>
      )}
    </aside>
  );
};

// Main content area with loading states
const ContentArea: React.FC<{
  children: React.ReactNode;
  isLoading?: boolean;
  title?: string;
}> = ({ children, isLoading = false, title }) => {
  if (isLoading) {
    return (
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {title && (
            <div className="flex items-center justify-between">
              <LoadingSkeleton className="h-8 w-48" />
              <LoadingSkeleton className="h-10 w-32" />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-6 space-y-4">
                <LoadingSkeleton className="h-6 w-3/4" />
                <LoadingSkeleton className="h-4 w-full" />
                <LoadingSkeleton className="h-4 w-2/3" />
                <div className="flex space-x-2">
                  <LoadingSkeleton className="h-8 w-16" />
                  <LoadingSkeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-auto bg-cortex-bg-primary">
      <div className="min-h-full">
        {children}
      </div>
    </main>
  );
};

// Main AppShell component
interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('dashboard');

  // Determine active nav item based on current path
  const currentNavItem = useMemo(() => {
    const item = NAV_ITEMS.find(item => {
      if (item.path === pathname) return true;
      if (item.path.includes('?') && pathname === item.path.split('?')[0]) {
        const params = new URLSearchParams(item.path.split('?')[1]);
        const currentParams = new URLSearchParams(window?.location?.search || '');
        return params.get('tab') === currentParams.get('tab');
      }
      return false;
    });
    return item?.id || 'dashboard';
  }, [pathname]);

  useEffect(() => {
    setActiveNavItem(currentNavItem);
  }, [currentNavItem]);

  // Handle navigation with loading state
  const handleNavigate = useCallback(async (item: NavItem) => {
    if (item.disabled) return;
    
    setIsLoading(true);
    setActiveNavItem(item.id);
    
    try {
      await router.push(item.path);
    } catch (error) {
      console.error('Navigation error:', error);
      setActiveNavItem(currentNavItem); // Revert on error
    } finally {
      setTimeout(() => setIsLoading(false), 300); // Min loading time for UX
    }
  }, [router, currentNavItem]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoading(false);
    }
  }, [logout, router]);

  // Responsive sidebar handling
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-screen flex bg-cortex-bg-primary text-cortex-text-primary overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        items={NAV_ITEMS}
        activeItem={activeNavItem}
        onNavigate={handleNavigate}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Mobile overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader
          user={user}
          onLogout={handleLogout}
          isCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <ContentArea isLoading={isLoading}>
          {children}
        </ContentArea>
      </div>
    </div>
  );
};

export default AppShell;