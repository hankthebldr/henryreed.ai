import './globals.css';
import AppHeader from '../components/AppHeader';
import BreadcrumbNavigation from '../components/BreadcrumbNavigation';
import NotificationSystem from '../components/NotificationSystem';
import TerminalHost from '../components/terminal/TerminalHost';
import { AuthProvider } from '../contexts/AuthContext';
import { AppStateProvider } from '../contexts/AppStateContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Cortex DC Portal - Domain Consultant Hub | Henry Reed AI</title>
        <meta name="description" content="Professional XSIAM POV Management & Security Demonstration Platform for Domain Consultants" />
      </head>
      <body>
        <AuthProvider>
          <AppStateProvider>
            <AppHeader />
            <BreadcrumbNavigation />
            <NotificationSystem />
            <TerminalHost />
            {children}
          </AppStateProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
