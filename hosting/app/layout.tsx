import './globals.css';
import './dc-portal-styles.css';
import { AuthProvider } from '../contexts/AuthContext';
import { AppStateProvider } from '../contexts/AppStateContext';
import ConditionalLayout from '../components/ConditionalLayout';

export const metadata = {
  title: 'Henry Reed AI - Professional Platform',
  description: 'Professional engagement platform for project management, customer demos, and technical solutions',
  keywords: 'Henry Reed AI, Professional Platform, Project Management, Customer Engagement, Technical Solutions, Portfolio Management',
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
    title: 'Henry Reed AI - Professional Platform',
    description: 'Professional platform for project management, customer engagement, and technical solutions',
    url: 'https://henryreed.ai',
    siteName: 'Henry Reed AI',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/assets/branding/icons/cortex-192x192.png',
        width: 192,
        height: 192,
        alt: 'Cortex Domain Consultant Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Henry Reed AI - Professional Platform',
    description: 'Professional platform for project management, customer engagement, and technical solutions',
    images: ['/favicon.ico'],
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
      // New Palo Alto Networks/Cortex favicons
      { url: '/favicon.ico', sizes: '32x32' }, // Cortex-branded favicon
      { url: '/assets/branding/icons/cortex-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/assets/branding/icons/cortex-192x192.png', sizes: '192x192', type: 'image/png' },
      // Legacy favicon (commented for reference)
      // { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon-180x180.png', sizes: '180x180' }, // Updated to match Palo Alto asset
    ],
  },
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#e97444', // Orange theme color
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#e97444" />
        <meta name="msapplication-TileColor" content="#e97444" />
      </head>
      <body className="bg-cortex-bg-primary text-cortex-text-primary">
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
