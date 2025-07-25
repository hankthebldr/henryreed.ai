import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MobileDrawerProps } from '../utils/types';

const sizeClasses = {
  sm: 'max-w-xs',
  md: 'max-w-sm',
  lg: 'max-w-md',
};

const sideClasses = {
  left: {
    drawer: 'left-0',
    slideIn: 'motion-safe:slide-in-from-left',
    slideOut: 'motion-safe:slide-out-to-left',
  },
  right: {
    drawer: 'right-0',
    slideIn: 'motion-safe:slide-in-from-right',
    slideOut: 'motion-safe:slide-out-to-right',
  },
};

const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  side = 'left',
  size = 'md',
  overlay = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  respectMotionPreference = true,
  children,
  className = '',
  'data-testid': testId,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
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
    
    const focusableElements = drawerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements && focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
    
    // Return focus when drawer closes
    return () => {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);
  
  // Handle escape key and focus trap
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;
    
    if (event.key === 'Escape' && closeOnEscape) {
      onClose();
      return;
    }
    
    // Trap focus within drawer
    if (event.key === 'Tab') {
      const focusableElements = drawerRef.current?.querySelectorAll(
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
  
  // Prevent body scroll when drawer is open
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
  const sideClass = sideClasses[side];
  
  const overlayClasses = [
    'fixed',
    'inset-0',
    'z-50',
    'flex',
  ];
  
  if (overlay) {
    overlayClasses.push('bg-black', 'bg-opacity-50', 'backdrop-blur-sm');
  }
  
  if (respectMotionPreference) {
    overlayClasses.push('motion-safe:animate-in', 'motion-safe:fade-in', 'motion-safe:duration-200');
  }
  
  const drawerClasses = [
    'fixed',
    'top-0',
    'bottom-0',
    'w-full',
    sizeClass,
    'bg-canvas-default',
    'border-border-default',
    'shadow-2xl',
    'overflow-y-auto',
    'z-50',
    sideClass.drawer,
  ];
  
  if (side === 'right') {
    drawerClasses.push('border-l');
  } else {
    drawerClasses.push('border-r');
  }
  
  if (respectMotionPreference) {
    drawerClasses.push('motion-safe:animate-in', sideClass.slideIn, 'motion-safe:duration-300');
  }
  
  const drawerClassNames = [...drawerClasses, className].filter(Boolean).join(' ');
  
  if (!isOpen) return null;
  
  const drawerContent = (
    <div
      className={overlayClasses.join(' ')}
      onClick={overlay ? handleOverlayClick : undefined}
      data-testid={testId}
    >
      <div
        ref={drawerRef}
        className={drawerClassNames}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
  
  // Render drawer in portal
  return createPortal(drawerContent, document.body);
};

export default MobileDrawer;
