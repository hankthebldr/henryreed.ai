import './globals.css';
import AppHeader from '../components/AppHeader';
import { AuthProvider } from '../contexts/AuthContext';

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
          <AppHeader />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
