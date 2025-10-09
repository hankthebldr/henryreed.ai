import './globals.css';
import './dc-portal-styles.css';
import { AuthProvider } from '../contexts/AuthContext';
import { AppStateProvider } from '../contexts/AppStateContext';
import ConditionalLayout from '../components/ConditionalLayout';

export const metadata = {
  title: 'Cortex Domain Consultant Platform',
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
    title: 'Cortex Domain Consultant Platform',
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
    title: 'Cortex Domain Consultant Platform',
    description: 'Professional platform for project management, customer engagement, and technical solutions',
    images: ['/assets/branding/icons/cortex-192x192.png'],
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
      // Cortex neural network SVG favicon (primary)
      { url: '/favicon.svg', type: 'image/svg+xml' },
      // PNG fallbacks for older browsers
      { url: '/assets/branding/icons/cortex-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/assets/branding/icons/cortex-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
    apple: [
      { url: '/assets/branding/icons/cortex-192x192.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
};

export const viewport = {
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
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/assets/branding/icons/cortex-32x32.png" />
        <link rel="apple-touch-icon" href="/assets/branding/icons/cortex-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00CC66" />
        <meta name="msapplication-TileColor" content="#00CC66" />
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
