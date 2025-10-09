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
    // Cortex Brand Palette mapped to CSS variables
    brand: {
      primary: 'rgb(var(--cortex-primary, 0 204 102))',
      secondary: 'rgb(var(--cortex-teal, 21 189 178))',
      tertiary: 'rgb(var(--cortex-blue, 0 192 232))',
      dark: 'rgb(var(--cortex-dark, 8 17 24))',
    },

    cortex: {
      primary: 'rgb(var(--cortex-primary, 0 204 102))',
      primaryLight: 'rgb(var(--cortex-primary-light, 54 231 149))',
      primaryDark: 'rgb(var(--cortex-primary-dark, 0 156 78))',
      secondary: 'rgb(var(--cortex-teal, 21 189 178))',
      tertiary: 'rgb(var(--cortex-blue, 0 192 232))',
      teal: 'rgb(var(--cortex-teal, 21 189 178))',
      blue: 'rgb(var(--cortex-blue, 0 192 232))',
      cyan: 'rgb(var(--cortex-cyan, 0 214 255))',
      purple: 'rgb(var(--cortex-purple, 130 125 255))',
      accent: 'rgb(var(--cortex-accent, 120 220 255))',
    },

    background: {
      primary: 'var(--cortex-bg-primary, #050C11)',
      secondary: 'var(--cortex-bg-secondary, #081118)',
      tertiary: 'var(--cortex-bg-tertiary, #0E1A22)',
      quaternary: 'var(--cortex-bg-quaternary, #13232D)',
      hover: 'var(--cortex-bg-hover, #1A303C)',
    },

    text: {
      primary: 'rgb(var(--cortex-text-primary, 224 244 239))',
      secondary: 'rgb(var(--cortex-text-secondary, 188 214 207))',
      muted: 'rgb(var(--cortex-text-muted, 148 173 168))',
      disabled: 'rgb(var(--cortex-text-disabled, 110 130 126))',
    },

    status: {
      success: 'rgb(var(--status-success, 0 204 140))',
      successBg: 'rgba(var(--status-success, 0 204 140), 0.12)',
      warning: 'rgb(var(--status-warning, 255 171 38))',
      warningBg: 'rgba(var(--status-warning, 255 171 38), 0.14)',
      error: 'rgb(var(--status-error, 239 83 80))',
      errorBg: 'rgba(var(--status-error, 239 83 80), 0.14)',
      info: 'rgb(var(--status-info, 32 196 255))',
      infoBg: 'rgba(var(--status-info, 32 196 255), 0.14)',
    },

    border: {
      primary: 'rgb(var(--cortex-border, 28 44 54))',
      secondary: 'rgb(var(--cortex-border-secondary, 46 70 82))',
      muted: 'rgb(var(--cortex-border-muted, 64 88 100))',
      accent: 'rgb(var(--cortex-primary, 0 204 102))',
      warning: 'rgb(var(--status-warning, 255 171 38))',
      error: 'rgb(var(--status-error, 239 83 80))',
      info: 'rgb(var(--status-info, 32 196 255))',
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
      primary: 'bg-gradient-to-r from-cortex-primary to-cortex-blue text-white shadow-cortex-md hover:shadow-cortex-lg transition-all duration-300',
      secondary: 'bg-cortex-bg-quaternary/80 hover:bg-cortex-bg-hover border border-cortex-border text-cortex-text-primary',
      outline: 'border border-cortex-border text-cortex-text-primary hover:border-cortex-primary hover:text-cortex-primary',
      ghost: 'text-cortex-primary hover:bg-cortex-primary/10',
      danger: 'bg-status-error hover:bg-status-error/90 text-white',
    },
    card: {
      default: 'bg-cortex-bg-tertiary border border-cortex-border rounded-lg',
      elevated: 'bg-cortex-bg-quaternary border border-cortex-border-secondary rounded-lg shadow-cortex-lg',
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