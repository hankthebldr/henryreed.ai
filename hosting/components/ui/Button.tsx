'use client';
// legacy-orange: replaced by green per Cortex rebrand (2025-10-08)


import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'terminal';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export function Button({ 
  children, 
  className, 
  variant = 'default',
  size = 'md',
  loading = false,
  disabled,
  icon,
  iconPosition = 'left',
  ...props 
}: ButtonProps) {
  const variants = {
    default: 'bg-cortex-bg-quaternary text-cortex-text-primary hover:bg-cortex-bg-hover border border-cortex-border-secondary',
    primary: 'bg-gradient-to-r from-cortex-accent to-cortex-green text-white hover:from-cortex-accent-3 hover:to-cortex-green-light shadow-lg shadow-cortex-accent/25',
    secondary: 'bg-cortex-accent text-white hover:bg-cortex-accent-3 shadow-md shadow-cortex-accent/20',
    outline: 'border-2 border-cortex-accent text-cortex-accent hover:bg-cortex-accent/10 hover:border-cortex-accent-3',
    ghost: 'text-cortex-text-primary hover:bg-cortex-bg-hover hover:text-cortex-text-primary',
    destructive: 'bg-cortex-error text-white hover:bg-cortex-error-light shadow-md shadow-cortex-error/20',
    terminal: 'bg-black/80 border border-cortex-green text-cortex-green hover:bg-cortex-green/10 hover:border-cortex-green-light font-mono'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
    xl: 'px-8 py-4 text-lg rounded-2xl',
    icon: 'p-2 rounded-lg'
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cortex-accent focus:ring-offset-2 focus:ring-offset-cortex-bg-primary disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        loading && 'cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="mr-2">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="ml-2">{icon}</span>
          )}
        </>
      )}
    </button>
  );
}