import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ModalProps } from '../utils/types';

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full h-full',
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  initialFocus,
  respectMotionPreference = true,
  children,
  className = '',
  'data-testid': testId,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  // Store the previously focused element
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);
  
  // Handle focus management
  useEffect(() => {
    if (!isOpen) return;
    
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements && focusableElements.length > 0) {
      // Focus the initial focus element or the first focusable element
      const elementToFocus = initialFocus?.current || focusableElements[0] as HTMLElement;
      elementToFocus.focus();
    }
    
    // Return focus when modal closes
    return () => {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, initialFocus]);
  
  // Handle escape key
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;
    
    if (event.key === 'Escape' && closeOnEscape) {
      onClose();
      return;
    }
    
    // Trap focus within modal
    if (event.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements || focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [isOpen, closeOnEscape, onClose]);
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };
  
  const sizeClass = sizeClasses[size];
  
  const overlayClasses = [
    'fixed',
    'inset-0',
    'z-50',
    'flex',
    'items-center',
    'justify-center',
    'p-4',
    'bg-black',
    'bg-opacity-50',
    'backdrop-blur-sm',
  ];
  
  if (respectMotionPreference) {
    overlayClasses.push('motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200');
  }
  
  const modalClasses = [
    'relative',
    'w-full',
    sizeClass,
    'bg-canvas-default',
    'border',
    'border-border-default',
    'rounded-lg',
    'shadow-2xl',
    'max-h-[90vh]',
    'overflow-hidden',
    'flex',
    'flex-col',
  ];
  
  if (respectMotionPreference) {
    modalClasses.push('motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-200');
  }
  
  const modalClassNames = [...modalClasses, className].filter(Boolean).join(' ');
  
  if (!isOpen) return null;
  
  const modalContent = (
    <div
      className={overlayClasses.join(' ')}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      data-testid={testId}
    >
      <div
        ref={modalRef}
        className={modalClassNames}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-border-default">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-fg-default"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                className="p-1 text-fg-muted hover:text-fg-default focus:outline-none focus:ring-2 focus:ring-accent-subtle rounded-md"
                onClick={onClose}
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
        
        <div className="flex-1 p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
  
  // Render modal in portal
  return createPortal(modalContent, document.body);
};

export default Modal;
