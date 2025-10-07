'use client';

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import AppHeader from './AppHeader';
import BreadcrumbNavigation from './BreadcrumbNavigation';
import NotificationSystem from './NotificationSystem';
import TerminalHost from './terminal/TerminalHost';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/';

  // Memoize the navigation components to prevent unnecessary re-renders
  const navigationComponents = useMemo(() => {
    if (isLoginPage) return null;
    
    return (
      <>
        <AppHeader />
        <BreadcrumbNavigation />
        <TerminalHost />
      </>
    );
  }, [isLoginPage]);

  return (
    <>
      {navigationComponents}
      <NotificationSystem />
      {children}
    </>
  );
}
