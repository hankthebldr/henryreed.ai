import { ReactNode } from 'react';
import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Henry Reed - Terminal Interface',
  description: 'Personal website with terminal and hacker-themed interfaces',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="hack font-terminal bg-hack-background text-terminal-green min-h-screen">
        {children}
      </body>
    </html>
  );
}
