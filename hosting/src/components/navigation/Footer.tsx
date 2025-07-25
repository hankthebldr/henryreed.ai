import React from 'react';
import { FooterProps } from '../utils/types';

const Footer: React.FC<FooterProps> = ({
  links = [],
  socialLinks = [],
  copyright,
  logo,
  className = '',
  'data-testid': testId,
}) => {
  const baseClasses = [
    'bg-canvas-subtle',
    'border-t',
    'border-border-default',
    'py-8',
    'px-4',
    'sm:px-6',
    'lg:px-8',
  ];
  
  const footerClasses = [...baseClasses, className].filter(Boolean).join(' ');
  
  return (
    <footer
      className={footerClasses}
      data-testid={testId}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo and copyright */}
          <div className="flex flex-col items-center md:items-start space-y-2">
            {logo && (
              <div className="flex-shrink-0">
                {logo}
              </div>
            )}
            {copyright && (
              <p className="text-sm text-fg-muted text-center md:text-left">
                {copyright}
              </p>
            )}
          </div>
          
          {/* Links */}
          {links.length > 0 && (
            <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-sm text-fg-muted hover:text-fg-default focus:outline-none focus:ring-2 focus:ring-accent-subtle focus:ring-offset-2 focus:ring-offset-canvas-subtle rounded-sm transition-colors duration-200"
                  target={link.isExternal ? '_blank' : undefined}
                  rel={link.isExternal ? 'noopener noreferrer' : undefined}
                >
                  {link.label}
                  {link.isExternal && (
                    <span className="sr-only"> (opens in new window)</span>
                  )}
                </a>
              ))}
            </div>
          )}
          
          {/* Social links */}
          {socialLinks.length > 0 && (
            <div className="flex items-center space-x-4">
              {socialLinks.map((socialLink, index) => (
                <a
                  key={index}
                  href={socialLink.href}
                  className="text-fg-muted hover:text-fg-default focus:outline-none focus:ring-2 focus:ring-accent-subtle focus:ring-offset-2 focus:ring-offset-canvas-subtle rounded-sm transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={socialLink.label}
                >
                  <span className="sr-only">{socialLink.label}</span>
                  <span className="w-5 h-5 flex items-center justify-center" aria-hidden="true">
                    {socialLink.icon}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
        
        {/* Full width layout for multiple sections */}
        {(links.length > 6 || (logo && socialLinks.length > 0)) && (
          <div className="mt-8 pt-8 border-t border-border-muted">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Logo section */}
              {logo && (
                <div className="space-y-4">
                  {logo}
                  {copyright && (
                    <p className="text-sm text-fg-muted">
                      {copyright}
                    </p>
                  )}
                </div>
              )}
              
              {/* Links section */}
              {links.length > 6 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-fg-default uppercase tracking-wider">
                    Links
                  </h3>
                  <ul className="space-y-2">
                    {links.map((link, index) => (
                      <li key={index}>
                        <a
                          href={link.href}
                          className="text-sm text-fg-muted hover:text-fg-default focus:outline-none focus:ring-2 focus:ring-accent-subtle focus:ring-offset-2 focus:ring-offset-canvas-subtle rounded-sm transition-colors duration-200"
                          target={link.isExternal ? '_blank' : undefined}
                          rel={link.isExternal ? 'noopener noreferrer' : undefined}
                        >
                          {link.label}
                          {link.isExternal && (
                            <span className="sr-only"> (opens in new window)</span>
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Social section */}
              {socialLinks.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-fg-default uppercase tracking-wider">
                    Follow Us
                  </h3>
                  <div className="flex space-x-4">
                    {socialLinks.map((socialLink, index) => (
                      <a
                        key={index}
                        href={socialLink.href}
                        className="text-fg-muted hover:text-fg-default focus:outline-none focus:ring-2 focus:ring-accent-subtle focus:ring-offset-2 focus:ring-offset-canvas-subtle rounded-sm transition-colors duration-200"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={socialLink.label}
                      >
                        <span className="sr-only">{socialLink.label}</span>
                        <span className="w-5 h-5 flex items-center justify-center" aria-hidden="true">
                          {socialLink.icon}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
