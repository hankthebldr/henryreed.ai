'use client';

import React, { useState, useRef, useEffect } from 'react';
import userActivityService from '../lib/user-activity-service';

interface CortexButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'info' | 'warning' | 'ghost' | 'elevated';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  onClick?: () => void | Promise<void>;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
  tooltip?: string;
  className?: string;
  children: React.ReactNode;
  // Enhanced features
  ripple?: boolean;
  haptic?: boolean;
  trackActivity?: boolean;
  activityContext?: string;
  shortcut?: string;
  badge?: string | number;
  fullWidth?: boolean;
  pulse?: boolean;
  glow?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  gradient?: boolean;
  onSuccess?: (result?: any) => void;
  onError?: (error: any) => void;
  successMessage?: string;
  errorMessage?: string;
  confirmAction?: boolean;
  confirmMessage?: string;
  autoFocus?: boolean;
}

const CortexButton: React.FC<CortexButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  ariaLabel,
  tooltip,
  className = '',
  children,
  // Enhanced features
  ripple = true,
  haptic = true,
  trackActivity = true,
  activityContext = 'button',
  shortcut,
  badge,
  fullWidth = false,
  pulse = false,
  glow = false,
  shadow = 'sm',
  rounded = 'md',
  gradient = false,
  onSuccess,
  onError,
  successMessage,
  errorMessage,
  confirmAction = false,
  confirmMessage = 'Are you sure?',
  autoFocus = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);

  // Auto focus on mount if specified
  useEffect(() => {
    if (autoFocus && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [autoFocus]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (shortcut) {
      const handleKeyDown = (event: KeyboardEvent) => {
        const keys = shortcut.split('+').map(k => k.toLowerCase());
        const isMatch = keys.every(key => {
          switch (key) {
            case 'ctrl': return event.ctrlKey || event.metaKey;
            case 'alt': return event.altKey;
            case 'shift': return event.shiftKey;
            default: return event.key.toLowerCase() === key;
          }
        });
        
        if (isMatch && !disabled && !loading) {
          event.preventDefault();
          handleClick();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [shortcut, disabled, loading]);

  const baseClasses = [
    'relative inline-flex items-center justify-center font-medium',
    'transition-all duration-200 ease-in-out transform',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    'active:scale-95 hover:scale-105',
    'select-none',
    fullWidth ? 'w-full' : '',
    pulse ? 'animate-pulse' : '',
    glow ? 'filter drop-shadow-lg' : ''
  ].filter(Boolean).join(' ');
  
  const variantClasses = {
    primary: gradient 
      ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white border border-blue-600 focus:ring-blue-500'
      : 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 focus:ring-blue-500',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600 focus:ring-gray-500',
    outline: 'border-2 border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white focus:ring-blue-500 bg-transparent',
    danger: gradient
      ? 'bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 text-white border border-red-600 focus:ring-red-500'
      : 'bg-red-600 hover:bg-red-700 text-white border border-red-600 focus:ring-red-500',
    success: gradient
      ? 'bg-gradient-to-r from-green-600 via-green-700 to-green-800 hover:from-green-700 hover:via-green-800 hover:to-green-900 text-white border border-green-600 focus:ring-green-500'
      : 'bg-green-600 hover:bg-green-700 text-white border border-green-600 focus:ring-green-500',
    info: gradient
      ? 'bg-gradient-to-r from-cyan-600 via-cyan-700 to-cyan-800 hover:from-cyan-700 hover:via-cyan-800 hover:to-cyan-900 text-white border border-cyan-600 focus:ring-cyan-500'
      : 'bg-cyan-600 hover:bg-cyan-700 text-white border border-cyan-600 focus:ring-cyan-500',
    warning: gradient
      ? 'bg-gradient-to-r from-yellow-600 via-yellow-700 to-yellow-800 hover:from-yellow-700 hover:via-yellow-800 hover:to-yellow-900 text-white border border-yellow-600 focus:ring-yellow-500'
      : 'bg-yellow-600 hover:bg-yellow-700 text-white border border-yellow-600 focus:ring-yellow-500',
    ghost: 'bg-transparent hover:bg-gray-800/50 text-gray-300 border border-transparent focus:ring-gray-500',
    elevated: 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 focus:ring-gray-500 shadow-lg hover:shadow-xl'
  };
  
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs gap-1',
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
    xl: 'px-8 py-4 text-lg gap-3'
  };

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const createRipple = (event: React.MouseEvent) => {
    if (!ripple || !rippleRef.current) return;

    const button = event.currentTarget as HTMLButtonElement;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const rippleElement = document.createElement('span');
    rippleElement.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    `;

    rippleRef.current.appendChild(rippleElement);
    setTimeout(() => rippleElement.remove(), 600);
  };

  const triggerHaptic = () => {
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleClick = async (event: React.MouseEvent) => {
    if (disabled || loading || isProcessing) return;

    // Track activity
    if (trackActivity) {
      userActivityService.trackActivity('button-click', activityContext, {
        variant,
        size,
        text: typeof children === 'string' ? children : 'button',
        icon,
        timestamp: new Date().toISOString()
      });
    }

    // Create ripple effect
    createRipple(event);

    // Trigger haptic feedback
    triggerHaptic();

    // Handle confirmation
    if (confirmAction) {
      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) return;
    }

    if (!onClick) return;

    try {
      setIsProcessing(true);
      setShowError(false);
      setShowSuccess(false);

      const result = await onClick();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      if (successMessage) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error: any) {
      console.error('Button action failed:', error);
      
      if (onError) {
        onError(error);
      }
      
      const message = errorMessage || error.message || 'Action failed';
      setErrorText(message);
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const isLoading = loading || isProcessing;
  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    roundedClasses[rounded],
    shadowClasses[shadow],
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type={type}
        onClick={handleClick}
        disabled={disabled || isLoading}
        aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
        title={tooltip || (shortcut ? `Shortcut: ${shortcut}` : undefined)}
        className={buttonClasses}
        role="button"
        tabIndex={disabled ? -1 : 0}
      >
        {/* Ripple container */}
        {ripple && (
          <div 
            ref={rippleRef}
            className="absolute inset-0 overflow-hidden rounded-inherit pointer-events-none"
            aria-hidden="true"
          />
        )}

        {/* Loading spinner */}
        {isLoading && (
          <div className="flex items-center justify-center" aria-hidden="true">
            <svg 
              className="animate-spin h-4 w-4 mr-2" 
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
          </div>
        )}

        {/* Left icon */}
        {icon && iconPosition === 'left' && !isLoading && (
          <span className="flex-shrink-0" aria-hidden="true">{icon}</span>
        )}

        {/* Button content */}
        <span className={`${isLoading ? 'opacity-50' : ''} flex items-center justify-center`}>
          {children}
        </span>

        {/* Right icon */}
        {icon && iconPosition === 'right' && !isLoading && (
          <span className="flex-shrink-0" aria-hidden="true">{icon}</span>
        )}

        {/* Badge */}
        {badge && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {badge}
          </span>
        )}
      </button>

      {/* Success message */}
      {showSuccess && successMessage && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-green-600 text-white text-xs px-3 py-1 rounded-md whitespace-nowrap z-50">
          ✓ {successMessage}
        </div>
      )}

      {/* Error message */}
      {showError && errorText && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-red-600 text-white text-xs px-3 py-1 rounded-md whitespace-nowrap z-50 max-w-xs">
          ⚠ {errorText}
        </div>
      )}

      {/* Keyboard shortcut hint */}
      {shortcut && !disabled && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {shortcut}
        </div>
      )}
    </div>
  );
};

export default CortexButton;