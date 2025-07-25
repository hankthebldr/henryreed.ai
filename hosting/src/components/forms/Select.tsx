import React, { forwardRef, useId } from 'react';
import { SelectProps } from '../utils/types';

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

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  size = 'md',
  state = 'default',
  label,
  helperText,
  errorMessage,
  isRequired = false,
  placeholder,
  options,
  disabled,
  className = '',
  'data-testid': testId,
  id: providedId,
  ...rest
}, ref) => {
  const generatedId = useId();
  const selectId = providedId || generatedId;
  const helperTextId = `${selectId}-helper`;
  const errorId = `${selectId}-error`;
  
  const sizeClass = sizeClasses[size];
  const stateClass = stateClasses[disabled ? 'disabled' : state];
  
  const baseSelectClasses = [
    'block',
    'w-full',
    'border',
    'rounded-md',
    'bg-canvas-default',
    'text-fg-default',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'focus:ring-offset-canvas-default',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'transition-colors',
    'duration-200',
    'ease-in-out',
    'appearance-none',
    'pr-10', // Space for dropdown icon
    sizeClass,
    stateClass,
  ];
  
  const selectClasses = [...baseSelectClasses, className].filter(Boolean).join(' ');
  
  const showError = state === 'error' && errorMessage;
  const showHelper = helperText && !showError;
  
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
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
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={isRequired}
          className={selectClasses}
          data-testid={testId}
          aria-invalid={state === 'error'}
          aria-describedby={
            [
              showHelper ? helperTextId : null,
              showError ? errorId : null,
            ].filter(Boolean).join(' ') || undefined
          }
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Dropdown arrow icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className="w-5 h-5 text-fg-muted"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
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

Select.displayName = 'Select';

export default Select;
