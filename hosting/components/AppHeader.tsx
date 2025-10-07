"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppState } from '../contexts/AppStateContext';
import { SettingsPanel } from './SettingsPanel';
import { PaloAltoLogo, CortexIcon } from '../src/components/branding';

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
    <header className="bg-cortex-bg-primary border-b border-cortex-border-primary sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Brand Section */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/gui" 
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
            >
              {/* Palo Alto Networks Logo with white background for visibility */}
              <div className="bg-white p-2 rounded-lg">
                <PaloAltoLogo 
                  size={isMobile ? "sm" : "md"} 
                  priority 
                  clickable
                  className="" 
                />
              </div>
            </Link>
            <div className="border-l border-cortex-border-primary pl-4">
              <div className="flex items-center space-x-2">
                <CortexIcon className="w-5 h-5 text-cortex-orange" />
                <div>
                  <div className="text-base font-bold text-cortex-text-primary">
                    Cortex Domain Consultant Platform
                  </div>
                  {!isMobile && (
                    <div className="text-xs text-cortex-text-muted font-medium">
                      Professional Services Portal
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="flex items-center space-x-8">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                href="/gui"
                className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center space-x-2 ${
                  isGUI 
                    ? "bg-cortex-orange text-white" 
                    : "text-cortex-text-secondary hover:text-cortex-orange hover:bg-cortex-bg-hover"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2v0z" />
                </svg>
                <span>Dashboard</span>
              </Link>
              {hasTerminalAccess && (
                <Link
                  href="/terminal"
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center space-x-2 ${
                    isTerminal 
                      ? "bg-cortex-green text-white" 
                      : "text-cortex-text-secondary hover:text-cortex-green hover:bg-cortex-bg-hover"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Terminal</span>
                </Link>
              )}
              <Link
                href="/trr"
                className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center space-x-2 ${
                  isTRR 
                    ? "bg-cortex-orange text-white" 
                    : "text-cortex-text-secondary hover:text-cortex-orange hover:bg-cortex-bg-hover"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>TRR</span>
              </Link>
              <Link
                href="/content"
                className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center space-x-2 ${
                  isContent 
                    ? "bg-cortex-green text-white" 
                    : "text-cortex-text-secondary hover:text-cortex-green hover:bg-cortex-bg-hover"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Content</span>
              </Link>
              <Link
                href="/docs"
                className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center space-x-2 ${
                  isDocs 
                    ? "bg-cortex-info text-white" 
                    : "text-cortex-text-secondary hover:text-cortex-info hover:bg-cortex-bg-hover"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Docs</span>
              </Link>
              <Link
                href="/alignment-guide"
                className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center space-x-2 ${
                  isAlignmentGuide 
                    ? "bg-cortex-warning text-black" 
                    : "text-cortex-text-secondary hover:text-cortex-warning hover:bg-cortex-bg-hover"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Commands</span>
              </Link>
            </nav>

            {/* Mobile Navigation - Icon Only */}
            <nav className="flex md:hidden items-center space-x-1">
              <Link href="/gui" className={`p-2 rounded-lg ${isGUI ? 'bg-cortex-orange text-white' : 'text-cortex-text-secondary hover:bg-cortex-bg-hover'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
              </Link>
              {hasTerminalAccess && (
                <Link href="/terminal" className={`p-2 rounded-lg ${isTerminal ? 'bg-cortex-green text-white' : 'text-cortex-text-secondary hover:bg-cortex-bg-hover'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </Link>
              )}
              <Link href="/trr" className={`p-2 rounded-lg ${isTRR ? 'bg-cortex-orange text-white' : 'text-cortex-text-secondary hover:bg-cortex-bg-hover'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </Link>
              <Link href="/content" className={`p-2 rounded-lg ${isContent ? 'bg-cortex-green text-white' : 'text-cortex-text-secondary hover:bg-cortex-bg-hover'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Link>
            </nav>

              {/* User Info & Settings */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-cortex-orange flex items-center justify-center text-white font-bold text-sm">
                    {currentUser.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-2 hidden md:block">
                    <div className="text-cortex-text-primary font-medium text-sm">{currentUser}</div>
                    {state.auth.user && (
                      <div className="text-cortex-text-muted text-xs">
                        {state.auth.viewMode === 'admin' ? 'Administrator' : 'Consultant'}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="flex items-center space-x-1">
                  {hasTerminalAccess && (
                    <button
                      onClick={() => actions.openTerminal()}
                      className="p-2 rounded-lg text-cortex-text-secondary hover:text-cortex-green hover:bg-cortex-bg-hover transition-all duration-300"
                      title="Open Terminal"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                  )}
                  
                  {state.auth.user && (
                    <button
                      onClick={() => setShowSettings(true)}
                      className="p-2 rounded-lg text-cortex-text-secondary hover:text-cortex-orange hover:bg-cortex-bg-hover transition-all duration-300"
                      title="Settings"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="text-cortex-text-secondary hover:text-cortex-error px-2 py-1 rounded hover:bg-cortex-bg-hover transition-all duration-300 text-sm flex items-center"
                    title="Logout"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </div>
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

