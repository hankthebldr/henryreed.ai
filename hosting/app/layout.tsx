import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { AppStateProvider } from '../contexts/AppStateContext';
import ConditionalLayout from '../components/ConditionalLayout';

export const metadata = {
  title: 'Cortex XSIAM Portal - Domain Consultant Hub | Palo Alto Networks Solution',
  description: 'Professional Cortex XSIAM POV Management & Security Operations Platform powered by Palo Alto Networks technology for Domain Consultants',
  keywords: 'Palo Alto Networks, Cortex XSIAM, XDR, XSOAR, Security Operations, SIEM, POV, Security Demonstration, Domain Consultant, Cloud Security',
  authors: [{ name: 'Henry Reed AI', url: 'https://henryreed.ai' }],
  creator: 'Henry Reed AI',
  publisher: 'Palo Alto Networks Solution Partner',
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
    title: 'Cortex XSIAM Portal - Professional Security Operations Platform',
    description: 'Advanced Palo Alto Networks Cortex XSIAM demonstration platform for proof-of-value engagements and security operations',
    url: 'https://henryreed.ai',
    siteName: 'Cortex XSIAM Portal',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/assets/branding/icons/cortex-192x192.png',
        width: 192,
        height: 192,
        alt: 'Cortex XSIAM Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cortex XSIAM Portal - Professional Security Operations',
    description: 'Advanced Palo Alto Networks Cortex XSIAM demonstration platform for proof-of-value engagements',
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
  themeColor: '#FA582D', // Palo Alto Networks primary orange
  // Legacy theme color: '#00CC66',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Palo Alto Networks/Cortex Branding Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/assets/branding/icons/cortex-32x32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/assets/branding/icons/cortex-192x192.png" sizes="192x192" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FA582D" />
        <meta name="msapplication-TileColor" content="#FA582D" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Legacy favicons (commented for reference)
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#00CC66" />
        <meta name="msapplication-TileColor" content="#000000" />
        */}
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
