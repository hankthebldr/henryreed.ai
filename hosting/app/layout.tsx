import type { Metadata, Viewport } from 'next';
import './globals.css';
import './dc-portal-styles.css';
import { AuthProvider } from '../contexts/AuthContext';
import { AppStateProvider } from '../contexts/AppStateContext';
import { PortfolioProvider } from '../contexts/PortfolioContext';
import ConditionalLayout from '../components/ConditionalLayout';

const cortexFaviconSvg = '/assets/branding/favicons/favicon.svg';
const cortexFaviconIco = '/assets/branding/favicons/favicon.ico';
const cortexPng32 = '/assets/branding/icons/cortex-32x32.png';
const cortexPng192 = '/assets/branding/icons/cortex-192x192.png';

export const metadata: Metadata = {
  title: 'Cortex Domain Consultant Platform',
  description:
    'Professional engagement platform for project management, customer demos, and technical solutions',
  keywords: [
    'Henry Reed AI',
    'Professional Platform',
    'Project Management',
    'Customer Engagement',
    'Technical Solutions',
    'Portfolio Management',
  ],
  authors: [{ name: 'Henry Reed AI', url: 'https://henryreed.ai' }],
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
    title: 'Cortex Domain Consultant Platform',
    description:
      'Professional platform for project management, customer engagement, and technical solutions',
    url: 'https://henryreed.ai',
    siteName: 'Henry Reed AI',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: cortexPng192,
        width: 192,
        height: 192,
        alt: 'Cortex Domain Consultant Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cortex Domain Consultant Platform',
    description:
      'Professional platform for project management, customer engagement, and technical solutions',
    images: [cortexPng192],
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
      { url: cortexFaviconSvg, type: 'image/svg+xml' },
      { url: cortexFaviconIco, sizes: 'any' },
      { url: cortexPng32, sizes: '32x32', type: 'image/png' },
      { url: cortexPng192, sizes: '192x192', type: 'image/png' },
    ],
    shortcut: [cortexFaviconIco],
    apple: [{ url: cortexPng192, sizes: '180x180', type: 'image/png' }],
    other: [{ rel: 'mask-icon', url: cortexFaviconSvg, color: '#00CC66' }],
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#00CC66', // Cortex green theme color
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href={cortexFaviconSvg} type="image/svg+xml" />
        <link rel="alternate icon" href={cortexPng32} type="image/png" />
        <link rel="icon" href={cortexFaviconIco} type="image/x-icon" />
        <link rel="apple-touch-icon" href={cortexPng192} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00CC66" />
        <meta name="msapplication-TileColor" content="#00CC66" />
      </head>
      <body className="bg-cortex-bg-primary text-cortex-text-primary">
        <AuthProvider>
          <AppStateProvider>
            <PortfolioProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </PortfolioProvider>
          </AppStateProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
