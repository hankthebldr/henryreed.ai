'use client';

import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'terminal';
}

export function Input({ 
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  variant = 'default',
  className,
  id,
  ...props 
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const variants = {
    default: cn(
      'w-full bg-cortex-bg-primary/50 border border-cortex-border-muted rounded-xl',
      'text-cortex-text-primary placeholder-cortex-text-disabled',
      'focus:outline-none focus:ring-2 focus:ring-cortex-orange focus:border-transparent',
      'transition-all duration-200'
    ),
    terminal: cn(
      'w-full bg-black/80 border border-cortex-green/30 rounded-lg',
      'text-cortex-green placeholder-cortex-green/50 font-mono',
      'focus:outline-none focus:ring-2 focus:ring-cortex-green focus:border-cortex-green',
      'transition-all duration-200'
    )
  };

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-cortex-text-secondary">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <input
          id={inputId}
          className={cn(
            variants[variant],
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-cortex-error focus:ring-cortex-error',
            'py-3 px-4',
            className
          )}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <div className="flex items-center space-x-2 text-cortex-error text-sm">
          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      {hint && !error && (
        <div className="text-cortex-text-muted text-sm">
          {hint}
        </div>
      )}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  variant?: 'default' | 'terminal';
}

export function TextArea({ 
  label,
  error,
  hint,
  variant = 'default',
  className,
  id,
  ...props 
}: TextAreaProps) {
  const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  const variants = {
    default: cn(
      'w-full bg-cortex-bg-primary/50 border border-cortex-border-muted rounded-xl',
      'text-cortex-text-primary placeholder-cortex-text-disabled',
      'focus:outline-none focus:ring-2 focus:ring-cortex-orange focus:border-transparent',
      'transition-all duration-200 resize-none'
    ),
    terminal: cn(
      'w-full bg-black/80 border border-cortex-green/30 rounded-lg',
      'text-cortex-green placeholder-cortex-green/50 font-mono',
      'focus:outline-none focus:ring-2 focus:ring-cortex-green focus:border-cortex-green',
      'transition-all duration-200 resize-none'
    )
  };

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-cortex-text-secondary">
          {label}
        </label>
      )}
      
      <textarea
        id={inputId}
        className={cn(
          variants[variant],
          error && 'border-cortex-error focus:ring-cortex-error',
          'py-3 px-4 min-h-[120px]',
          className
        )}
        {...props}
      />
      
      {error && (
        <div className="flex items-center space-x-2 text-cortex-error text-sm">
          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      {hint && !error && (
        <div className="text-cortex-text-muted text-sm">
          {hint}
        </div>
      )}
    </div>
  );
}