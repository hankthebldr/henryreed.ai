/** @type {import('tailwindcss').Config} */

// Helper function for CSS variable colors with opacity support
const withOpacity = (variable) => ({ opacityValue }) =>
  opacityValue !== undefined
    ? `rgb(var(${variable}) / ${opacityValue})`
    : `rgb(var(${variable}))`;

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        // MODERN: Official Cortex Brand Colors (Token-based)
        cortex: {
          primary: withOpacity('--cortex-primary'),
          teal: withOpacity('--cortex-teal'),
          blue: withOpacity('--cortex-blue'),
          dark: withOpacity('--cortex-dark'),
          // Text tokens
          'text-primary': withOpacity('--cortex-text-primary'),
          'text-secondary': withOpacity('--cortex-text-secondary'),
          'text-muted': withOpacity('--cortex-text-muted'),
          // Surfaces
          canvas: withOpacity('--cortex-canvas'),
          surface: withOpacity('--cortex-surface'),
          elevated: withOpacity('--cortex-elevated'),
          border: withOpacity('--cortex-border'),
        },
        
        // Status Colors (WCAG Compliant)
        status: {
          success: withOpacity('--status-success'),
          warning: withOpacity('--status-warning'),
          error: withOpacity('--status-error'),
          info: withOpacity('--status-info'),
        },
        
        // Focus & Ring Colors
        ring: {
          brand: withOpacity('--ring-brand'),
          focus: withOpacity('--ring-focus'),
        },
        
        // LEGACY: Brand Colors (preserved for compatibility)
        'pan-orange': '#FA582D',           // Primary Palo Alto Networks orange
        'pan-orange-dark': '#da532c',      // Darker orange variant
        'pan-gray': '#141414',             // Primary text color
        'cortex-primary': '#FA582D',       // Cortex primary (matches Palo Alto)
        'cortex-teal': '#8ad3de',         // Cortex accent teal
        'cortex-blue': '#00c0e8',         // Cortex interactive blue
        'cortex-dark': '#141414',         // Cortex dark text
        
        // Official Cortex XSIAM Brand Colors
        'cortex-primary': '#00CC66',     // Primary Cortex green
        'cortex-primary-light': '#33D580', // Light green
        'cortex-primary-dark': '#00B359',  // Dark green
        'cortex-gray': '#6B7280',        // UI gray
        'cortex-gray-dark': '#374151',   // Dark gray
        'cortex-gray-light': '#F3F4F6',  // Light gray
        'cortex-accent': '#FA582D',      // PANW orange accent
        
        // Legacy compatibility
        'cortex-green': '#00CC66',
        'cortex-green-light': '#33D580',
        'cortex-green-dark': '#00B359',
        
        // LEGACY: Dark theme backgrounds - PRESERVED
        'cortex-bg-primary': '#000000',
        'cortex-bg-secondary': '#0D1117',
        'cortex-bg-tertiary': '#161B22',
        'cortex-bg-quaternary': '#21262D',
        'cortex-bg-hover': '#30363D',
        
        // LEGACY: Text hierarchy - ENHANCED VISIBILITY & CONTRAST
        'cortex-text-primary': '#FFFFFF',
        'cortex-text-secondary': '#F5F5F5',
        'cortex-text-muted': '#C8C8C8',
        'cortex-text-disabled': '#A0A0A0',
        'cortex-text-accent': '#58A6FF',
        
        // LEGACY: Border system - PRESERVED
        'cortex-border-primary': '#FF6900',
        'cortex-border-secondary': '#30363D',
        'cortex-border-muted': '#21262D',
        'cortex-border-accent': '#00CC66',
        
        // LEGACY: Status colors - PRESERVED
        'cortex-success': '#00CC66',
        'cortex-success-light': '#33D580',
        'cortex-success-dark': '#00B359',
        'cortex-success-bg': '#0D2818',
        'cortex-success-border': '#00CC66',
        
        'cortex-warning': '#FF6900',
        'cortex-warning-light': '#FF8533',
        'cortex-warning-dark': '#E55A00',
        'cortex-warning-bg': '#2B1A00',
        'cortex-warning-border': '#FF6900',
        
        'cortex-error': '#F85149',
        'cortex-error-light': '#FF7B72',
        'cortex-error-dark': '#DA3633',
        'cortex-error-bg': '#2D0F0F',
        'cortex-error-border': '#F85149',
        
        'cortex-info': '#58A6FF',
        'cortex-info-light': '#79B8FF',
        'cortex-info-dark': '#388BFD',
        'cortex-info-bg': '#0C1D2E',
        'cortex-info-border': '#58A6FF',
      },
      
      // Default border colors using modern tokens  
      borderColor: {
        DEFAULT: withOpacity('--cortex-border'),
      },
      
      // Ring colors for focus states
      ringColor: {
        DEFAULT: withOpacity('--ring-brand'),
        brand: withOpacity('--ring-brand'),
        focus: withOpacity('--ring-focus'),
      },
      
      // Modern Shadow System
      boxShadow: {
        // Glass shadows
        'glass-sm': '0 1px 2px rgb(0 0 0 / 0.35), 0 4px 8px rgb(0 0 0 / 0.25)',
        'glass-md': '0 4px 16px rgb(0 0 0 / 0.25), 0 8px 32px rgb(0 0 0 / 0.15)',
        'glass-lg': '0 8px 32px rgb(0 0 0 / 0.3), 0 16px 64px rgb(0 0 0 / 0.15)',
        
        // Brand shadows
        'cortex-sm': '0 1px 2px 0 rgba(250, 88, 45, 0.1)',
        'cortex-md': '0 4px 6px -1px rgba(250, 88, 45, 0.15), 0 2px 4px -1px rgba(250, 88, 45, 0.1)',
        'cortex-lg': '0 10px 15px -3px rgba(250, 88, 45, 0.15), 0 4px 6px -2px rgba(250, 88, 45, 0.1)',
        'cortex-xl': '0 20px 25px -5px rgba(250, 88, 45, 0.15), 0 10px 10px -5px rgba(250, 88, 45, 0.1)',
        
        // Glow effects
        'glow-brand': '0 0 20px rgba(250, 88, 45, 0.4), 0 0 40px rgba(250, 88, 45, 0.2)',
        'glow-success': '0 0 20px rgba(22, 163, 74, 0.4), 0 0 40px rgba(22, 163, 74, 0.2)',
        'glow-blue': '0 0 20px rgba(0, 192, 232, 0.4), 0 0 40px rgba(0, 192, 232, 0.2)',
      },
      
      // Modern Animation System  
      animation: {
        // Legacy animations (preserved)
        'pulse-green': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-out': 'fadeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-left': 'slideLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-right': 'slideRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-out': 'scaleOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-subtle': 'bounceSubtle 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'terminal-typing': 'terminalTyping 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        
        // Modern animations
        'fade-in-modern': 'fadeInModern 300ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-right-modern': 'slideRightModern 300ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in-modern': 'scaleInModern 250ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      
      // Enhanced Keyframes
      keyframes: {
        // Legacy keyframes (preserved)
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-4px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        bounceSubtle: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-4px)' },
          '70%': { transform: 'translateY(-2px)' },
        },
        glowPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(250, 88, 45, 0.4), 0 0 40px rgba(250, 88, 45, 0.1)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(250, 88, 45, 0.6), 0 0 60px rgba(250, 88, 45, 0.2)',
            transform: 'scale(1.02)'
          },
        },
        terminalTyping: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        
        // Modern keyframes
        fadeInModern: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRightModern: {
          '0%': { opacity: '0', transform: 'translateX(-6px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleInModern: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      
      // Brand gradients
      backgroundImage: {
        // Legacy gradients (preserved)
        'pan-gradient': 'linear-gradient(135deg, #FA582D 0%, #8ad3de 100%)',
        'pan-gradient-reverse': 'linear-gradient(135deg, #8ad3de 0%, #FA582D 100%)',
        'cortex-gradient': 'linear-gradient(135deg, #00c0e8 0%, #8ad3de 100%)',
        
        // Modern gradients using tokens
        'cortex-brand': 'linear-gradient(135deg, rgb(var(--cortex-primary)) 0%, rgb(var(--cortex-teal)) 100%)',
        'cortex-brand-reverse': 'linear-gradient(135deg, rgb(var(--cortex-teal)) 0%, rgb(var(--cortex-primary)) 100%)',
        'cortex-blue-teal': 'linear-gradient(135deg, rgb(var(--cortex-blue)) 0%, rgb(var(--cortex-teal)) 100%)',
      },
      
      // Enhanced Timing Functions
      transitionTimingFunction: {
        'brand': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      
      // Typography
      fontFamily: {
        'mono': ['JetBrains Mono', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
      
      // Enhanced Spacing Scale
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      
      // Enhanced Blur Effects
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      }
    },
  },
  
  plugins: [
    // Backward Compatibility Plugin & Text Readability
    function({ addUtilities, addBase, theme }) {
      // Base styles for better text readability
      addBase({
        'html': {
          colorScheme: 'dark',
        },
        'body': {
          color: '#F5F5F5',
          backgroundColor: '#000000',
        },
        'h1, h2, h3, h4, h5, h6': {
          color: '#FFFFFF',
          fontWeight: '600',
        },
        'p, span, div': {
          color: '#F5F5F5',
        },
        'input, textarea': {
          color: '#F5F5F5 !important',
        },
        'input::placeholder, textarea::placeholder': {
          color: '#999999 !important',
        },
      });
      
      // Text readability utilities
      addUtilities({
        '.text-readable': { 
          color: '#F5F5F5 !important' 
        },
        '.text-heading': { 
          color: '#FFFFFF !important',
          fontWeight: '600' 
        },
        '.text-muted-readable': { 
          color: '#C8C8C8 !important' 
        },
        '.text-disabled-readable': { 
          color: '#A0A0A0 !important' 
        },
        
        /* DEPRECATED: Brand aliasing - use cortex.primary instead */
        '.text-cortex-accent': { color: theme('colors.cortex.primary') },
        '.bg-cortex-accent': { backgroundColor: theme('colors.cortex.primary') },
        '.border-cortex-accent': { borderColor: theme('colors.cortex.primary') },
        
        /* DEPRECATED: Status aliasing - use status.* instead */
        '.text-cortex-success': { color: theme('colors.status.success') },
        '.bg-cortex-success': { backgroundColor: theme('colors.status.success') },
        '.text-cortex-warning': { color: theme('colors.status.warning') },
        '.bg-cortex-warning': { backgroundColor: theme('colors.status.warning') },
        '.text-cortex-error': { color: theme('colors.status.error') },
        '.bg-cortex-error': { backgroundColor: theme('colors.status.error') },
        '.text-cortex-info': { color: theme('colors.cortex.blue') },
        '.bg-cortex-info': { backgroundColor: theme('colors.cortex.blue') },
        
        /* DEPRECATED: Surface aliasing - use cortex.* instead */
        '.bg-cortex-bg-hover': { backgroundColor: theme('colors.cortex.elevated') },
        '.bg-cortex-bg-tertiary': { backgroundColor: theme('colors.cortex.surface') },
        '.border-cortex-border-secondary': { borderColor: theme('colors.cortex.border') },
        
        /* DEPRECATED: Text aliasing - use cortex.text-* instead */
        '.text-cortex-text-primary': { color: theme('colors.cortex.text-primary') },
        '.text-cortex-text-secondary': { color: theme('colors.cortex.text-secondary') },
        '.text-cortex-text-muted': { color: theme('colors.cortex.text-muted') },
      });
    }
  ],
}
