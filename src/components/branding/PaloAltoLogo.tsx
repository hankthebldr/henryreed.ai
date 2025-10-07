/**
 * PaloAltoLogo Component
 * 
 * Official Palo Alto Networks logo component with configurable sizing
 * and proper TypeScript props interface.
 * 
 * Usage:
 * <PaloAltoLogo size="md" className="hover:opacity-90" />
 * <PaloAltoLogo size="lg" onClick={handleClick} />
 */

import React from 'react';
import Image from 'next/image';
import { brandSizes, brandAssets } from '../../config/brand';
import type { LogoSize } from '../../config/brand';

export interface PaloAltoLogoProps {
  /** Size of the logo */
  size?: LogoSize;
  /** Additional CSS classes */
  className?: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLImageElement>) => void;
  /** Whether the logo should be clickable (adds hover effects) */
  clickable?: boolean;
  /** Loading priority for Next.js Image optimization */
  priority?: boolean;
}

/**
 * PaloAltoLogo component renders the official Palo Alto Networks logo
 * with proper sizing, accessibility, and hover effects.
 */
export const PaloAltoLogo: React.FC<PaloAltoLogoProps> = ({
  size = 'md',
  className = '',
  alt = 'Palo Alto Networks',
  onClick,
  clickable = false,
  priority = false,
}) => {
  const logoSizes = brandSizes.logo[size];
  
  // Build CSS classes
  const baseClasses = 'transition-all duration-200';
  const hoverClasses = (clickable || onClick) ? 'hover:opacity-80 cursor-pointer' : '';
  const combinedClasses = [baseClasses, hoverClasses, className].filter(Boolean).join(' ');

  return (
    <Image
      src={brandAssets.logos.paloAlto}
      alt={alt}
      width={logoSizes.width}
      height={logoSizes.height}
      className={combinedClasses}
      onClick={onClick}
      priority={priority}
      style={{
        maxWidth: '100%',
        height: 'auto',
      }}
    />
  );
};

/**
 * PaloAltoLogoText component for text-only scenarios where the logo
 * cannot be displayed but branding is still needed.
 */
export interface PaloAltoLogoTextProps {
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLSpanElement>) => void;
  /** Size variant for text */
  size?: 'sm' | 'md' | 'lg';
}

export const PaloAltoLogoText: React.FC<PaloAltoLogoTextProps> = ({
  className = '',
  onClick,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const baseClasses = 'font-semibold text-pan-orange transition-colors duration-200';
  const hoverClasses = onClick ? 'hover:text-pan-orange-dark cursor-pointer' : '';
  const combinedClasses = [
    baseClasses, 
    hoverClasses, 
    sizeClasses[size], 
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={combinedClasses} onClick={onClick}>
      Palo Alto Networks
    </span>
  );
};

export default PaloAltoLogo;