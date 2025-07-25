'use client';

import React from 'react';
import { useThemeContext } from './ThemeProvider';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

/**
 * Theme toggle button component for switching between light and dark modes
 */
export function ThemeToggle({ className = '', showLabel = true }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useThemeContext();

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div 
        className={`inline-flex items-center justify-center w-10 h-10 bg-canvas-subtle border border-border-default rounded-md ${className}`}
        aria-hidden=\"true\"
      >
        <div className=\"w-4 h-4 bg-fg-muted rounded-full animate-pulse\" />
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`
        inline-flex items-center justify-center
        w-10 h-10 bg-canvas-subtle hover:bg-canvas-overlay
        border border-border-default hover:border-border-subtle
        rounded-md transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-accent-emphasis focus:ring-offset-2
        focus:ring-offset-canvas-default
        ${className}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        // Sun icon for switching to light mode
        <svg
          className=\"w-5 h-5 text-fg-default\"
          fill=\"none\"
          stroke=\"currentColor\"
          viewBox=\"0 0 24 24\"
          xmlns=\"http://www.w3.org/2000/svg\"
        >
          <path
            strokeLinecap=\"round\"
            strokeLinejoin=\"round\"
            strokeWidth={2}
            d=\"M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z\"
          />
        </svg>
      ) : (
        // Moon icon for switching to dark mode
        <svg
          className=\"w-5 h-5 text-fg-default\"
          fill=\"none\"
          stroke=\"currentColor\"
          viewBox=\"0 0 24 24\"
          xmlns=\"http://www.w3.org/2000/svg\"
        >
          <path
            strokeLinecap=\"round\"
            strokeLinejoin=\"round\"
            strokeWidth={2}
            d=\"M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z\"
          />
        </svg>
      )}
      {showLabel && (
        <span className=\"sr-only\">
          {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        </span>
      )}
    </button>
  );
}

export default ThemeToggle;
