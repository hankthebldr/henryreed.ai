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
        // Palo Alto Networks Cortex Brand Colors (Official)
        cortex: {
          // Primary brand colors
          orange: {
            DEFAULT: '#FF6900',    // Primary Palo Alto Orange
            light: '#FF8533',      // Lighter orange
            dark: '#E55A00',       // Darker orange
            50: '#FFF4E6',
            100: '#FFE0B3',
            500: '#FF6900',
            600: '#E55A00',
            700: '#CC4D00',
            800: '#B33D00',
            900: '#992B00',
          },
          
          // Cortex greens (secondary brand color)
          green: {
            DEFAULT: '#00CC66',    // Cortex green
            light: '#33D580',      // Lighter green
            dark: '#00B359',       // Darker green
            50: '#E6FFF2',
            100: '#B3FFCC',
            500: '#00CC66',
            600: '#00B359',
            700: '#00994C',
            800: '#008040',
            900: '#006633',
          },
          
          // Dark theme backgrounds
          bg: {
            primary: '#000000',    // Pure black
            secondary: '#0D1117',  // GitHub-like dark
            tertiary: '#161B22',   // Elevated surfaces
            quaternary: '#21262D', // Cards and panels
            hover: '#30363D',      // Hover states
          },
          
          // Text hierarchy
          text: {
            primary: '#F0F6FC',    // Primary white text
            secondary: '#C9D1D9',  // Secondary text
            muted: '#8B949E',      // Muted text
            disabled: '#6E7681',   // Disabled text
            accent: '#58A6FF',     // Links and accents
          },
          
          // Border system
          border: {
            primary: '#FF6900',    // Orange primary borders
            secondary: '#30363D',  // Default borders
            muted: '#21262D',      // Subtle borders
            accent: '#00CC66',     // Green accent borders
          },
          
          // Status colors with dark theme variants
          success: {
            DEFAULT: '#00CC66',
            light: '#33D580',
            dark: '#00B359',
            bg: '#0D2818',
            border: '#00CC66',
          },
          warning: {
            DEFAULT: '#FF6900',
            light: '#FF8533',
            dark: '#E55A00',
            bg: '#2B1A00',
            border: '#FF6900',
          },
          error: {
            DEFAULT: '#F85149',
            light: '#FF7B72',
            dark: '#DA3633',
            bg: '#2D0F0F',
            border: '#F85149',
          },
          info: {
            DEFAULT: '#58A6FF',
            light: '#79B8FF',
            dark: '#388BFD',
            bg: '#0C1D2E',
            border: '#58A6FF',
          },
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-green': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}
