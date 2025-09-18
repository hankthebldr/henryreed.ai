"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppState } from '../contexts/AppStateContext';

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, actions } = useAppState();
  const { setMode, updateBreadcrumbs } = actions;

  const isGUI = pathname?.startsWith("/gui");
  const isTerminal = pathname?.startsWith("/terminal");
  const isDocs = pathname?.startsWith("/docs");
  const isAlignmentGuide = pathname?.startsWith("/alignment-guide");
  const isTRR = pathname?.startsWith("/trr");
  const isContent = pathname?.startsWith("/content");
  const isHome = pathname === "/";

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
    router.push("/");
  };

  const currentUser =
    typeof window !== "undefined"
      ? sessionStorage.getItem("dc_user") || "consultant"
      : "consultant";

  // Don't show header on login page
  if (isHome) return null;

  return (
    <header className="bg-cortex-bg-secondary border-b border-cortex-border-secondary p-3 sticky top-0 z-40 backdrop-blur-sm">
      <div className="flex justify-between items-center">
        {/* Brand */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <Link 
            href="/gui" 
className="text-base md:text-lg font-bold text-cortex-green hover:text-cortex-green-light transition-colors"
          >
            <span className="sm:hidden">🛡️ Cortex DC</span>
            <span className="hidden sm:inline">🛡️ Cortex DC Portal</span>
          </Link>
          <div className="text-xs md:text-sm text-cortex-text-muted hidden md:inline">Palo Alto Networks</div>
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
            <Link
              href="/terminal"
              className={`p-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                isTerminal 
                  ? "bg-cortex-green text-black shadow-lg cortex-glow-green" 
                  : "text-cortex-text-secondary hover:text-cortex-green hover:bg-cortex-bg-hover"
              }`}
              title="Terminal Interface"
            >
              <span className="text-base">💻</span>
            </Link>
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
            <Link
              href="/terminal"
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                isTerminal 
                  ? "bg-cortex-green text-black shadow-lg transform scale-105 cortex-glow-green" 
                  : "text-cortex-text-secondary hover:text-cortex-green hover:bg-cortex-bg-hover"
              }`}
            >
              <span className="text-base">💻</span>
              <span>Terminal</span>
            </Link>
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
            <div className="flex items-center space-x-1 md:space-x-2">
<span className="text-cortex-green">👤</span>
              <span className="text-cortex-text-primary font-medium hidden sm:inline">{currentUser}</span>
              {/* Show current mode indicator */}
              {(isGUI || isTerminal) && (
<span className={`px-1 md:px-2 py-1 rounded text-xs font-mono border ${
                  isGUI ? 'bg-cortex-green/20 text-cortex-green border-cortex-green/30' : 'bg-cortex-green/20 text-cortex-green border-cortex-green/30'
                }`}>
                  {isGUI ? 'GUI' : 'Terminal'}
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="text-cortex-error hover:text-cortex-error-light px-2 md:px-3 py-1 rounded border border-cortex-error/30 hover:border-cortex-error/50 transition-colors text-xs font-medium"
              title="Logout"
            >
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">🚺</span>
            </button>
          </div>
        </div>
      </div>
      
    </header>
  );
}

