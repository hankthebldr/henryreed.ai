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
import { brandSizes, brandAssets } from '../../config/brand';
import type { IconSize } from '../../config/brand';

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

  // For now, we use the 32x32 icon for smaller sizes and 192x192 for larger sizes
  const iconSrc = size === 'xs' || size === 'sm' ? 
    brandAssets.icons.cortex32 : 
    brandAssets.icons.cortex192;

  return (
    <Image
      src={iconSrc}
      alt={getAltText()}
      width={iconSizes.width}
      height={iconSizes.height}
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