"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppState } from '../contexts/AppStateContext';

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useAppState();

  const isGUI = pathname?.startsWith("/gui");
  const isTerminal = pathname?.startsWith("/terminal");
  const isDocs = pathname?.startsWith("/docs");
  const isHome = pathname === "/";

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
    <header className="bg-gray-900 border-b border-gray-700 p-3 sticky top-0 z-40">
      <div className="flex justify-between items-center">
        {/* Brand */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <Link 
            href="/gui" 
            className="text-base md:text-lg font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span className="sm:hidden">🛑 Cortex DC</span>
            <span className="hidden sm:inline">Cortex DC Portal</span>
          </Link>
          <div className="text-xs md:text-sm text-gray-400 hidden md:inline">Domain Consultant Hub</div>
        </div>

        {/* Main Navigation */}
        <div className="flex items-center space-x-2 md:space-x-6">
          {/* Mobile Navigation */}
          <nav className="flex md:hidden items-center space-x-1">
            <Link
              href="/gui"
              className={`p-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                isGUI 
                  ? "bg-blue-600 text-white shadow-lg" 
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
              title="GUI Interface"
            >
              <span className="text-base">🎨</span>
            </Link>
            <Link
              href="/terminal"
              className={`p-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                isTerminal 
                  ? "bg-green-600 text-white shadow-lg" 
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
              title="Terminal Interface"
            >
              <span className="text-base">💻</span>
            </Link>
            <Link
              href="/docs"
              className={`p-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                isDocs 
                  ? "bg-purple-600 text-white shadow-lg" 
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
              title="Documentation"
            >
              <span className="text-base">📖</span>
            </Link>
          </nav>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/gui"
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                isGUI 
                  ? "bg-blue-600 text-white shadow-lg transform scale-105" 
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
            >
              <span className="text-base">🎨</span>
              <span>GUI</span>
            </Link>
            <Link
              href="/terminal"
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                isTerminal 
                  ? "bg-green-600 text-white shadow-lg transform scale-105" 
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
            >
              <span className="text-base">💻</span>
              <span>Terminal</span>
            </Link>
            <Link
              href="/docs"
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                isDocs 
                  ? "bg-purple-600 text-white shadow-lg transform scale-105" 
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
            >
              <span className="text-base">📖</span>
              <span>Docs</span>
            </Link>
          </nav>

          {/* User Info & Actions */}
          <div className="flex items-center space-x-2 md:space-x-4 text-sm border-l border-gray-700 pl-2 md:pl-6">
            <div className="flex items-center space-x-1 md:space-x-2">
              <span className="text-cyan-400">👤</span>
              <span className="text-gray-300 font-medium hidden sm:inline">{currentUser}</span>
              {/* Show current mode indicator */}
              {(isGUI || isTerminal) && (
                <span className={`px-1 md:px-2 py-1 rounded text-xs font-mono ${
                  isGUI ? 'bg-blue-900/50 text-blue-400' : 'bg-green-900/50 text-green-400'
                }`}>
                  {isGUI ? 'GUI' : 'Terminal'}
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 px-2 md:px-3 py-1 rounded border border-red-600/30 hover:border-red-500/50 transition-colors text-xs font-medium"
              title="Logout"
            >
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">🚪</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Optional context info bar for authenticated pages */}
      {(isGUI || isTerminal) && (
        <div className="bg-gray-800/50 px-3 py-1 text-xs text-gray-400 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-4">
              <span className="text-green-400">•</span>
              <span className="hidden sm:inline">Online</span>
              {state?.commandBridge?.lastExecutedCommand && (
                <span className="hidden md:inline">
                  Last: <span className="font-mono text-gray-300">{state.commandBridge.lastExecutedCommand}</span>
                </span>
              )}
            </div>
            <div className="text-gray-500 text-xs">
              <span className="hidden sm:inline">{currentUser} • </span>
              {isGUI ? 'GUI' : 'Terminal'}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

