import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, boxShadow } from './spacing';

// Light theme colors (for when light mode is needed)
const lightColors = {
  // Base colors
  white: '#ffffff',
  black: '#000000',
  
  // Gray scale (inverted for light mode)
  gray: {
    50: '#24292f',
    100: '#32383f',
    200: '#424a53',
    300: '#57606a',
    400: '#6e7681',
    500: '#8c959f',
    600: '#afb8c1',
    700: '#d0d7de',
    800: '#eaeef2',
    900: '#f6f8fa',
    950: '#ffffff',
  },
  
  // Background colors (light mode)
  canvas: {
    default: '#ffffff',
    overlay: '#f6f8fa',
    inset: '#eaeef2',
    subtle: '#f6f8fa',
  },
  
  // Foreground colors (inverted for light mode)
  fg: {
    default: '#24292f',
    muted: '#57606a',
    subtle: '#6e7681',
    onEmphasis: '#ffffff',
  },
  
  // Border colors (adjusted for light mode)
  border: {
    default: '#d0d7de',
    muted: '#eaeef2',
    subtle: '#afb8c1',
  },
  
  // Keep accent/success/danger/attention colors the same for consistency
  accent: colors.accent,
  success: colors.success,
  attention: colors.attention,
  danger: colors.danger,
  terminal: colors.terminal,
  done: colors.done,
} as const;

// Theme configuration
export const theme = {
  colors: {
    light: lightColors,
    dark: colors,
  },
  typography,
  spacing,
  borderRadius,
  boxShadow,
} as const;

// CSS Custom Properties for runtime theme switching
export const cssVariables = {
  light: {
    // Background variables
    '--color-canvas-default': lightColors.canvas.default,
    '--color-canvas-overlay': lightColors.canvas.overlay,
    '--color-canvas-inset': lightColors.canvas.inset,
    '--color-canvas-subtle': lightColors.canvas.subtle,
    
    // Foreground variables
    '--color-fg-default': lightColors.fg.default,
    '--color-fg-muted': lightColors.fg.muted,
    '--color-fg-subtle': lightColors.fg.subtle,
    '--color-fg-on-emphasis': lightColors.fg.onEmphasis,
    
    // Border variables
    '--color-border-default': lightColors.border.default,
    '--color-border-muted': lightColors.border.muted,
    '--color-border-subtle': lightColors.border.subtle,
    
    // Accent variables
    '--color-accent-fg': lightColors.accent.fg,
    '--color-accent-emphasis': lightColors.accent.emphasis,
    '--color-accent-muted': lightColors.accent.muted,
    '--color-accent-subtle': lightColors.accent.subtle,
    
    // Success variables
    '--color-success-fg': lightColors.success.fg,
    '--color-success-emphasis': lightColors.success.emphasis,
    '--color-success-muted': lightColors.success.muted,
    '--color-success-subtle': lightColors.success.subtle,
    
    // Warning variables
    '--color-attention-fg': lightColors.attention.fg,
    '--color-attention-emphasis': lightColors.attention.emphasis,
    '--color-attention-muted': lightColors.attention.muted,
    '--color-attention-subtle': lightColors.attention.subtle,
    
    // Danger variables
    '--color-danger-fg': lightColors.danger.fg,
    '--color-danger-emphasis': lightColors.danger.emphasis,
    '--color-danger-muted': lightColors.danger.muted,
    '--color-danger-subtle': lightColors.danger.subtle,
    
    // Terminal variables
    '--color-terminal-green': lightColors.terminal.green,
    '--color-terminal-amber': lightColors.terminal.amber,
    '--color-terminal-cyan': lightColors.terminal.cyan,
    '--color-terminal-red': lightColors.terminal.red,
    '--color-terminal-blue': lightColors.terminal.blue,
    '--color-terminal-purple': lightColors.terminal.purple,
  },
  dark: {
    // Background variables
    '--color-canvas-default': colors.canvas.default,
    '--color-canvas-overlay': colors.canvas.overlay,
    '--color-canvas-inset': colors.canvas.inset,
    '--color-canvas-subtle': colors.canvas.subtle,
    
    // Foreground variables
    '--color-fg-default': colors.fg.default,
    '--color-fg-muted': colors.fg.muted,
    '--color-fg-subtle': colors.fg.subtle,
    '--color-fg-on-emphasis': colors.fg.onEmphasis,
    
    // Border variables
    '--color-border-default': colors.border.default,
    '--color-border-muted': colors.border.muted,
    '--color-border-subtle': colors.border.subtle,
    
    // Accent variables
    '--color-accent-fg': colors.accent.fg,
    '--color-accent-emphasis': colors.accent.emphasis,
    '--color-accent-muted': colors.accent.muted,
    '--color-accent-subtle': colors.accent.subtle,
    
    // Success variables
    '--color-success-fg': colors.success.fg,
    '--color-success-emphasis': colors.success.emphasis,
    '--color-success-muted': colors.success.muted,
    '--color-success-subtle': colors.success.subtle,
    
    // Warning variables
    '--color-attention-fg': colors.attention.fg,
    '--color-attention-emphasis': colors.attention.emphasis,
    '--color-attention-muted': colors.attention.muted,
    '--color-attention-subtle': colors.attention.subtle,
    
    // Danger variables
    '--color-danger-fg': colors.danger.fg,
    '--color-danger-emphasis': colors.danger.emphasis,
    '--color-danger-muted': colors.danger.muted,
    '--color-danger-subtle': colors.danger.subtle,
    
    // Terminal variables
    '--color-terminal-green': colors.terminal.green,
    '--color-terminal-amber': colors.terminal.amber,
    '--color-terminal-cyan': colors.terminal.cyan,
    '--color-terminal-red': colors.terminal.red,
    '--color-terminal-blue': colors.terminal.blue,
    '--color-terminal-purple': colors.terminal.purple,
  },
} as const;

export type Theme = typeof theme;
export type ThemeMode = 'light' | 'dark';

export { colors, typography, spacing, borderRadius, boxShadow };
