'use client';
// legacy-orange: replaced by green per Cortex rebrand (2025-10-08)


import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'dark'
}) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('cortex-theme') as Theme;
      if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    }
    setIsLoading(false);
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('cortex-theme', theme);
      } catch (error) {
        console.warn('Failed to save theme to localStorage:', error);
      }
    }
  }, [theme, isLoading]);

  // Apply theme to document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.className = theme;
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    isLoading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme configuration constants
export const THEME_CONFIG = {
  colors: {
    // Palo Alto Networks official brand colors
    brand: {
      primary: '#22c55e', // Palo Alto Networks Orange
      secondary: '#8ad3de', // Cortex Teal
      tertiary: '#00c0e8', // Cortex Blue
      dark: '#141414', // Palo Alto Dark
    },
    
    // Enhanced Cortex color system
    cortex: {
      primary: '#00CC66', // Cortex Primary Green
      primaryLight: '#33D580',
      primaryDark: '#00B359',
      secondary: '#22c55e', // Cortex Secondary Orange
      secondaryLight: '#bbf7d0',
      secondaryDark: '#15803d',
      accent: '#58A6FF', // Cortex Accent Blue
      accentLight: '#79B8FF',
      accentDark: '#388BFD',
    },
    
    // Background system for dark theme
    background: {
      primary: '#000000',
      secondary: '#0D1117',
      tertiary: '#161B22',
      quaternary: '#21262D',
      hover: '#30363D',
    },
    
    // Text hierarchy
    text: {
      primary: '#F0F6FC',
      secondary: '#C9D1D9',
      muted: '#8B949E',
      disabled: '#6E7681',
    },
    
    // Status colors
    status: {
      success: '#00CC66',
      successBg: '#0D2818',
      warning: '#F1C40F',
      warningBg: '#2B2000',
      error: '#F85149',
      errorBg: '#2D0F0F',
      info: '#58A6FF',
      infoBg: '#0C1D2E',
    },
    
    // Border system
    border: {
      primary: '#30363D',
      secondary: '#21262D',
      accent: '#00CC66',
      error: '#F85149',
      warning: '#F1C40F',
      info: '#58A6FF',
    }
  },
  
  // Animation timings
  animation: {
    fast: '0.15s',
    normal: '0.3s',
    slow: '0.5s',
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    }
  },
  
  // Shadow system
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 204, 102, 0.05)',
    md: '0 4px 6px -1px rgba(0, 204, 102, 0.1), 0 2px 4px -1px rgba(0, 204, 102, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 204, 102, 0.1), 0 4px 6px -2px rgba(0, 204, 102, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 204, 102, 0.1), 0 10px 10px -5px rgba(0, 204, 102, 0.04)',
    glow: '0 0 20px rgba(0, 204, 102, 0.4), 0 0 40px rgba(0, 204, 102, 0.2)',
    terminal: '0 0 50px rgba(0, 204, 102, 0.3), 0 8px 32px rgba(0, 204, 102, 0.15)',
  },
  
  // Breakpoints for responsive design
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Component variants
  variants: {
    button: {
      primary: 'bg-cortex-primary hover:bg-cortex-primary-light text-black font-semibold transition-all duration-300',
      secondary: 'bg-cortex-bg-quaternary hover:bg-cortex-bg-hover border border-cortex-border-primary text-cortex-text-primary',
      outline: 'border border-cortex-primary text-cortex-primary hover:bg-cortex-primary hover:text-black',
      ghost: 'text-cortex-primary hover:bg-cortex-primary/10',
      danger: 'bg-cortex-error hover:bg-cortex-error-light text-white',
    },
    card: {
      default: 'bg-cortex-bg-tertiary border border-cortex-border-primary rounded-lg',
      elevated: 'bg-cortex-bg-quaternary border border-cortex-border-primary rounded-lg shadow-cortex-lg',
      glass: 'glass-card rounded-lg',
      terminal: 'glass-terminal rounded-lg',
    }
  }
} as const;

// Utility functions for theme
export const getThemeColor = (path: string, theme: Theme = 'dark') => {
  const keys = path.split('.');
  let value: any = THEME_CONFIG.colors;
  
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) break;
  }
  
  return value || '#000000';
};

// CSS-in-JS utility for dynamic styles
export const createThemeStyles = (theme: Theme) => ({
  primary: `var(--color-cortex-primary, ${THEME_CONFIG.colors.cortex.primary})`,
  secondary: `var(--color-cortex-secondary, ${THEME_CONFIG.colors.cortex.secondary})`,
  background: `var(--color-bg-primary, ${THEME_CONFIG.colors.background.primary})`,
  text: `var(--color-text-primary, ${THEME_CONFIG.colors.text.primary})`,
});