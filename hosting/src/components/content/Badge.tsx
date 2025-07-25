import React from 'react';
import { BadgeProps } from '../utils/types';

const sizeClasses = {
  xs: {
    normal: 'px-2 py-0.5 text-xs',
    dot: 'w-2 h-2',
  },
  sm: {
    normal: 'px-2.5 py-0.5 text-xs',
    dot: 'w-2.5 h-2.5',
  },
  md: {
    normal: 'px-3 py-1 text-sm',
    dot: 'w-3 h-3',
  },
  lg: {
    normal: 'px-3 py-1.5 text-sm',
    dot: 'w-3.5 h-3.5',
  },
  xl: {
    normal: 'px-4 py-2 text-base',
    dot: 'w-4 h-4',
  },
};

const variantClasses = {
  default: 'bg-canvas-subtle text-fg-default border-border-default',
  accent: 'bg-accent-emphasis text-fg-on-emphasis',
  success: 'bg-success-emphasis text-fg-on-emphasis',
  attention: 'bg-attention-emphasis text-fg-on-emphasis',
  danger: 'bg-danger-emphasis text-fg-on-emphasis',
};

const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  isPill = false,
  isDot = false,
  children,
  className = '',
  'data-testid': testId,
  ...rest
}) => {
  const sizeClass = isDot ? sizeClasses[size].dot : sizeClasses[size].normal;
  const variantClass = variantClasses[variant];
  
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'whitespace-nowrap',
    sizeClass,
    variantClass,
  ];
  
  // Add border for default variant
  if (variant === 'default') {
    baseClasses.push('border');
  }
  
  // Determine border radius
  if (isDot) {
    baseClasses.push('rounded-full');
  } else if (isPill) {
    baseClasses.push('rounded-full');
  } else {
    baseClasses.push('rounded-md');
  }
  
  const badgeClasses = [...baseClasses, className].filter(Boolean).join(' ');
  
  if (isDot) {
    return (
      <span
        className={badgeClasses}
        data-testid={testId}
        aria-label={typeof children === 'string' ? children : 'Badge'}
        {...rest}
      />
    );
  }
  
  return (
    <span
      className={badgeClasses}
      data-testid={testId}
      {...rest}
    >
      {children}
    </span>
  );
};

export default Badge;
