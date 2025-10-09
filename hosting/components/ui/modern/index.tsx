'use client';

import React, { forwardRef, useState, useEffect } from 'react';
import { cn } from '../../../lib/utils';

// Modern Button Component with variants and states
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const ModernButton = forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  children,
  disabled,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring-brand disabled:pointer-events-none disabled:opacity-50 active:scale-[.98]';
  
  /* LEGACY variants (preserved for backward compatibility)
  const legacyVariants = {
    primary: 'bg-cortex-accent hover:bg-cortex-accent/90 text-white shadow-lg shadow-cortex-accent/25 hover:shadow-xl hover:shadow-cortex-accent/40 hover:scale-105',
    secondary: 'bg-cortex-bg-tertiary hover:bg-cortex-bg-hover text-cortex-text-primary border border-cortex-border-secondary hover:border-cortex-border-primary',
    outline: 'border border-cortex-accent text-cortex-accent hover:bg-cortex-accent hover:text-white',
    ghost: 'hover:bg-cortex-bg-tertiary text-cortex-text-secondary hover:text-cortex-text-primary',
    danger: 'bg-cortex-error hover:bg-cortex-error-dark text-white shadow-lg shadow-cortex-error/25',
    success: 'bg-cortex-success hover:bg-cortex-success-dark text-white shadow-lg shadow-cortex-success/25'
  };
  */
  
  // MODERN: Updated variants with new token system and enhanced states
  const variants = {
    primary: 'bg-cortex-primary hover:bg-cortex-primary/90 text-cortex-dark shadow-cortex-md hover:shadow-cortex-lg hover:brightness-110 motion-safe-scale',
    secondary: 'bg-cortex-elevated hover:bg-cortex-elevated/80 text-cortex-text-primary border border-cortex-border hover:border-cortex-primary/60 motion-safe-hover',
    outline: 'border border-cortex-primary text-cortex-primary hover:bg-cortex-primary hover:text-cortex-dark motion-safe-hover',
    ghost: 'hover:bg-cortex-elevated text-cortex-text-secondary hover:text-cortex-text-primary motion-safe-hover',
    danger: 'bg-status-error hover:bg-status-error/90 text-white shadow-lg hover:brightness-110 motion-safe-scale',
    success: 'bg-status-success hover:bg-status-success/90 text-white shadow-lg hover:brightness-110 motion-safe-scale'
  };
  
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
    xl: 'h-14 px-8 text-lg'
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
      ) : icon && iconPosition === 'left' ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
      {icon && iconPosition === 'right' && !isLoading && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
});

ModernButton.displayName = 'ModernButton';

// Modern Card Component with glassmorphism
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'outline' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
}

export const ModernCard = forwardRef<HTMLDivElement, CardProps>(({
  className,
  variant = 'glass',
  padding = 'md',
  hover = false,
  children,
  ...props
}, ref) => {
  const baseStyles = 'rounded-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-cortex-canvas';
  
  /* LEGACY variants (preserved for backward compatibility)
  const legacyVariants = {
    glass: 'bg-cortex-bg-tertiary/60 backdrop-blur-xl border border-cortex-border-secondary/50 shadow-xl',
    solid: 'bg-cortex-bg-tertiary border border-cortex-border-secondary',
    outline: 'border border-cortex-border-secondary bg-transparent',
    elevated: 'bg-cortex-bg-tertiary border border-cortex-border-secondary shadow-2xl shadow-black/20'
  };
  */
  
  // MODERN: Updated variants with new token system
  const variants = {
    glass: 'ui-glass-panel bg-gradient-to-br from-cortex-primary/5 to-cortex-blue/5 shadow-glass-md',
    solid: 'bg-cortex-surface border border-cortex-border shadow-cortex-sm',
    outline: 'border border-cortex-border bg-transparent hover:bg-cortex-surface/50',
    elevated: 'ui-glass-elevated shadow-glass-lg hover:shadow-glass-lg'
  };
  
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-6', 
    lg: 'p-8',
    xl: 'p-12'
  };
  
  // MODERN: Enhanced hover effects with motion-safe
  const hoverStyles = hover ? 'motion-safe-scale cursor-pointer hover:border-cortex-primary/30' : '';

  return (
    <div
      className={cn(
        baseStyles,
        variants[variant],
        paddingStyles[padding],
        hoverStyles,
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});

ModernCard.displayName = 'ModernCard';

// Modern Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const ModernInput = forwardRef<HTMLInputElement, InputProps>(({
  className,
  label,
  error,
  icon,
  iconPosition = 'left',
  id,
  ...props
}, ref) => {
  const inputId = id || Math.random().toString(36).substr(2, 9);

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-cortex-text-secondary"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cortex-text-muted">
            {icon}
          </div>
        )}
        <input
          className={cn(
            /* LEGACY styles (preserved): 'w-full px-4 py-3 bg-cortex-bg-primary/50 border border-cortex-border-muted rounded-xl text-cortex-text-primary placeholder-cortex-text-disabled focus:outline-none focus:ring-2 focus:ring-cortex-accent focus:border-transparent' */
            // MODERN: Updated with new tokens and focus system
            'w-full px-4 py-3 bg-cortex-elevated border border-cortex-border rounded-xl',
            'text-cortex-text-primary placeholder-cortex-text-muted',
            'focus-ring transition-all duration-200',
            'hover:border-cortex-primary/50',
            icon && iconPosition === 'left' ? 'pl-10' : '',
            icon && iconPosition === 'right' ? 'pr-10' : '',
            error ? 'border-status-error focus-visible:ring-status-error' : '',
            className
          )}
          id={inputId}
          ref={ref}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-cortex-text-muted">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-cortex-error">{error}</p>
      )}
    </div>
  );
});

ModernInput.displayName = 'ModernInput';

// Modern Loading Spinner
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'accent' | 'success' | 'warning' | 'error';
}

export const ModernLoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'accent'
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };
  
  const colors = {
    accent: 'border-cortex-accent',
    success: 'border-cortex-success',
    warning: 'border-cortex-warning',
    error: 'border-cortex-error'
  };

  return (
    <div className={cn(
      'animate-spin rounded-full border-2 border-t-transparent',
      sizes[size],
      colors[color]
    )} />
  );
};

// Modern Badge Component
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

export const ModernBadge = forwardRef<HTMLSpanElement, BadgeProps>(({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full transition-colors';
  
  /* LEGACY variants (preserved for backward compatibility)
  const legacyVariants = {
    default: 'bg-cortex-bg-quaternary text-cortex-text-secondary border border-cortex-border-muted',
    success: 'bg-cortex-success-bg text-cortex-success border border-cortex-success-border',
    warning: 'bg-cortex-warning-bg text-cortex-warning border border-cortex-warning-border',
    error: 'bg-cortex-error-bg text-cortex-error border border-cortex-error-border',
    info: 'bg-cortex-info-bg text-cortex-info border border-cortex-info-border'
  };
  */
  
  // MODERN: Status-based variants with subtle backgrounds and proper contrast
  const variants = {
    default: 'bg-cortex-elevated text-cortex-text-secondary border border-cortex-border',
    success: 'bg-status-success/10 text-status-success border border-status-success/30',
    warning: 'bg-status-warning/10 text-status-warning border border-status-warning/30',
    error: 'bg-status-error/10 text-status-error border border-status-error/30',
    info: 'bg-cortex-blue/10 text-cortex-blue border border-cortex-blue/30'
  };
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </span>
  );
});

ModernBadge.displayName = 'ModernBadge';

// Modern Progress Bar
interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'accent' | 'success' | 'warning' | 'error';
  showValue?: boolean;
}

export const ModernProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  color = 'accent',
  showValue = false
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };
  
  const colors = {
    accent: 'bg-cortex-accent',
    success: 'bg-cortex-success',
    warning: 'bg-cortex-warning',
    error: 'bg-cortex-error'
  };

  return (
    <div className="space-y-2">
      <div className={cn(
        'w-full bg-cortex-bg-quaternary rounded-full overflow-hidden',
        sizes[size]
      )}>
        <div 
          className={cn(
            'h-full transition-all duration-500 ease-out rounded-full',
            colors[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && (
        <div className="flex justify-between text-sm text-cortex-text-muted">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};

// Modern Toast/Notification
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export const ModernToast: React.FC<ToastProps> = ({
  type,
  title,
  message,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const icons = {
    success: '✅',
    error: '❌', 
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  const colors = {
    success: 'border-cortex-success bg-cortex-success-bg text-cortex-success',
    error: 'border-cortex-error bg-cortex-error-bg text-cortex-error',
    warning: 'border-cortex-warning bg-cortex-warning-bg text-cortex-warning',
    info: 'border-cortex-info bg-cortex-info-bg text-cortex-info'
  };

  return (
    <div className={cn(
      'fixed top-4 right-4 max-w-md p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 z-50',
      colors[type],
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    )}>
      <div className="flex items-start space-x-3">
        <span className="text-lg flex-shrink-0">{icons[type]}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold">{title}</h4>
          {message && <p className="text-sm opacity-90 mt-1">{message}</p>}
        </div>
        {onClose && (
          <button 
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose(), 300);
            }}
            className="text-lg hover:opacity-70 transition-opacity flex-shrink-0"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};