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
        cortex: {
          primary: withOpacity('--cortex-primary'),
          'primary-dark': withOpacity('--cortex-primary-dark'),
          'primary-light': withOpacity('--cortex-primary-light'),
          green: withOpacity('--cortex-green'),
          teal: withOpacity('--cortex-teal'),
          blue: withOpacity('--cortex-blue'),
          cyan: withOpacity('--cortex-cyan'),
          purple: withOpacity('--cortex-purple'),
          accent: withOpacity('--cortex-accent'),
          canvas: withOpacity('--cortex-canvas'),
          surface: withOpacity('--cortex-surface'),
          elevated: withOpacity('--cortex-elevated'),
          border: withOpacity('--cortex-border'),
          'border-strong': withOpacity('--cortex-border-strong'),
          'border-secondary': withOpacity('--cortex-border-secondary'),
          'border-muted': withOpacity('--cortex-border-muted'),
          dark: withOpacity('--cortex-dark'),
          'text-primary': withOpacity('--cortex-text-primary'),
          'text-secondary': withOpacity('--cortex-text-secondary'),
          'text-muted': withOpacity('--cortex-text-muted'),
          'text-disabled': withOpacity('--cortex-text-disabled'),
          'bg-primary': withOpacity('--cortex-bg-primary'),
          'bg-secondary': withOpacity('--cortex-bg-secondary'),
          'bg-tertiary': withOpacity('--cortex-bg-tertiary'),
          'bg-quaternary': withOpacity('--cortex-bg-quaternary'),
          'bg-hover': withOpacity('--cortex-bg-hover'),
        },
        status: {
          success: withOpacity('--status-success'),
          warning: withOpacity('--status-warning'),
          error: withOpacity('--status-error'),
          info: withOpacity('--status-info'),
        },
        ring: {
          brand: withOpacity('--ring-brand'),
          focus: withOpacity('--ring-focus'),
        },
        semantic: {
          success: withOpacity('--status-success'),
          warning: withOpacity('--status-warning'),
          danger: withOpacity('--status-error'),
          info: withOpacity('--status-info'),
        },
        neutral: {
          900: '#071018',
          800: '#0b1620',
          700: '#10202b',
          600: '#1a2f3c',
          500: '#2a3f4f',
          400: '#3c5668',
          300: '#567186',
          200: '#7f9ab0',
          100: '#b3ccd9',
          50: '#e5f2f7',
        },
        white: '#ffffff',
        black: '#000000',
        gray: {
          950: '#020508',
          900: '#050C11',
          800: '#081118',
          700: '#0E1A22',
          600: '#16242D',
          500: '#1F303A',
          400: '#2C3D49',
          300: '#405564',
          200: '#5C7383',
          100: '#7F9AA7',
          50: '#AFC5CE',
        },
        blue: {
          950: '#011E28',
          900: '#023546',
          800: '#034C63',
          700: '#04637F',
          600: '#058AAB',
          500: '#00C0E8',
          400: '#33D6F1',
          300: '#66E3F7',
          200: '#99F0FB',
          100: '#CCF9FD',
          50: '#EAFDFF',
        },
        cyan: {
          950: '#021E26',
          900: '#02343F',
          800: '#044C59',
          700: '#066372',
          600: '#088A9B',
          500: '#00D6FF',
          400: '#33E0FF',
          300: '#66EBFF',
          200: '#99F4FF',
          100: '#CCFAFF',
          50: '#E6FDFF',
        },
        green: {
          950: '#02170D',
          900: '#032612',
          800: '#05361A',
          700: '#074D26',
          600: '#0A6432',
          500: '#00CC66',
          400: '#2EDF88',
          300: '#63EAA8',
          200: '#97F3C7',
          100: '#C7FADF',
          50: '#E8FDF1',
        },
        purple: {
          950: '#1A1334',
          900: '#241948',
          800: '#2F1F5D',
          700: '#3C2677',
          600: '#4A3196',
          500: '#827DFF',
          400: '#9B95FF',
          300: '#B6B0FF',
          200: '#D0CBFF',
          100: '#E6E3FF',
          50: '#F4F2FF',
        },
        red: {
          950: '#2A0608',
          900: '#3F0B0F',
          800: '#5A1116',
          700: '#7A191E',
          600: '#A0242A',
          500: '#EF5350',
          400: '#F7706D',
          300: '#FA9A99',
          200: '#FDC5C4',
          100: '#FFE2E1',
          50: '#FFF4F3',
        },
        yellow: {
          950: '#1F1400',
          900: '#2C1E02',
          800: '#3E2B05',
          700: '#563A09',
          600: '#714C0F',
          500: '#FFAB26',
          400: '#FFBF59',
          300: '#FFD58C',
          200: '#FFE5B5',
          100: '#FFF2D8',
          50: '#FFF9ED',
        },
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
        'cortex-sm': '0 2px 4px rgba(0, 204, 140, 0.12)',
        'cortex-md': '0 6px 14px rgba(0, 204, 140, 0.18), 0 3px 8px rgba(0, 192, 232, 0.12)',
        'cortex-lg': '0 14px 28px rgba(0, 192, 232, 0.2), 0 6px 16px rgba(0, 204, 140, 0.18)',
        'cortex-xl': '0 24px 48px rgba(0, 192, 232, 0.25), 0 12px 24px rgba(0, 204, 140, 0.2)',

        // Glow effects
        'glow-brand': '0 0 22px rgba(0, 204, 140, 0.35), 0 0 48px rgba(0, 192, 232, 0.25)',
        'glow-success': '0 0 20px rgba(0, 204, 140, 0.35), 0 0 45px rgba(0, 204, 140, 0.2)',
        'glow-blue': '0 0 22px rgba(0, 192, 232, 0.35), 0 0 48px rgba(0, 192, 232, 0.2)',
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
        'gradient-shift': 'gradientShift 3s ease-in-out infinite',

        // Modern animations
        'fade-in-modern': 'fadeInModern 300ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'fadeIn': 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'scaleIn': 'scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
            boxShadow: '0 0 24px rgba(0, 204, 140, 0.35), 0 0 54px rgba(0, 214, 255, 0.2)',
            transform: 'scale(1)'
          },
          '50%': {
            boxShadow: '0 0 38px rgba(0, 192, 232, 0.35), 0 0 80px rgba(130, 125, 255, 0.25)',
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
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
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
        'pan-gradient': 'linear-gradient(135deg, rgb(var(--cortex-primary)) 0%, rgb(var(--cortex-blue)) 100%)',
        'pan-gradient-reverse': 'linear-gradient(135deg, rgb(var(--cortex-blue)) 0%, rgb(var(--cortex-primary)) 100%)',
        'cortex-gradient': 'linear-gradient(135deg, rgb(var(--cortex-blue)) 0%, rgb(var(--cortex-teal)) 100%)',
        
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
          color: `rgb(var(--cortex-text-secondary))`,
          backgroundColor: 'var(--cortex-bg-primary)',
        },
        'h1, h2, h3, h4, h5, h6': {
          color: `rgb(var(--cortex-text-primary))`,
          fontWeight: '600',
        },
        'p, span, div': {
          color: `rgb(var(--cortex-text-secondary))`,
        },
        'input, textarea': {
          color: `rgb(var(--cortex-text-primary)) !important`,
        },
        'input::placeholder, textarea::placeholder': {
          color: `rgb(var(--cortex-text-muted)) !important`,
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
        '.text-cortex-accent': { color: theme('colors.cortex.accent') },
        '.bg-cortex-accent': { backgroundColor: theme('colors.cortex.accent') },
        '.border-cortex-accent': { borderColor: theme('colors.cortex.accent') },
        
        /* DEPRECATED: Status aliasing - use status.* instead */
        '.text-status-success': { color: theme('colors.status.success') },
        '.bg-status-success': { backgroundColor: theme('colors.status.success') },
        '.text-status-warning': { color: theme('colors.status.warning') },
        '.bg-status-warning': { backgroundColor: theme('colors.status.warning') },
        '.text-status-error': { color: theme('colors.status.error') },
        '.bg-status-error': { backgroundColor: theme('colors.status.error') },
        '.text-status-info': { color: theme('colors.status.info') },
        '.bg-status-info': { backgroundColor: theme('colors.status.info') },
        
        /* DEPRECATED: Surface aliasing - use cortex.* instead */
        '.bg-cortex-bg-hover': { backgroundColor: theme('colors.cortex.bg-hover') },
        '.bg-cortex-bg-tertiary': { backgroundColor: theme('colors.cortex.bg-tertiary') },
        
        /* DEPRECATED: Text aliasing - use cortex.text-* instead */
        '.text-cortex-text-primary': { color: theme('colors.cortex.text-primary') },
        '.text-cortex-text-secondary': { color: theme('colors.cortex.text-secondary') },
        '.text-cortex-text-muted': { color: theme('colors.cortex.text-muted') },
      });
    }
  ],
}
