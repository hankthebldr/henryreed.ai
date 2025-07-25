import React, { useState } from 'react';
import { NavbarProps } from '../utils/types';

const variantClasses = {
  default: 'bg-canvas-default border-border-default',
  glass: 'bg-canvas-default bg-opacity-80 backdrop-blur-md border-border-subtle',
  solid: 'bg-canvas-overlay border-border-default',
};

const Navbar: React.FC<NavbarProps> = ({
  brand,
  items = [],
  actions,
  isFixed = false,
  position = 'top',
  variant = 'default',
  className = '',
  'data-testid': testId,
  ...rest
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const variantClass = variantClasses[variant];
  
  const baseClasses = [
    'w-full',
    'border-b',
    'z-40',
    variantClass,
  ];
  
  if (isFixed) {
    baseClasses.push('fixed');
    if (position === 'top') {
      baseClasses.push('top-0');
    } else {
      baseClasses.push('bottom-0');
    }
  }
  
  const navbarClasses = [...baseClasses, className].filter(Boolean).join(' ');
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const handleKeyDown = (event: React.KeyboardEvent, onClick?: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };
  
  return (
    <nav
      className={navbarClasses}
      data-testid={testId}
      {...rest}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand / Logo */}
          <div className="flex items-center">
            {brand && (
              <div className="flex-shrink-0">
                {brand}
              </div>
            )}
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {items.map((item, index) => {
              const itemClasses = [
                'px-3',
                'py-2',
                'rounded-md',
                'text-sm',
                'font-medium',
                'transition-colors',
                'duration-200',
                'focus:outline-none',
                'focus:ring-2',
                'focus:ring-accent-subtle',
                'focus:ring-offset-2',
                'focus:ring-offset-canvas-default',
              ];
              
              if (item.isActive) {
                itemClasses.push('text-accent-fg', 'bg-accent-subtle');
              } else if (item.isDisabled) {
                itemClasses.push('text-fg-muted', 'cursor-not-allowed');
              } else {
                itemClasses.push('text-fg-default', 'hover:text-accent-fg', 'hover:bg-canvas-subtle');
              }
              
              const content = (
                <>
                  {item.icon && (
                    <span className="mr-2" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </>
              );
              
              if (item.href && !item.isDisabled) {
                return (
                  <a
                    key={index}
                    href={item.href}
                    className={itemClasses.join(' ')}
                    aria-current={item.isActive ? 'page' : undefined}
                  >
                    {content}
                  </a>
                );
              }
              
              return (
                <button
                  key={index}
                  type="button"
                  className={itemClasses.join(' ')}
                  onClick={item.isDisabled ? undefined : item.onClick}
                  disabled={item.isDisabled}
                  aria-current={item.isActive ? 'page' : undefined}
                >
                  {content}
                </button>
              );
            })}
          </div>
          
          {/* Actions */}
          {actions && (
            <div className="hidden md:flex md:items-center md:space-x-4">
              {actions}
            </div>
          )}
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-fg-muted hover:text-fg-default hover:bg-canvas-subtle focus:outline-none focus:ring-2 focus:ring-accent-subtle focus:ring-offset-2 focus:ring-offset-canvas-default"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border-default bg-canvas-default">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {items.map((item, index) => {
              const itemClasses = [
                'block',
                'px-3',
                'py-2',
                'rounded-md',
                'text-base',
                'font-medium',
                'transition-colors',
                'duration-200',
                'focus:outline-none',
                'focus:ring-2',
                'focus:ring-accent-subtle',
                'focus:ring-offset-2',
                'focus:ring-offset-canvas-default',
              ];
              
              if (item.isActive) {
                itemClasses.push('text-accent-fg', 'bg-accent-subtle');
              } else if (item.isDisabled) {
                itemClasses.push('text-fg-muted', 'cursor-not-allowed');
              } else {
                itemClasses.push('text-fg-default', 'hover:text-accent-fg', 'hover:bg-canvas-subtle');
              }
              
              const content = (
                <>
                  {item.icon && (
                    <span className="mr-2" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </>
              );
              
              if (item.href && !item.isDisabled) {
                return (
                  <a
                    key={index}
                    href={item.href}
                    className={itemClasses.join(' ')}
                    aria-current={item.isActive ? 'page' : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {content}
                  </a>
                );
              }
              
              return (
                <button
                  key={index}
                  type="button"
                  className={itemClasses.join(' ')}
                  onClick={item.isDisabled ? undefined : () => {
                    item.onClick?.();
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={item.isDisabled}
                  aria-current={item.isActive ? 'page' : undefined}
                >
                  {content}
                </button>
              );
            })}
          </div>
          
          {actions && (
            <div className="px-2 pb-3 border-t border-border-default">
              <div className="mt-3 space-y-2">
                {actions}
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
