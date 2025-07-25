/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // CSS Custom Properties for theme switching
        canvas: {
          default: 'var(--color-canvas-default)',
          overlay: 'var(--color-canvas-overlay)',
          inset: 'var(--color-canvas-inset)',
          subtle: 'var(--color-canvas-subtle)',
        },
        fg: {
          default: 'var(--color-fg-default)',
          muted: 'var(--color-fg-muted)',
          subtle: 'var(--color-fg-subtle)',
          'on-emphasis': 'var(--color-fg-on-emphasis)',
        },
        border: {
          default: 'var(--color-border-default)',
          muted: 'var(--color-border-muted)',
          subtle: 'var(--color-border-subtle)',
        },
        accent: {
          fg: 'var(--color-accent-fg)',
          emphasis: 'var(--color-accent-emphasis)',
          muted: 'var(--color-accent-muted)',
          subtle: 'var(--color-accent-subtle)',
        },
        success: {
          fg: 'var(--color-success-fg)',
          emphasis: 'var(--color-success-emphasis)',
          muted: 'var(--color-success-muted)',
          subtle: 'var(--color-success-subtle)',
        },
        attention: {
          fg: 'var(--color-attention-fg)',
          emphasis: 'var(--color-attention-emphasis)',
          muted: 'var(--color-attention-muted)',
          subtle: 'var(--color-attention-subtle)',
        },
        danger: {
          fg: 'var(--color-danger-fg)',
          emphasis: 'var(--color-danger-emphasis)',
          muted: 'var(--color-danger-muted)',
          subtle: 'var(--color-danger-subtle)',
        },
        // Terminal colors (maintained for compatibility)
        terminal: {
          green: 'var(--color-terminal-green)',
          amber: 'var(--color-terminal-amber)',
          cyan: 'var(--color-terminal-cyan)',
          red: 'var(--color-terminal-red)',
          blue: 'var(--color-terminal-blue)',
          purple: 'var(--color-terminal-purple)',
        },
        // Legacy hack colors (maintained for compatibility)
        hack: {
          primary: '#00ff00',
          secondary: '#00aa00',
          background: '#0d1117',
          surface: '#161b22',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
        terminal: ['Share Tech Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
      },
      spacing: {
        px: '1px',
        0.5: '0.125rem',
        1.5: '0.375rem',
        2.5: '0.625rem',
        3.5: '0.875rem',
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        base: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        terminal: '0 0 20px rgba(0, 255, 0, 0.3)',
        'terminal-intense': '0 0 30px rgba(0, 255, 0, 0.5)',
        accent: '0 0 20px rgba(88, 166, 255, 0.3)',
      },
      animation: {
        'terminal-blink': 'blink 1s linear infinite',
        'matrix-rain': 'matrix-rain 20s linear infinite',
        'glitch': 'glitch 0.3s ease-in-out infinite alternate-reverse',
      },
      keyframes: {
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        'matrix-rain': {
          '0%': { transform: 'translateY(-100vh)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        glitch: {
          '0%': {
            textShadow: '0.05em 0 0 #00ffff, -0.03em -0.04em 0 #ff00ff, 0.025em 0.04em 0 #ffff00',
          },
          '15%': {
            textShadow: '0.05em 0 0 #00ffff, -0.03em -0.04em 0 #ff00ff, 0.025em 0.04em 0 #ffff00',
          },
          '16%': {
            textShadow: '-0.05em -0.025em 0 #00ffff, 0.025em 0.035em 0 #ff00ff, -0.05em -0.05em 0 #ffff00',
          },
          '49%': {
            textShadow: '-0.05em -0.025em 0 #00ffff, 0.025em 0.035em 0 #ff00ff, -0.05em -0.05em 0 #ffff00',
          },
          '50%': {
            textShadow: '0.05em 0.035em 0 #00ffff, 0.03em 0 0 #ff00ff, 0 -0.04em 0 #ffff00',
          },
          '99%': {
            textShadow: '0.05em 0.035em 0 #00ffff, 0.03em 0 0 #ff00ff, 0 -0.04em 0 #ffff00',
          },
          '100%': {
            textShadow: '-0.05em 0 0 #00ffff, -0.025em -0.04em 0 #ff00ff, -0.04em -0.025em 0 #ffff00',
          },
        },
      },
    },
  },
  plugins: [],
}
