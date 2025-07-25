// GitHub-dark inspired color palette with accessible contrast ratios
export const colors = {
  // Base colors
  white: '#ffffff',
  black: '#000000',
  
  // Gray scale (GitHub-dark inspired)
  gray: {
    50: '#f6f8fa',
    100: '#eaeef2',
    200: '#d0d7de',
    300: '#afb8c1',
    400: '#8c959f',
    500: '#6e7681',
    600: '#57606a',
    700: '#424a53',
    800: '#32383f',
    900: '#24292f',
    950: '#1c2128',
  },
  
  // Background colors (GitHub-dark)
  canvas: {
    default: '#0d1117',
    overlay: '#161b22',
    inset: '#010409',
    subtle: '#21262d',
  },
  
  // Foreground colors
  fg: {
    default: '#f0f6fc',
    muted: '#8b949e',
    subtle: '#6e7681',
    onEmphasis: '#ffffff',
  },
  
  // Border colors
  border: {
    default: '#30363d',
    muted: '#21262d',
    subtle: '#484f58',
  },
  
  // Accent colors
  accent: {
    fg: '#58a6ff',
    emphasis: '#1f6feb',
    muted: 'rgba(88, 166, 255, 0.4)',
    subtle: 'rgba(88, 166, 255, 0.15)',
  },
  
  // Success colors (terminal green)
  success: {
    fg: '#3fb950',
    emphasis: '#238636',
    muted: 'rgba(63, 185, 80, 0.4)',
    subtle: 'rgba(63, 185, 80, 0.15)',
  },
  
  // Warning colors
  attention: {
    fg: '#d29922',
    emphasis: '#9a6700',
    muted: 'rgba(210, 153, 34, 0.4)',
    subtle: 'rgba(210, 153, 34, 0.15)',
  },
  
  // Danger colors
  danger: {
    fg: '#f85149',
    emphasis: '#da3633',
    muted: 'rgba(248, 81, 73, 0.4)',
    subtle: 'rgba(248, 81, 73, 0.15)',
  },
  
  // Terminal specific colors (maintaining existing functionality)
  terminal: {
    green: '#00ff00',
    amber: '#ffbf00',
    cyan: '#00ffff',
    red: '#ff0000',
    blue: '#0080ff',
    purple: '#8000ff',
  },
  
  // Done colors for completed states
  done: {
    fg: '#a5f3fc',
    emphasis: '#0891b2',
    muted: 'rgba(165, 243, 252, 0.4)',
    subtle: 'rgba(165, 243, 252, 0.15)',
  },
} as const;

export type Colors = typeof colors;
