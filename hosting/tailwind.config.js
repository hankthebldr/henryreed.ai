/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Official Palo Alto Networks Brand Colors (2025 Update)
        'pan-orange': '#FA582D',           // Primary Palo Alto Networks orange
        'pan-orange-dark': '#da532c',      // Darker orange variant
        'pan-gray': '#141414',             // Primary text color
        'cortex-primary': '#FA582D',       // Cortex primary (matches Palo Alto)
        'cortex-teal': '#8ad3de',         // Cortex accent teal
        'cortex-blue': '#00c0e8',         // Cortex interactive blue
        'cortex-dark': '#141414',         // Cortex dark text
        
        // Working Cortex color scheme - FULLY RESTORED
        'cortex-orange': '#FF6900',
        'cortex-orange-light': '#FF8533',
        'cortex-orange-dark': '#E55A00',
        'cortex-green': '#00CC66',
        'cortex-green-light': '#33D580',
        'cortex-green-dark': '#00B359',
        
        // Dark theme backgrounds
        'cortex-bg-primary': '#000000',
        'cortex-bg-secondary': '#0D1117',
        'cortex-bg-tertiary': '#161B22',
        'cortex-bg-quaternary': '#21262D',
        'cortex-bg-hover': '#30363D',
        
        // Text hierarchy
        'cortex-text-primary': '#F0F6FC',
        'cortex-text-secondary': '#C9D1D9',
        'cortex-text-muted': '#8B949E',
        'cortex-text-disabled': '#6E7681',
        'cortex-text-accent': '#58A6FF',
        
        // Border system
        'cortex-border-primary': '#FF6900',
        'cortex-border-secondary': '#30363D',
        'cortex-border-muted': '#21262D',
        'cortex-border-accent': '#00CC66',
        
        // Status colors
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
        
        // Official Cortex branding with consistent colors
        cortex: {
          primary: '#FA582D',
          teal: '#8ad3de',
          blue: '#00c0e8',
          dark: '#141414',
        },
        },
        
        // Brand gradients for Palo Alto Networks
        backgroundImage: {
          'pan-gradient': 'linear-gradient(135deg, #FA582D 0%, #8ad3de 100%)',
          'pan-gradient-reverse': 'linear-gradient(135deg, #8ad3de 0%, #FA582D 100%)',
          'cortex-gradient': 'linear-gradient(135deg, #00c0e8 0%, #8ad3de 100%)',
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
      // Enhanced Typography Scale
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      
      // Enhanced Spacing Scale
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      
      // Modern Shadow System
      boxShadow: {
        'cortex-sm': '0 1px 2px 0 rgba(255, 105, 0, 0.05)',
        'cortex-md': '0 4px 6px -1px rgba(255, 105, 0, 0.1), 0 2px 4px -1px rgba(255, 105, 0, 0.06)',
        'cortex-lg': '0 10px 15px -3px rgba(255, 105, 0, 0.1), 0 4px 6px -2px rgba(255, 105, 0, 0.05)',
        'cortex-xl': '0 20px 25px -5px rgba(255, 105, 0, 0.1), 0 10px 10px -5px rgba(255, 105, 0, 0.04)',
        'cortex-2xl': '0 25px 50px -12px rgba(255, 105, 0, 0.25)',
        'cortex-inner': 'inset 0 2px 4px 0 rgba(255, 105, 0, 0.06)',
        'glow-green': '0 0 20px rgba(0, 204, 102, 0.4), 0 0 40px rgba(0, 204, 102, 0.2)',
        'glow-orange': '0 0 20px rgba(255, 105, 0, 0.4), 0 0 40px rgba(255, 105, 0, 0.2)',
        'terminal-glow': '0 0 50px rgba(0, 204, 102, 0.3), 0 8px 32px rgba(0, 204, 102, 0.15)',
      },
      
      // Modern Animation System
      animation: {
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
      },
      
      // Enhanced Keyframes
      keyframes: {
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
            boxShadow: '0 0 20px rgba(0, 204, 102, 0.4), 0 0 40px rgba(0, 204, 102, 0.1)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(0, 204, 102, 0.6), 0 0 60px rgba(0, 204, 102, 0.2)',
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
  plugins: [],
}
