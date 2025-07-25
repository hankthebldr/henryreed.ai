import { ReactNode } from 'react';
import type { Metadata } from 'next';
import '../styles/globals.css';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export const metadata: Metadata = {
  title: 'Henry Reed - Technology Portfolio',
  description: 'Personal website showcasing technology, cybersecurity, and development projects',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="dark">
      <body className="bg-white text-black antialiased dark:bg-gray-950 dark:text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 xl:max-w-5xl xl:px-0">
          <div className="flex h-screen flex-col justify-between font-sans">
            <Header />
            <main className="mb-auto">{children}</main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
