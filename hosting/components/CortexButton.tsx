'use client';

import React from 'react';

interface CortexButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'info' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
  tooltip?: string;
  className?: string;
  children: React.ReactNode;
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
  children
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cortex-bg-primary disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-cortex-green hover:bg-cortex-green-dark text-white focus:ring-cortex-green border border-cortex-green',
    secondary: 'bg-cortex-bg-tertiary hover:bg-cortex-bg-hover text-cortex-text-primary focus:ring-cortex-text-accent border border-cortex-border-secondary',
    outline: 'border border-cortex-green text-cortex-green hover:bg-cortex-green hover:text-white focus:ring-cortex-green',
    danger: 'bg-cortex-error hover:bg-cortex-error-dark text-white focus:ring-cortex-error border border-cortex-error',
    success: 'bg-cortex-success hover:bg-cortex-success-dark text-white focus:ring-cortex-success border border-cortex-success',
    info: 'bg-cortex-info hover:bg-cortex-info-dark text-white focus:ring-cortex-info border border-cortex-info',
    warning: 'bg-cortex-warning hover:bg-cortex-warning-dark text-white focus:ring-cortex-warning border border-cortex-warning'
  };
  
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs rounded',
    sm: 'px-3 py-1.5 text-sm rounded',
    md: 'px-4 py-2 text-sm rounded-md',
    lg: 'px-6 py-3 text-base rounded-lg'
  };
  
  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };
  
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      title={tooltip}
      className={buttonClasses}
      role="button"
      tabIndex={disabled ? -1 : 0}
    >
      {loading && (
        <div className="cortex-spinner mr-2" aria-hidden="true"></div>
      )}
      {icon && iconPosition === 'left' && !loading && (
        <span className="mr-2" aria-hidden="true">{icon}</span>
      )}
      <span>{children}</span>
      {icon && iconPosition === 'right' && !loading && (
        <span className="ml-2" aria-hidden="true">{icon}</span>
      )}
    </button>
  );
};

export default CortexButton;