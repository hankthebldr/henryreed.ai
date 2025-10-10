// legacy-orange: replaced by green per Cortex rebrand (2025-10-08)
/**
 * Palo Alto Networks & Cortex Brand Configuration
 * 
 * This file contains the complete brand configuration for Palo Alto Networks
 * and Cortex products integration into the henryreed.ai application.
 * 
 * All colors are sourced from official Palo Alto Networks branding assets.
 */

// Brand Colors Configuration
export const brandColors = {
  paloAlto: {
    // Primary brand colors from official Palo Alto Networks guidelines
    orange: '#FA582D',        // Primary Palo Alto Networks orange
    darkOrange: '#da532c',    // Darker variant for hover/active states
    darkGray: '#141414',      // Primary text color from logo
  },
  cortex: {
    // Official Cortex XSIAM product colors
    primary: '#00CC66',       // Cortex signature green
    primaryDark: '#00B359',   // Darker green for interactions
    primaryLight: '#33D580',  // Lighter green for highlights
    gray: '#6B7280',         // Cortex UI gray
    darkGray: '#374151',     // Darker gray for backgrounds
    lightGray: '#F3F4F6',    // Light gray for surfaces
    accent: '#8ad3de',       // Theme accent color from meta tags
    blue: '#00c0e8',         // Interactive elements color
  },
  // Semantic color mapping
  semantic: {
    primary: '#00CC66',       // Cortex green for primary actions
    success: '#00CC66',       // Success states using Cortex green
    warning: '#F59E0B',       // Warning states (amber)
    danger: '#EF4444',        // Error/danger states (red)
    info: '#00c0e8',          // Info messages (Cortex blue)
  },
  // Neutral colors for UI elements
  neutral: {
    white: '#FFFFFF',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    black: '#000000',
  },
} as const;

// Gradient Definitions
export const brandGradients = {
  primary: 'linear-gradient(135deg, #00CC66 0%, #8ad3de 100%)',
  primaryReverse: 'linear-gradient(135deg, #8ad3de 0%, #00CC66 100%)',
  subtle: 'linear-gradient(135deg, #00CC66 0%, #00B359 100%)',
  cortexTheme: 'linear-gradient(135deg, #00c0e8 0%, #00CC66 100%)',
  success: 'linear-gradient(135deg, #00CC66 0%, #33D580 100%)',
  accent: 'linear-gradient(135deg, #00CC66 0%, #FA582D 100%)',
} as const;

// Typography Configuration
export const brandTypography = {
  fontFamily: {
    // Palo Alto Networks uses similar sans-serif fonts
    primary: [
      'Inter', 
      '-apple-system', 
      'BlinkMacSystemFont', 
      'Segoe UI', 
      'Roboto', 
      'Helvetica Neue', 
      'Arial', 
      'sans-serif'
    ].join(', '),
    mono: [
      'Menlo',
      'Monaco', 
      'Consolas', 
      'Liberation Mono', 
      'Courier New', 
      'monospace'
    ].join(', '),
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
} as const;

// Spacing Scale (following 8px grid system)
export const brandSpacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem',    // 256px
} as const;

// Component Size Presets
export const brandSizes = {
  logo: {
    sm: { width: 80, height: 15 },   // Small screens
    md: { width: 120, height: 23 },  // Default size
    lg: { width: 160, height: 31 },  // Large screens
    xl: { width: 200, height: 38 },  // Extra large
  },
  icon: {
    xs: { width: 16, height: 16 },
    sm: { width: 20, height: 20 },
    md: { width: 24, height: 24 },
    lg: { width: 32, height: 32 },
    xl: { width: 40, height: 40 },
    '2xl': { width: 48, height: 48 },
  },
  button: {
    sm: {
      fontSize: '0.875rem',
      padding: '0.5rem 0.75rem',
      height: '2rem',
    },
    md: {
      fontSize: '1rem',
      padding: '0.625rem 1rem',
      height: '2.5rem',
    },
    lg: {
      fontSize: '1.125rem',
      padding: '0.75rem 1.25rem',
      height: '3rem',
    },
  },
} as const;

// Shadow Configuration
export const brandShadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
} as const;

// Border Radius Configuration
export const brandBorderRadius = {
  none: '0',
  sm: '0.125rem',    // 2px
  base: '0.25rem',   // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',
} as const;

// Type definitions for better TypeScript support
export type BrandColorKey = keyof typeof brandColors;
export type PaloAltoColorKey = keyof typeof brandColors.paloAlto;
export type CortexColorKey = keyof typeof brandColors.cortex;
export type SemanticColorKey = keyof typeof brandColors.semantic;
export type NeutralColorKey = keyof typeof brandColors.neutral;
export type BrandGradientKey = keyof typeof brandGradients;
export type LogoSize = keyof typeof brandSizes.logo;
export type IconSize = keyof typeof brandSizes.icon;
export type ButtonSize = keyof typeof brandSizes.button;

// Helper function to get brand colors with TypeScript support
export const getBrandColor = (category: BrandColorKey, color?: string): string => {
  if (!color) {
    return brandColors[category] as any;
  }
  return (brandColors[category] as any)[color] || brandColors.paloAlto.orange;
};

// Asset paths configuration
export const brandAssets = {
  logos: {
    paloAlto: '/assets/branding/logos/pan-logo-dark.svg',
  },
  icons: {
    cortex32: '/assets/branding/icons/cortex-32x32.png',
    cortex192: '/assets/branding/icons/cortex-192x192.png',
  },
  favicons: {
    standard: '/assets/branding/favicons/favicon-32x32.png',
    appleTouchIcon: '/apple-touch-icon-180x180.png',
    // Use the branded favicon located under hosting/public/assets/branding/favicons
    activeFavicon: '/assets/branding/favicons/favicon.ico',
  },
} as const;

// Export default configuration object
export const brandConfig = {
  colors: brandColors,
  gradients: brandGradients,
  typography: brandTypography,
  spacing: brandSpacing,
  sizes: brandSizes,
  shadows: brandShadows,
  borderRadius: brandBorderRadius,
  assets: brandAssets,
} as const;

export default brandConfig;