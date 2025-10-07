/**
 * BrandedButton Component
 * 
 * Consistently styled button component using official Palo Alto Networks
 * brand colors with support for variants, sizes, loading states, and accessibility.
 * 
 * Usage:
 * <BrandedButton variant="primary" size="md">Get Started</BrandedButton>
 * <BrandedButton variant="outline" size="lg" loading>Processing...</BrandedButton>
 */

import React from 'react';
import { brandSizes, type ButtonSize } from '../../config/brand';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'cortex' | 'ghost';

export interface BrandedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button visual variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Whether the button is in a loading state */
  loading?: boolean;
  /** Loading text to display when loading */
  loadingText?: string;
  /** Icon to display before text */
  leftIcon?: React.ReactNode;
  /** Icon to display after text */
  rightIcon?: React.ReactNode;
  /** Whether button should take full width */
  fullWidth?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Children content */
  children: React.ReactNode;
}

/**
 * LoadingSpinner component for button loading states
 */
const LoadingSpinner: React.FC<{ size: ButtonSize }> = ({ size }) => {
  const spinnerSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <svg
      className={`animate-spin ${spinnerSizes[size]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

/**
 * BrandedButton component with official Palo Alto Networks styling
 */
export const BrandedButton: React.FC<BrandedButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  children,
  ...props
}) => {
  const buttonSizes = brandSizes.button[size];
  
  // Base button classes
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  // Size-specific classes
  const sizeClasses = `
    ${buttonSizes.fontSize === '0.875rem' ? 'text-sm' : ''}
    ${buttonSizes.fontSize === '1rem' ? 'text-base' : ''}
    ${buttonSizes.fontSize === '1.125rem' ? 'text-lg' : ''}
    ${buttonSizes.padding}
  `;

  // Variant-specific classes
  const variantClasses = {
    primary: `
      bg-pan-orange text-white
      hover:bg-pan-orange-dark
      focus:ring-pan-orange/20
      disabled:hover:bg-pan-orange
    `,
    secondary: `
      bg-cortex-teal text-cortex-dark
      hover:bg-cortex-teal/80
      focus:ring-cortex-teal/20
      disabled:hover:bg-cortex-teal
    `,
    outline: `
      border-2 border-pan-orange text-pan-orange bg-transparent
      hover:bg-pan-orange hover:text-white
      focus:ring-pan-orange/20
      disabled:hover:bg-transparent disabled:hover:text-pan-orange
    `,
    cortex: `
      bg-cortex-primary text-white
      hover:bg-cortex-primary/90
      focus:ring-cortex-primary/20
      disabled:hover:bg-cortex-primary
    `,
    ghost: `
      text-pan-orange bg-transparent
      hover:bg-pan-orange/10
      focus:ring-pan-orange/20
      disabled:hover:bg-transparent
    `,
  };

  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';

  // Combine all classes
  const combinedClasses = [
    baseClasses,
    sizeClasses,
    variantClasses[variant],
    widthClasses,
    className,
  ].join(' ').replace(/\s+/g, ' ').trim();

  // Determine if button should be disabled
  const isDisabled = disabled || loading;

  return (
    <button
      className={combinedClasses}
      disabled={isDisabled}
      {...props}
    >
      {/* Loading state */}
      {loading && (
        <LoadingSpinner size={size} />
      )}
      
      {/* Left icon */}
      {leftIcon && !loading && (
        <span className="mr-2">
          {leftIcon}
        </span>
      )}
      
      {/* Button content */}
      <span className={loading && !loadingText ? 'sr-only' : ''}>
        {loading && loadingText ? loadingText : children}
      </span>
      
      {/* Right icon */}
      {rightIcon && !loading && (
        <span className="ml-2">
          {rightIcon}
        </span>
      )}
    </button>
  );
};

/**
 * ButtonGroup component for grouping related buttons
 */
export interface ButtonGroupProps {
  /** Children buttons */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Orientation of the button group */
  orientation?: 'horizontal' | 'vertical';
  /** Size for all buttons in group */
  size?: ButtonSize;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className = '',
  orientation = 'horizontal',
  size = 'md',
}) => {
  const orientationClasses = {
    horizontal: 'flex flex-row',
    vertical: 'flex flex-col',
  };

  const spacingClasses = {
    horizontal: 'space-x-2',
    vertical: 'space-y-2',
  };

  const combinedClasses = [
    orientationClasses[orientation],
    spacingClasses[orientation],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={combinedClasses} role="group">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === BrandedButton) {
          return React.cloneElement(child, { 
            size: child.props.size || size,
          } as any);
        }
        return child;
      })}
    </div>
  );
};

export default BrandedButton;