'use client';

import React, { useState } from 'react';

interface ExampleComponentProps {
  title?: string;
  variant?: 'default' | 'accent' | 'success' | 'attention' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Example component demonstrating theme integration with semantic color tokens
 */
export function ExampleComponent({ 
  title = 'Example Component',
  variant = 'default',
  size = 'md'
}: ExampleComponentProps) {
  const [count, setCount] = useState(0);

  const variantClasses = {
    default: 'border-border-default bg-canvas-overlay text-fg-default',
    accent: 'border-accent-emphasis bg-accent-subtle text-accent-fg',
    success: 'border-success-emphasis bg-success-subtle text-success-fg',
    attention: 'border-attention-emphasis bg-attention-subtle text-attention-fg',
    danger: 'border-danger-emphasis bg-danger-subtle text-danger-fg',
  };

  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-6 text-lg',
  };

  const buttonVariantClasses = {
    default: 'bg-accent-emphasis hover:bg-accent-fg text-fg-on-emphasis',
    accent: 'bg-accent-emphasis hover:bg-accent-fg text-fg-on-emphasis',
    success: 'bg-success-emphasis hover:bg-success-fg text-fg-on-emphasis',
    attention: 'bg-attention-emphasis hover:bg-attention-fg text-fg-on-emphasis',
    danger: 'bg-danger-emphasis hover:bg-danger-fg text-fg-on-emphasis',
  };

  return (
    <div className={`
      border rounded-lg transition-colors duration-200
      ${variantClasses[variant]}
      ${sizeClasses[size]}
    `}>
      <header className=\"flex items-center justify-between mb-4\">
        <h2 className=\"font-semibold\">{title}</h2>
        <div className={`
          px-2 py-1 rounded text-xs font-mono
          bg-canvas-inset border border-border-muted text-fg-muted
        `}>
          {variant}
        </div>
      </header>

      <div className=\"space-y-4\">
        <p className=\"text-fg-muted\">
          This component demonstrates how to use semantic color tokens that automatically 
          adapt to the current theme. The colors will change when switching between light 
          and dark modes.
        </p>

        <div className=\"flex items-center space-x-4\">
          <button
            onClick={() => setCount(count - 1)}
            className={`
              px-3 py-1 rounded transition-colors duration-200
              border border-border-default hover:border-border-subtle
              bg-canvas-subtle hover:bg-canvas-overlay
              text-fg-default
            `}
          >
            -
          </button>
          
          <span className=\"font-mono text-lg font-bold min-w-[3rem] text-center\">
            {count}
          </span>
          
          <button
            onClick={() => setCount(count + 1)}
            className={`
              px-3 py-1 rounded transition-colors duration-200
              ${buttonVariantClasses[variant]}
            `}
          >
            +
          </button>
        </div>

        <div className=\"grid grid-cols-2 gap-2 text-sm\">
          <div className=\"bg-canvas-inset p-2 rounded border border-border-muted\">
            <div className=\"text-fg-subtle\">Canvas Inset</div>
            <div className=\"text-fg-muted text-xs\">Recessed backgrounds</div>
          </div>
          
          <div className=\"bg-canvas-default p-2 rounded border border-border-default\">
            <div className=\"text-fg-default\">Canvas Default</div>
            <div className=\"text-fg-muted text-xs\">Main backgrounds</div>
          </div>
        </div>

        {variant !== 'default' && (
          <div className=\"mt-4 p-3 rounded border border-current bg-opacity-10\">
            <div className=\"font-medium\">Variant: {variant}</div>
            <div className=\"text-sm opacity-75\">
              This section shows how the {variant} variant affects the component appearance.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
