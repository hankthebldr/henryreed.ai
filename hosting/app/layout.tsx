'use client';

import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>POV-CLI - Point of View Command Line Interface</title>
        <meta name="description" content="Interactive terminal interface for AI consulting and services" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
