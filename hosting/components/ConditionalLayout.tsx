'use client';

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import AppHeader from './AppHeader';
import BreadcrumbNavigation from './BreadcrumbNavigation';
import NotificationSystem from './NotificationSystem';
import TerminalHost from './terminal/TerminalHost';

// V2 Components - Modern UI with Chakra + Tailwind
import { AppShellV2 } from './layout/AppShellV2';
import { UIVersionGate } from '../app/providers';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/';
  
  // Skip layout for login page
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <>
      <UIVersionGate
        v1Component={
          /* V1_LEGACY: Original layout with AppHeader + BreadcrumbNavigation + TerminalHost */
          <>
            <AppHeader />
            <BreadcrumbNavigation />
            <TerminalHost />
            <NotificationSystem />
            {children}
          </>
        }
        v2Component={
          /* V2_MODERN: AppShellV2 with integrated navigation and glassmorphic design */
          <AppShellV2>
            <NotificationSystem />
            {children}
          </AppShellV2>
        }
      />
    </>
  );
}
