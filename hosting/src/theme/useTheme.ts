'use client';

import { useState, useEffect, useCallback } from 'react';
import { ThemeMode, cssVariables } from './index';

const STORAGE_KEY = 'theme-preference';

/**
 * Custom hook for managing theme state with localStorage persistence
 * and system preference detection
 */
export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [systemTheme, setSystemTheme] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState(false);

  // Get system preference
  const getSystemTheme = useCallback((): ThemeMode => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // Get stored theme preference
  const getStoredTheme = useCallback((): ThemeMode | null => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'light' || stored === 'dark' ? stored : null;
    } catch {
      return null;
    }
  }, []);

  // Apply CSS variables to document root
  const applyCSSVariables = useCallback((mode: ThemeMode) => {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    const variables = cssVariables[mode];
    
    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
    
    // Update data attribute for CSS selectors
    root.setAttribute('data-theme', mode);
    
    // Update class for compatibility with existing styles
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    const systemPreference = getSystemTheme();
    const storedPreference = getStoredTheme();
    
    setSystemTheme(systemPreference);
    
    // Use stored preference if available, otherwise use system preference
    const initialTheme = storedPreference || systemPreference;
    setTheme(initialTheme);
    applyCSSVariables(initialTheme);
    setMounted(true);
  }, [getSystemTheme, getStoredTheme, applyCSSVariables]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setSystemTheme(newSystemTheme);
      
      // If no manual preference is stored, follow system preference
      const storedPreference = getStoredTheme();
      if (!storedPreference) {
        setTheme(newSystemTheme);
        applyCSSVariables(newSystemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [getStoredTheme, applyCSSVariables]);

  // Set theme manually
  const setThemeMode = useCallback((newTheme: ThemeMode) => {
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Handle localStorage errors silently
    }
    
    setTheme(newTheme);
    applyCSSVariables(newTheme);
  }, [applyCSSVariables]);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeMode(newTheme);
  }, [theme, setThemeMode]);

  // Reset to system preference
  const resetToSystemTheme = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Handle localStorage errors silently
    }
    
    setTheme(systemTheme);
    applyCSSVariables(systemTheme);
  }, [systemTheme, applyCSSVariables]);

  // Check if current theme matches system preference
  const isSystemTheme = theme === systemTheme && !getStoredTheme();

  return {
    theme,
    systemTheme,
    mounted,
    setTheme: setThemeMode,
    toggleTheme,
    resetToSystemTheme,
    isSystemTheme,
  };
}

export type UseThemeReturn = ReturnType<typeof useTheme>;
