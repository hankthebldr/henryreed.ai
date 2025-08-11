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
        <title>POV-CLI - Proof-of-Value Command Line Interface | Henry Reed AI</title>
        <meta name="description" content="Interactive Proof-of-Value CLI for AI consulting, development services, and technical demonstrations" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
