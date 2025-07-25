import React from 'react';
import { BreadcrumbProps } from '../utils/types';

const defaultSeparator = (
  <svg
    className="flex-shrink-0 w-4 h-4 text-fg-muted"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = defaultSeparator,
  maxItems,
  className = '',
  'data-testid': testId,
}) => {
  // Handle maxItems truncation
  let displayItems = items;
  let hasCollapsed = false;
  
  if (maxItems && items.length > maxItems) {
    hasCollapsed = true;
    const firstItem = items[0];
    const lastItems = items.slice(-(maxItems - 2));
    displayItems = [firstItem, ...lastItems];
  }
  
  const baseClasses = [
    'flex',
    'items-center',
    'space-x-2',
    'text-sm',
    'text-fg-muted',
  ];
  
  const breadcrumbClasses = [...baseClasses, className].filter(Boolean).join(' ');
  
  return (
    <nav
      className={breadcrumbClasses}
      aria-label="Breadcrumb"
      data-testid={testId}
    >
      <ol className="flex items-center space-x-2">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isFirst = index === 0;
          
          // Handle collapsed indicator
          if (hasCollapsed && index === 1) {
            return (
              <React.Fragment key="collapsed">
                <li className="flex items-center">
                  {separator}
                </li>
                <li className="flex items-center">
                  <span className="text-fg-muted" aria-label="More items">
                    ...
                  </span>
                </li>
              </React.Fragment>
            );
          }
          
          return (
            <React.Fragment key={index}>
              {!isFirst && (
                <li className="flex items-center" aria-hidden="true">
                  {separator}
                </li>
              )}
              
              <li className="flex items-center">
                {item.href && !item.isCurrentPage ? (
                  <a
                    href={item.href}
                    className="flex items-center text-fg-default hover:text-accent-fg focus:outline-none focus:ring-2 focus:ring-accent-subtle focus:ring-offset-2 focus:ring-offset-canvas-default rounded-sm transition-colors duration-200"
                    onClick={item.onClick}
                    aria-current={item.isCurrentPage ? 'page' : undefined}
                  >
                    {item.icon && (
                      <span className="mr-1 flex-shrink-0" aria-hidden="true">
                        {item.icon}
                      </span>
                    )}
                    {item.label}
                  </a>
                ) : item.onClick && !item.isCurrentPage ? (
                  <button
                    type="button"
                    className="flex items-center text-fg-default hover:text-accent-fg focus:outline-none focus:ring-2 focus:ring-accent-subtle focus:ring-offset-2 focus:ring-offset-canvas-default rounded-sm transition-colors duration-200"
                    onClick={item.onClick}
                    aria-current={item.isCurrentPage ? 'page' : undefined}
                  >
                    {item.icon && (
                      <span className="mr-1 flex-shrink-0" aria-hidden="true">
                        {item.icon}
                      </span>
                    )}
                    {item.label}
                  </button>
                ) : (
                  <span
                    className={`flex items-center ${
                      item.isCurrentPage 
                        ? 'text-fg-default font-medium' 
                        : 'text-fg-muted'
                    }`}
                    aria-current={item.isCurrentPage ? 'page' : undefined}
                  >
                    {item.icon && (
                      <span className="mr-1 flex-shrink-0" aria-hidden="true">
                        {item.icon}
                      </span>
                    )}
                    {item.label}
                  </span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
