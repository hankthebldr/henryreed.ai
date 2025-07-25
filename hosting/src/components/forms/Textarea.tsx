import React, { forwardRef, useId } from 'react';
import { TextareaProps } from '../utils/types';

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

const resizeClasses = {
  none: 'resize-none',
  vertical: 'resize-y',
  horizontal: 'resize-x',
  both: 'resize',
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  size = 'md',
  state = 'default',
  label,
  helperText,
  errorMessage,
  isRequired = false,
  resize = 'vertical',
  disabled,
  className = '',
  'data-testid': testId,
  id: providedId,
  rows = 4,
  ...rest
}, ref) => {
  const generatedId = useId();
  const textareaId = providedId || generatedId;
  const helperTextId = `${textareaId}-helper`;
  const errorId = `${textareaId}-error`;
  
  const sizeClass = sizeClasses[size];
  const stateClass = stateClasses[disabled ? 'disabled' : state];
  const resizeClass = resizeClasses[resize];
  
  const baseTextareaClasses = [
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
    resizeClass,
  ];
  
  const textareaClasses = [...baseTextareaClasses, className].filter(Boolean).join(' ');
  
  const showError = state === 'error' && errorMessage;
  const showHelper = helperText && !showError;
  
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
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
      
      <textarea
        ref={ref}
        id={textareaId}
        disabled={disabled}
        required={isRequired}
        rows={rows}
        className={textareaClasses}
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

Textarea.displayName = 'Textarea';

export default Textarea;
