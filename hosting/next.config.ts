import type { NextConfig } from 'next'

// Canonical Next.js config for Firebase static hosting per WARP.md
const nextConfig: NextConfig = {
  output: 'export',            // Static site generation
  trailingSlash: true,         // Firebase hosting compatibility  
  distDir: 'out',              // Build output directory
  images: { 
    unoptimized: true          // Required for static hosting
  },
  reactStrictMode: true,
  typescript: { 
    ignoreBuildErrors: false   // Catch TypeScript errors during build
  },
  eslint: { 
    ignoreDuringBuilds: false  // Catch ESLint errors during build
  },
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  }
  
  // NOTE: Advanced experimental features and webpack config commented out
  // to ensure stable builds. The previous config had syntax errors and
  // duplicate experimental blocks that prevented successful compilation.
  // 
  // If advanced webpack features are needed in the future, they can be
  // re-enabled with proper testing and validation.
  //
  // Previous problematic config moved to docs/archive/next-config-legacy.md
}

export default nextConfig
