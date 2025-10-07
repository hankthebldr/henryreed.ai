/**
 * Palo Alto Networks & Cortex Branding Components
 * 
 * This module exports all branding components for easy importing
 * throughout the application.
 * 
 * Usage:
 * import { PaloAltoLogo, CortexIcon, BrandedButton } from '@/components/branding';
 */

// Logo Components
export { 
  PaloAltoLogo, 
  PaloAltoLogoText,
  type PaloAltoLogoProps,
  type PaloAltoLogoTextProps 
} from './PaloAltoLogo';

// Icon Components
export { 
  CortexIcon, 
  CortexBadge,
  type CortexIconProps,
  type CortexBadgeProps,
  type CortexVariant 
} from './CortexIcon';

// Button Components
export { 
  BrandedButton, 
  ButtonGroup,
  type BrandedButtonProps,
  type ButtonGroupProps,
  type ButtonVariant 
} from './BrandedButton';

// Re-export brand configuration types for convenience
export type {
  LogoSize,
  IconSize,
  ButtonSize,
  BrandColorKey,
  PaloAltoColorKey,
  CortexColorKey,
  SemanticColorKey,
  NeutralColorKey,
  BrandGradientKey,
} from '../../config/brand';

// Re-export brand configuration for component usage
export { brandConfig, brandColors, brandAssets } from '../../config/brand';