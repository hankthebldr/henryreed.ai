import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { AppStateProvider } from '../contexts/AppStateContext';
import ConditionalLayout from '../components/ConditionalLayout';

export const metadata = {
  title: 'Cortex DC Portal - Domain Consultant Hub | Henry Reed AI',
  description: 'Professional XSIAM POV Management & Security Demonstration Platform for Domain Consultants',
  keywords: 'XSIAM, Cortex, POV, Security, Demonstration, Domain Consultant, Palo Alto Networks',
  authors: [{ name: 'Henry Reed AI' }],
  creator: 'Henry Reed AI',
  publisher: 'Henry Reed AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://henryreed.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Cortex DC Portal - Professional POV Management',
    description: 'Advanced security demonstration platform for XSIAM proof-of-value engagements',
    url: 'https://henryreed.ai',
    siteName: 'Cortex DC Portal',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cortex DC Portal - Professional POV Management',
    description: 'Advanced security demonstration platform for XSIAM proof-of-value engagements',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#00CC66',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00CC66" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body>
        <AuthProvider>
          <AppStateProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </AppStateProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
