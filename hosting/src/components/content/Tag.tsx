import React from 'react';
import { TagProps } from '../utils/types';

const sizeClasses = {
  xs: 'px-2 py-0.5 text-xs',
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-3 py-1.5 text-sm',
  xl: 'px-4 py-2 text-base',
};

const variantClasses = {
  default: 'bg-canvas-subtle text-fg-default border-border-default',
  accent: 'bg-accent-subtle text-accent-emphasis border-accent-muted',
  success: 'bg-success-subtle text-success-emphasis border-success-muted',
  attention: 'bg-attention-subtle text-attention-emphasis border-attention-muted',
  danger: 'bg-danger-subtle text-danger-emphasis border-danger-muted',
};

const Tag: React.FC<TagProps> = ({
  variant = 'default',
  size = 'md',
  isClosable = false,
  onClose,
  leftIcon,
  rightIcon,
  children,
  className = '',
  'data-testid': testId,
  ...rest
}) => {
  const sizeClass = sizeClasses[size];
  const variantClass = variantClasses[variant];
  
  const baseClasses = [
    'inline-flex',
    'items-center',
    'border',
    'rounded-full',
    'font-medium',
    'whitespace-nowrap',
    sizeClass,
    variantClass,
  ];
  
  const tagClasses = [...baseClasses, className].filter(Boolean).join(' ');
  
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Backspace' && isClosable && onClose) {
      onClose();
    }
  };
  
  return (
    <span
      className={tagClasses}
      data-testid={testId}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {leftIcon && (
        <span className="mr-1 flex-shrink-0" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      
      <span className="truncate">{children}</span>
      
      {rightIcon && !isClosable && (
        <span className="ml-1 flex-shrink-0" aria-hidden="true">
          {rightIcon}
        </span>
      )}
      
      {isClosable && (
        <button
          type="button"
          className="ml-1 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-black hover:bg-opacity-10 focus:outline-none focus:bg-black focus:bg-opacity-10"
          onClick={onClose}
          aria-label="Remove tag"
        >
          <svg
            className="h-3 w-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

export default Tag;
