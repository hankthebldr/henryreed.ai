import type { NextConfig } from 'next'

const enableWebpackExp = process.env.NEXT_ENABLE_WEBPACK_EXPERIMENTS === '1';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  images: {
    unoptimized: true
  },
  experimental: {
    ...(enableWebpackExp ? { webpackBuildWorker: true } : {})
  },
  webpack: (config, { dev }) => {
    if (enableWebpackExp && !dev) {
      config.experiments = {
        ...(config.experiments || {}),
        topLevelAwait: true,
        layers: true,
        asyncWebAssembly: true
      };
    }
    return config;
  }
}

export default nextConfig
