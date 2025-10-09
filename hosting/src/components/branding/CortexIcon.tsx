/**
 * CortexIcon Component
 * 
 * Cortex product-specific icon component with variant support for
 * different Cortex products (XSIAM, XDR, XSOAR).
 * 
 * Usage:
 * <CortexIcon variant="xsiam" size="md" />
 * <CortexIcon variant="xdr" size="lg" className="mr-2" />
 */

import React from 'react';
import Image from 'next/image';
import { brandSizes, brandAssets, type IconSize } from '../../config/brand';

export type CortexVariant = 'xsiam' | 'xdr' | 'xsoar' | 'generic';

export interface CortexIconProps {
  /** Cortex product variant */
  variant?: CortexVariant;
  /** Size of the icon */
  size?: IconSize;
  /** Additional CSS classes */
  className?: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLImageElement | HTMLDivElement>) => void;
  /** Whether the icon should be clickable (adds hover effects) */
  clickable?: boolean;
  /** Loading priority for Next.js Image optimization */
  priority?: boolean;
}

/**
 * CortexIcon component renders Cortex product icons with proper sizing,
 * accessibility, and product-specific branding.
 */
export const CortexIcon: React.FC<CortexIconProps> = ({
  variant = 'generic',
  size = 'md',
  className = '',
  alt,
  onClick,
  clickable = false,
  priority = false,
}) => {
  const iconSizes = brandSizes.icon[size];
  
  // Product-specific alt text
  const getAltText = (): string => {
    if (alt) return alt;
    
    const productNames = {
      xsiam: 'Cortex XSIAM',
      xdr: 'Cortex XDR',
      xsoar: 'Cortex XSOAR',
      generic: 'Cortex',
    };
    
    return productNames[variant];
  };

  // Build CSS classes
  const baseClasses = 'transition-all duration-200';
  const hoverClasses = (clickable || onClick) ? 'hover:opacity-80 hover:scale-105 cursor-pointer' : '';
  const combinedClasses = [baseClasses, hoverClasses, className].filter(Boolean).join(' ');

  // Use inline SVG Cortex XSIAM shield icon
  return (
    <div 
      className={combinedClasses}
      onClick={onClick}
      style={{
        width: iconSizes.width,
        height: iconSizes.height,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <svg
        width={iconSizes.width}
        height={iconSizes.height}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={getAltText()}
      >
        {/* Cortex XSIAM Shield Icon */}
        <path
          d="M12 2L3 6v6c0 5.5 4 10 9 12 5-2 9-6.5 9-12V6l-9-4z"
          fill="#00CC66"
          stroke="#00B359"
          strokeWidth="0.5"
        />
        {/* Inner security symbol */}
        <circle cx="12" cy="10" r="3" fill="#ffffff" opacity="0.9" />
        <path
          d="M10.5 10l1.5 1.5L15 8.5"
          stroke="#00CC66"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Bottom accent */}
        <rect x="8" y="15" width="8" height="1" rx="0.5" fill="#ffffff" opacity="0.7" />
      </svg>
    </div>
  );
};

/**
 * CortexBadge component combines the Cortex icon with product text
 * for use in headers, cards, and other prominent placements.
 */
export interface CortexBadgeProps {
  /** Cortex product variant */
  variant?: CortexVariant;
  /** Size of the badge */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  /** Whether to show only the icon */
  iconOnly?: boolean;
}

export const CortexBadge: React.FC<CortexBadgeProps> = ({
  variant = 'xsiam',
  size = 'md',
  className = '',
  onClick,
  iconOnly = false,
}) => {
  const sizeConfig = {
    sm: {
      iconSize: 'sm' as IconSize,
      textSize: 'text-sm',
      padding: 'px-2 py-1',
      gap: 'gap-1.5',
    },
    md: {
      iconSize: 'md' as IconSize,
      textSize: 'text-base',
      padding: 'px-3 py-2',
      gap: 'gap-2',
    },
    lg: {
      iconSize: 'lg' as IconSize,
      textSize: 'text-lg',
      padding: 'px-4 py-3',
      gap: 'gap-3',
    },
  };

  const config = sizeConfig[size];
  
  const productLabels = {
    xsiam: 'XSIAM',
    xdr: 'XDR',
    xsoar: 'XSOAR',
    generic: 'Cortex',
  };

  const baseClasses = `
    inline-flex items-center justify-center
    ${config.padding} ${config.gap}
    bg-cortex-primary/10 
    border border-cortex-primary/20
    rounded-lg
    transition-all duration-200
  `;
  
  const hoverClasses = onClick ? 'hover:bg-cortex-primary/20 hover:border-cortex-primary/30 cursor-pointer' : '';
  const combinedClasses = [baseClasses, hoverClasses, className].filter(Boolean).join(' ');

  return (
    <div className={combinedClasses} onClick={onClick}>
      <CortexIcon 
        variant={variant} 
        size={config.iconSize} 
        clickable={false}
      />
      {!iconOnly && (
        <span className={`font-medium text-cortex-primary ${config.textSize}`}>
          {productLabels[variant]}
        </span>
      )}
    </div>
  );
};

export default CortexIcon;