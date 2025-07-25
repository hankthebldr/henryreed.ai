import React, { useEffect, useRef } from 'react';
import { ToastProps } from '../utils/types';

const typeClasses = {
  success: {
    background: 'bg-success-subtle border-success-emphasis',
    icon: 'text-success-fg',
    text: 'text-success-emphasis',
  },
  error: {
    background: 'bg-danger-subtle border-danger-emphasis',
    icon: 'text-danger-fg',
    text: 'text-danger-emphasis',
  },
  warning: {
    background: 'bg-attention-subtle border-attention-emphasis',
    icon: 'text-attention-fg',
    text: 'text-attention-emphasis',
  },
  info: {
    background: 'bg-accent-subtle border-accent-emphasis',
    icon: 'text-accent-fg',
    text: 'text-accent-emphasis',
  },
};

const icons = {
  success: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  isClosable = true,
  onClose,
  action,
  respectMotionPreference = true,
  className = '',
  'data-testid': testId,
}) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  
  const typeStyle = typeClasses[type];
  
  useEffect(() => {
    // Auto dismiss toast after duration
    if (duration !== null && onClose) {
      timerRef.current = setTimeout(() => {
        onClose(id);
      }, duration);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [id, duration, onClose]);
  
  const handleClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    onClose?.(id);
  };
  
  const handleMouseEnter = () => {
    // Pause auto-dismiss on hover
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };
  
  const handleMouseLeave = () => {
    // Resume auto-dismiss on mouse leave
    if (duration !== null && onClose) {
      timerRef.current = setTimeout(() => {
        onClose(id);
      }, duration);
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && isClosable) {
      handleClose();
    }
  };
  
  const baseClasses = [
    'relative',
    'flex',
    'p-4',
    'border',
    'rounded-lg',
    'shadow-lg',
    'max-w-md',
    'w-full',
    typeStyle.background,
  ];
  
  if (respectMotionPreference) {
    baseClasses.push(
      'motion-safe:animate-in',
      'motion-safe:slide-in-from-right-full',
      'motion-safe:duration-300'
    );
  }
  
  const toastClasses = [...baseClasses, className].filter(Boolean).join(' ');
  
  return (
    <div
      ref={toastRef}
      className={toastClasses}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      data-testid={testId}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={isClosable ? 0 : -1}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${typeStyle.icon}`} aria-hidden="true">
        {icons[type]}
      </div>
      
      {/* Content */}
      <div className="ml-3 flex-1">
        {title && (
          <h4 className={`text-sm font-medium ${typeStyle.text}`}>
            {title}
          </h4>
        )}
        <div className={`text-sm ${title ? 'mt-1' : ''} ${typeStyle.text}`}>
          {message}
        </div>
        
        {action && (
          <div className="mt-3">
            <button
              type="button"
              className={`text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded-sm ${typeStyle.text}`}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          </div>
        )}
      </div>
      
      {/* Close button */}
      {isClosable && (
        <div className="ml-4 flex-shrink-0">
          <button
            type="button"
            className={`inline-flex rounded-md p-1.5 hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current ${typeStyle.icon}`}
            onClick={handleClose}
            aria-label="Close notification"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Progress bar for auto-dismiss */}
      {duration !== null && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-20 rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-current opacity-50"
            style={{
              animation: respectMotionPreference 
                ? `shrink ${duration}ms linear forwards`
                : undefined,
            }}
          />
        </div>
      )}
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Toast;
