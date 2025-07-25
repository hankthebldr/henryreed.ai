import React, { forwardRef } from 'react';
import { ButtonProps } from '../utils/types';

const sizeClasses = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl',
};

const variantClasses = {
  primary: 'bg-accent-emphasis text-fg-on-emphasis border-accent-emphasis hover:bg-accent-fg focus:ring-accent-subtle',
  secondary: 'bg-canvas-subtle text-fg-default border-border-default hover:bg-canvas-overlay focus:ring-accent-subtle',
  outline: 'bg-transparent text-accent-fg border-accent-fg hover:bg-accent-subtle focus:ring-accent-subtle',
  ghost: 'bg-transparent text-fg-default border-transparent hover:bg-canvas-subtle focus:ring-accent-subtle',
  link: 'bg-transparent text-accent-fg border-transparent hover:underline focus:ring-accent-subtle p-0',
};

const getMotionClasses = (respectMotionPreference: boolean = true): string => {
  const baseTransition = 'transition-colors duration-200 ease-in-out';
  const motionTransform = 'transform hover:scale-105 active:scale-95';
  
  if (respectMotionPreference) {
    return `${baseTransition} motion-safe:${motionTransform}`;
  }
  
  return `${baseTransition} ${motionTransform}`;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText = 'Loading...',
  leftIcon,
  rightIcon,
  isFullWidth = false,
  respectMotionPreference = true,
  disabled,
  children,
  className = '',
  'data-testid': testId,
  ...rest
}, ref) => {
  const sizeClass = sizeClasses[size];
  const variantClass = variantClasses[variant];
  const motionClasses = getMotionClasses(respectMotionPreference);
  
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'border',
    'rounded-md',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'focus:ring-offset-canvas-default',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:pointer-events-none',
    motionClasses,
    sizeClass,
    variantClass,
  ];
  
  if (isFullWidth) {
    baseClasses.push('w-full');
  }
  
  if (isLoading) {
    baseClasses.push('cursor-wait');
  }
  
  const buttonClasses = [...baseClasses, className].filter(Boolean).join(' ');
  
  const buttonContent = isLoading ? (
    <>
      <svg
        className="animate-spin -ml-1 mr-2 h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
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
          d="M4 12a8 8 0 0 1 8-8v8H4z"
        />
      </svg>
      {loadingText}
    </>
  ) : (
    <>
      {leftIcon && (
        <span className="mr-2" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      {children}
      {rightIcon && (
        <span className="ml-2" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </>
  );

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || isLoading}
      className={buttonClasses}
      data-testid={testId}
      aria-busy={isLoading}
      {...rest}
    >
      {buttonContent}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
