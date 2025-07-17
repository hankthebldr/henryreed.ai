/* eslint-disable @next/next/no-page-custom-font */
import "./styles/globals.scss";
import "./styles/markdown.scss";
import "./styles/highlight.scss";
import { getClientConfig } from "./config/client";
import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
// import Google Tag Manager and Google Analytics using react-gtm-module and react-ga
import TagManager from "react-gtm-module";
import ReactGA from "react-ga";
import { getServerSideConfig } from "./config/server";

export const metadata: Metadata = {
  title: "Malicious GPT ",
  description: "Are you ready to test your next generation security?",
  appleWebApp: {
    title: "Mal-GPT",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#151515" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const serverConfig = getServerSideConfig();

  return (
    <html lang="en">
      <head>
        <meta name="config" content={JSON.stringify(getClientConfig())} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link
          rel="manifest"
          href="/site.webmanifest"
          crossOrigin="use-credentials"
        ></link>
        <script src="/serviceWorkerRegister.js" defer></script>
      </head>
      <body>
        {children}
        {serverConfig?.isVercel && (
          <>
            <SpeedInsights />
          </>
        )}
        {serverConfig?.gtmId && (
          <>
            {TagManager.initialize({ gtmId: serverConfig.gtmId })}
          </>
        )}
        {serverConfig?.gaId && (
          <>
            {ReactGA.initialize(serverConfig.gaId)}
          </>
        )}
      </body>
    </html>
  );
}
