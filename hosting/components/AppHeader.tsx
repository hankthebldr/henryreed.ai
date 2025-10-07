"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppState } from '../contexts/AppStateContext';
import { SettingsPanel } from './SettingsPanel';
import { PaloAltoLogo, CortexBadge } from '../src/components/branding';

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, actions } = useAppState();
  const { setMode, updateBreadcrumbs } = actions;
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Media query for responsive logo sizing
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const isGUI = pathname?.startsWith("/gui");
  const isTerminal = pathname?.startsWith("/terminal");
  const isDocs = pathname?.startsWith("/docs");
  const isAlignmentGuide = pathname?.startsWith("/alignment-guide");
  const isTRR = pathname?.startsWith("/trr");
  const isContent = pathname?.startsWith("/content");
  const isHome = pathname === "/";
  
  // Check if user has terminal access (basic command permissions)
  const hasTerminalAccess = typeof window !== 'undefined' && 
    ['admin', 'manager', 'senior_dc', 'dc'].includes(
      sessionStorage.getItem('dc_user_role') || 'analyst'
    );

  // Keep global mode and breadcrumbs in sync with the current route
  useEffect(() => {
    if (!pathname) return;

    if (pathname.startsWith('/terminal')) {
      setMode('terminal');
      updateBreadcrumbs([
        { label: 'Home', path: '/gui' },
        { label: 'Terminal', path: '/terminal' },
      ]);
    } else if (pathname.startsWith('/gui')) {
      setMode('gui');
      updateBreadcrumbs([
        { label: 'Home', path: '/gui' },
      ]);
    } else if (pathname.startsWith('/trr')) {
      setMode('gui');
      updateBreadcrumbs([
        { label: 'Home', path: '/gui' },
        { label: 'TRR Management', path: '/trr' },
      ]);
    } else if (pathname.startsWith('/content')) {
      setMode('gui');
      updateBreadcrumbs([
        { label: 'Home', path: '/gui' },
        { label: 'Content Studio', path: '/content' },
      ]);
    } else if (pathname.startsWith('/docs')) {
      // Treat docs as a separate top-level area but keep mode consistent with GUI by default
      setMode('gui');
      updateBreadcrumbs([
        { label: 'Home', path: '/gui' },
        { label: 'Docs', path: '/docs' },
      ]);
    }
  }, [pathname, setMode, updateBreadcrumbs]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("dc_authenticated");
      sessionStorage.removeItem("dc_user");
    }
    // Clear AppState user
    actions.setUser(null);
    actions.notify('info', 'You have been logged out');
    router.push("/");
  };

  const handleViewModeChange = (mode: 'admin' | 'user') => {
    actions.setViewMode(mode);
    if (typeof window !== "undefined") {
      const savedUser = sessionStorage.getItem('dc_user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          user.viewMode = mode;
          sessionStorage.setItem('dc_user', JSON.stringify(user));
          actions.setUser(user);
        } catch (error) {
          console.error('Failed to update user view mode:', error);
        }
      }
    }
  };

  // Get current user from AppState or fall back to session storage
  const currentUser = state.auth.user?.username || (
    typeof window !== "undefined"
      ? (() => {
          const savedUser = sessionStorage.getItem("dc_user");
          if (savedUser) {
            try {
              const user = JSON.parse(savedUser);
              return user.username || "consultant";
            } catch {
              return "consultant";
            }
          }
          return "consultant";
        })()
      : "consultant"
  );

  // Don't show header on login page
  if (isHome) return null;

  return (
    <header className="bg-cortex-bg-secondary border-b border-cortex-border-secondary p-3 sticky top-0 z-40 backdrop-blur-sm">
      <div className="flex justify-between items-center">
        {/* Brand */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <Link 
            href="/gui" 
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <PaloAltoLogo 
              size={isMobile ? "sm" : "md"} 
              priority 
              clickable
              className="mr-2" 
            />
          </Link>
          <div className="flex flex-col">
            <div className="text-xs md:text-sm text-gray-300 font-semibold">
              Cortex DC Portal
            </div>
            {!isMobile && (
              <div className="text-xs text-orange-400 font-medium mt-1">
                Domain Consultant Platform
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex items-center space-x-2 md:space-x-6">
          {/* Mobile Navigation */}
          <nav className="flex md:hidden items-center space-x-1">
            <Link
              href="/gui"
              className={`p-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                isGUI 
? "bg-cortex-green text-black shadow-lg cortex-glow" 
                  : "text-cortex-text-secondary hover:text-cortex-green hover:bg-cortex-bg-hover"
              }`}
              title="GUI Interface"
            >
              <span className="text-base">🎨</span>
            </Link>
            {hasTerminalAccess && (
              <Link
                href="/terminal"
                className={`p-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  isTerminal 
                    ? "bg-black text-green-400 shadow-lg border border-green-400" 
                    : "text-cortex-text-secondary hover:text-green-400 hover:bg-cortex-bg-hover"
                }`}
                title="Terminal (RBAC Protected)"
              >
                <span className="text-base">⌨️</span>
              </Link>
            )}
            <Link
              href="/docs"
              className={`p-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                isDocs 
                  ? "bg-cortex-info text-black shadow-lg" 
                  : "text-cortex-text-secondary hover:text-cortex-info hover:bg-cortex-bg-hover"
              }`}
              title="Documentation"
            >
              <span className="text-base">📖</span>
            </Link>
            <Link
              href="/trr"
              className={`p-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                isTRR 
                  ? "bg-cortex-warning text-black shadow-lg" 
                  : "text-cortex-text-secondary hover:text-cortex-warning hover:bg-cortex-bg-hover"
              }`}
              title="TRR Management"
            >
              <span className="text-base">📋</span>
            </Link>
            <Link
              href="/content"
              className={`p-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                isContent 
                  ? "bg-cortex-success text-black shadow-lg" 
                  : "text-cortex-text-secondary hover:text-cortex-success hover:bg-cortex-bg-hover"
              }`}
              title="Content Creation"
            >
              <span className="text-base">✏️</span>
            </Link>
            <Link
              href="/alignment-guide"
              className={`p-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                isAlignmentGuide 
                  ? "bg-cortex-text-accent text-black shadow-lg" 
                  : "text-cortex-text-secondary hover:text-cortex-text-accent hover:bg-cortex-bg-hover"
              }`}
              title="Command Alignment Guide"
            >
              <span className="text-base">🔄</span>
            </Link>
          </nav>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/gui"
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                isGUI 
? "bg-cortex-green text-black shadow-lg transform scale-105 cortex-glow" 
                  : "text-cortex-text-secondary hover:text-cortex-green hover:bg-cortex-bg-hover"
              }`}
            >
              <span className="text-base">🎨</span>
              <span>GUI</span>
            </Link>
            {hasTerminalAccess && (
              <Link
                href="/terminal"
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                  isTerminal 
                    ? "bg-black text-green-400 shadow-lg transform scale-105 border border-green-400" 
                    : "text-cortex-text-secondary hover:text-green-400 hover:bg-gray-900"
                }`}
                title="RBAC-Protected Terminal Interface"
              >
                <span className="text-base">⌨️</span>
                <span>Terminal</span>
              </Link>
            )}
            <Link
              href="/docs"
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                isDocs 
                  ? "bg-cortex-info text-black shadow-lg transform scale-105" 
                  : "text-cortex-text-secondary hover:text-cortex-info hover:bg-cortex-bg-hover"
              }`}
            >
              <span className="text-base">📖</span>
              <span>Docs</span>
            </Link>
            <Link
              href="/alignment-guide"
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                isAlignmentGuide 
                  ? "bg-cortex-text-accent text-black shadow-lg transform scale-105" 
                  : "text-cortex-text-secondary hover:text-cortex-text-accent hover:bg-cortex-bg-hover"
              }`}
            >
              <span className="text-base">🔄</span>
              <span>Align</span>
            </Link>
          </nav>

          {/* User Info & Actions */}
          <div className="flex items-center space-x-2 md:space-x-4 text-sm border-l border-cortex-border-secondary pl-2 md:pl-6">
            {/* Terminal Toggle Button */}
            <button
              onClick={() => actions.openTerminal()}
              className="p-2 rounded-lg text-cortex-text-secondary hover:text-green-400 hover:bg-cortex-bg-hover transition-colors"
              title="Open Terminal"
            >
              <span className="text-lg">⌨️</span>
            </button>
            
            {/* Settings Gear */}
            {state.auth.user && (
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg text-cortex-text-secondary hover:text-cortex-green hover:bg-cortex-bg-hover transition-colors"
                title="Settings"
              >
                <span className="text-lg">⚙️</span>
              </button>
            )}
            
            <div className="flex items-center space-x-1 md:space-x-2">
              <span className="text-cortex-green">👤</span>
              <span className="text-cortex-text-primary font-medium hidden sm:inline">{currentUser}</span>
              {/* Show current view mode indicator */}
              {state.auth.user && (
                <span className={`px-1 md:px-2 py-1 rounded text-xs font-mono border ${
                  state.auth.viewMode === 'admin' 
                    ? 'bg-cortex-error/20 text-cortex-error border-cortex-error/30'
                    : 'bg-cortex-info/20 text-cortex-info border-cortex-info/30'
                }`}>
                  {state.auth.viewMode.toUpperCase()}
                </span>
              )}
              {/* Show current interface mode indicator */}
              {isGUI && (
                <span className={`px-1 md:px-2 py-1 rounded text-xs font-mono border bg-cortex-green/20 text-cortex-green border-cortex-green/30`}>
                  GUI
                </span>
              )}
            </div>
            
            <button
              onClick={handleLogout}
              className="text-cortex-error hover:text-cortex-error-light px-2 md:px-3 py-1 rounded border border-cortex-error/30 hover:border-cortex-error/50 transition-colors text-xs font-medium"
              title="Logout"
            >
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">🚪</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        user={state.auth.user}
        onViewModeChange={handleViewModeChange}
        onLogout={handleLogout}
      />
    </header>
  );
}

