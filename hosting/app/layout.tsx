import './globals.css';

export const metadata = {
  title: 'POV-CLI - Point of View Command Line Interface',
  description: 'Interactive terminal interface for AI consulting and services',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>POV-CLI</title>
        <meta name="description" content="Point of View Command Line Interface" />
      </head>
      <body>{children}</body>
    </html>
  );
}
