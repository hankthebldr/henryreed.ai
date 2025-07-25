import React, { forwardRef, useId } from 'react';
import { InputProps } from '../utils/types';

const sizeClasses = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-3 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
  xl: 'px-5 py-4 text-xl',
};

const stateClasses = {
  default: 'border-border-default focus:border-accent-fg focus:ring-accent-subtle',
  error: 'border-danger-emphasis focus:border-danger-fg focus:ring-danger-subtle',
  success: 'border-success-emphasis focus:border-success-fg focus:ring-success-subtle',
  disabled: 'border-border-muted bg-canvas-inset cursor-not-allowed',
};

const Input = forwardRef<HTMLInputElement, InputProps>(({
  size = 'md',
  state = 'default',
  label,
  helperText,
  errorMessage,
  leftIcon,
  rightIcon,
  isRequired = false,
  disabled,
  className = '',
  'data-testid': testId,
  id: providedId,
  ...rest
}, ref) => {
  const generatedId = useId();
  const inputId = providedId || generatedId;
  const helperTextId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  
  const sizeClass = sizeClasses[size];
  const stateClass = stateClasses[disabled ? 'disabled' : state];
  
  const baseInputClasses = [
    'block',
    'w-full',
    'border',
    'rounded-md',
    'bg-canvas-default',
    'text-fg-default',
    'placeholder-fg-muted',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'focus:ring-offset-canvas-default',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'transition-colors',
    'duration-200',
    'ease-in-out',
    sizeClass,
    stateClass,
  ];
  
  const inputClasses = [...baseInputClasses, className].filter(Boolean).join(' ');
  
  // Adjust padding if icons are present
  let inputStyle = {};
  if (leftIcon) {
    inputStyle = { ...inputStyle, paddingLeft: '2.5rem' };
  }
  if (rightIcon) {
    inputStyle = { ...inputStyle, paddingRight: '2.5rem' };
  }
  
  const showError = state === 'error' && errorMessage;
  const showHelper = helperText && !showError;
  
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-fg-default mb-1"
        >
          {label}
          {isRequired && (
            <span className="text-danger-fg ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-fg-muted" aria-hidden="true">
              {leftIcon}
            </span>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={isRequired}
          className={inputClasses}
          style={inputStyle}
          data-testid={testId}
          aria-invalid={state === 'error'}
          aria-describedby={
            [
              showHelper ? helperTextId : null,
              showError ? errorId : null,
            ].filter(Boolean).join(' ') || undefined
          }
          {...rest}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-fg-muted" aria-hidden="true">
              {rightIcon}
            </span>
          </div>
        )}
      </div>
      
      {showError && (
        <p
          id={errorId}
          className="mt-1 text-sm text-danger-fg"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
      
      {showHelper && (
        <p
          id={helperTextId}
          className="mt-1 text-sm text-fg-muted"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
