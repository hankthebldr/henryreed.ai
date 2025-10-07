import type { NextConfig } from 'next'

const enableWebpackExp = process.env.NEXT_ENABLE_WEBPACK_EXPERIMENTS === '1';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  images: {
    unoptimized: true
  },
  experimental: {
    turbopack: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
};
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    ...(enableWebpackExp ? { webpackBuildWorker: true } : {})
  },
  webpack: (config, { dev, isServer }) => {
    if (enableWebpackExp && !dev) {
      config.experiments = {
        ...(config.experiments || {}),
        topLevelAwait: true,
        layers: true,
        asyncWebAssembly: true
      };
    }
    
    // Production optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10
            },
            commands: {
              test: /[\\/]lib[\\/].*-commands\.tsx?$/,
              name: 'commands',
              chunks: 'all',
              priority: 5
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 1
            }
          }
        }
      };
    }
    
    return config;
  }
}

export default nextConfig
