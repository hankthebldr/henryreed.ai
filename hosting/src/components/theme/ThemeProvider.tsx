'use client';

import React, { createContext, useContext } from 'react';
import { useTheme, UseThemeReturn } from '../../theme/useTheme';

const ThemeContext = createContext<UseThemeReturn | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Theme provider component that manages theme state and provides it to child components
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeValue = useTheme();

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 */
export function useThemeContext(): UseThemeReturn {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
