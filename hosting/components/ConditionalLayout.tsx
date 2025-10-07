'use client';

import { usePathname } from 'next/navigation';
import AppHeader from './AppHeader';
import BreadcrumbNavigation from './BreadcrumbNavigation';
import NotificationSystem from './NotificationSystem';
import TerminalHost from './terminal/TerminalHost';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/';

  return (
    <>
      {/* Only show navigation components when not on login page */}
      {!isLoginPage && (
        <>
          <AppHeader />
          <BreadcrumbNavigation />
          <TerminalHost />
        </>
      )}
      <NotificationSystem />
      {children}
    </>
  );
}