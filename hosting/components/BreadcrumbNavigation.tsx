'use client';

import React from 'react';
import Link from 'next/link';
import { useAppState } from '../contexts/AppStateContext';

interface BreadcrumbItem {
  label: string;
  path: string;
  active?: boolean;
}

export default function BreadcrumbNavigation() {
  const { state, actions } = useAppState();
  const breadcrumbs = state.navigation.breadcrumbs;

  const handleBreadcrumbClick = (path: string) => {
    // Update breadcrumbs to remove items after clicked item
    const clickedIndex = breadcrumbs.findIndex(b => b.path === path);
    if (clickedIndex >= 0) {
      actions.updateBreadcrumbs(breadcrumbs.slice(0, clickedIndex + 1));
    }
  };

  if (breadcrumbs.length <= 1) return null;

  return (
    <div className="bg-cortex-bg-tertiary border-b border-cortex-border-secondary px-3 md:px-4 py-2">
      <nav className="flex overflow-x-auto" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-1 md:space-x-2 text-sm whitespace-nowrap">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            return (
              <li key={crumb.path} className="flex items-center">
                {index > 0 && (
                  <span className="text-cortex-text-muted mx-1 md:mx-2">
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
                {isLast ? (
<span className="text-cortex-green font-medium text-xs md:text-sm">{crumb.label}</span>
                ) : (
                  <Link
                    href={crumb.path}
                    onClick={() => handleBreadcrumbClick(crumb.path)}
className="text-cortex-text-secondary hover:text-cortex-green transition-colors font-medium text-xs md:text-sm"
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
