/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          green: '#00ff00',
          amber: '#ffbf00',
          cyan: '#00ffff',
          red: '#ff0000',
          blue: '#0080ff',
          purple: '#8000ff',
        },
        hack: {
          primary: '#00ff00',
          secondary: '#00aa00',
          background: '#0d1117',
          surface: '#161b22',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        terminal: ['Share Tech Mono', 'Courier New', 'monospace'],
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
