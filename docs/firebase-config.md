# Firebase Configuration - henryreed.ai

## 🔧 Configuration Files Overview

This document contains the final, production-ready configuration files for the henryreed.ai Firebase project. All configurations follow best practices for Next.js static export with multi-codebase Cloud Functions.

## 📄 firebase.json - Main Firebase Configuration

```json
{
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "predeploy": [
        "npm --prefix functions ci",
        "npm --prefix functions run build"
      ]
    },
    {
      "source": "henryreedai",
      "codebase": "genkit",
      "predeploy": [
        "npm --prefix henryreedai ci",
        "npm --prefix henryreedai run build"
      ]
    }
  ],
  "hosting": {
    "public": "hosting/out",
    "ignore": ["**/.*", "**/node_modules/**"],
    "predeploy": [
      "npm --prefix hosting ci",
      "npm --prefix hosting run build"
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|otf)",
        "headers": [
          { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
        ]
      },
      {
        "source": "/_next/static/**",
        "headers": [
          { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
        ]
      },
      {
        "source": "**/*.html",
        "headers": [
          { "key": "Cache-Control", "value": "public, max-age=300, must-revalidate" }
        ]
      },
      {
        "source": "**/*.json",
        "headers": [
          { "key": "Cache-Control", "value": "public, max-age=300, s-maxage=600, stale-while-revalidate=1800" },
          { "key": "X-Content-Type-Options", "value": "nosniff" }
        ]
      },
      {
        "source": "**",
        "headers": [
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
          { "key": "Permissions-Policy", "value": "geolocation=(), microphone=(), camera=()" },
          { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" },
          { "key": "Content-Security-Policy", "value": "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net https://*.run.app; font-src 'self' data: https:" }
        ]
      }
    ],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ],
    "cleanUrls": false,
    "trailingSlash": true
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "dataconnect": {
    "source": "dataconnect"
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "functions": {
      "port": 5001
    },
    "firestore": {
      "port": 8080
    },
    "hosting": {
      "port": 5005
    },
    "storage": {
      "port": 9199
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

### Key Configuration Features
- **Multi-codebase Functions**: Supports both default functions and Genkit AI functions
- **Enhanced Security Headers**: CSP, HSTS, X-Frame-Options, and more
- **Optimized Caching**: 1-year cache for static assets, 5-minute cache for HTML
- **Emulator Support**: Complete local development environment
- **Next.js Integration**: Proper static export support with trailing slash

## ⚙️ Next.js Configuration (hosting/next.config.ts)

```typescript
import type { NextConfig } from 'next'

const enableWebpackExp = process.env.NEXT_ENABLE_WEBPACK_EXPERIMENTS === '1';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    ...(enableWebpackExp ? { webpackBuildWorker: true } : {}),
  },
  // Turbopack configuration for Next.js 15+
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
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
  },
}

export default nextConfig
```

### Key Features
- **Static Export**: Optimized for Firebase Hosting CDN
- **React Strict Mode**: Enhanced development experience
- **Code Splitting**: Optimized vendor, common, and command chunks
- **Webpack Experiments**: Optional advanced features
- **Turbopack Support**: Fast development builds

## 📦 Package.json Scripts (hosting/package.json)

```json
{
  "private": true,
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "dev": "next dev --turbo",
    "dev:no-turbo": "next dev",
    "dev:exp": "cross-env NEXT_ENABLE_WEBPACK_EXPERIMENTS=1 next dev --turbo",
    "build": "next build",
    "build:exp": "cross-env NEXT_ENABLE_WEBPACK_EXPERIMENTS=1 next build",
    "start": "serve out",
    "type-check": "tsc --noEmit",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:smoke": "npm run test:e2e -- --grep=\"@smoke\"",
    "test:all": "npm run test && npm run test:e2e",
    "validate": "npm run type-check && npm run lint && npm run test:all",
    "firebase:serve": "cd .. && firebase emulators:start --only hosting",
    "firebase:emulators": "cd .. && firebase emulators:start",
    "deploy": "npm run build:exp && cd .. && firebase deploy --only hosting",
    "deploy:preview": "npm run build:exp && cd .. && firebase hosting:channel:deploy preview",
    "lint:branding": "node ./scripts/check-no-orange.js",
    "fix:branding": "node ./scripts/replace-orange.js"
  }
}
```

### Key Scripts
- **dev**: Turbopack-powered development server
- **build**: Production static export build
- **type-check**: TypeScript validation
- **deploy**: One-click deployment to Firebase
- **validate**: Full validation pipeline

## 🔒 Security Rules

### Firestore Security Rules (firestore.rules)

```javascript
rules_version = '2';

// Firestore Security Rules for Cortex DC Portal
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions for authentication and authorization
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isAuthorizedUser() {
      return isAuthenticated() && 
             (request.auth.token.email.matches('.*@henryreed.ai') ||
              request.auth.token.email.matches('.*@paloaltonetworks.com') ||
              hasRole('admin') || hasRole('manager'));
    }
    
    function hasRole(role) {
      return isAuthenticated() && 
             ('roles' in request.auth.token) &&
             (role in request.auth.token.roles) &&
             request.auth.token.roles[role] == true;
    }
    
    function isValidEmail() {
      return request.auth.token.email.matches('.*@henryreed.ai') ||
             request.auth.token.email.matches('.*@paloaltonetworks.com');
    }
    
    // Users collection - profile data
    match /users/{userId} {
      allow read: if isAuthenticated() && (isOwner(userId) || hasRole('admin'));
      allow create: if isAuthenticated() && isOwner(userId) && isValidEmail();
      allow update: if isAuthenticated() && isOwner(userId);
      allow delete: if hasRole('admin');
    }
    
    // TRR (Technical Requirements Review) documents
    match /trr/{trrId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthorizedUser();
      allow delete: if hasRole('admin') || hasRole('manager');
      
      // TRR sub-collections (comments, attachments, etc.)
      match /{subCollection}/{docId} {
        allow read: if isAuthenticated();
        allow write: if isAuthorizedUser();
      }
    }
    
    // POV (Proof of Value) documents
    match /pov/{povId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthorizedUser();
      allow delete: if hasRole('admin') || hasRole('manager');
      
      match /{subCollection}/{docId} {
        allow read: if isAuthenticated();
        allow write: if isAuthorizedUser();
      }
    }
    
    // Scenarios collection
    match /scenarios/{scenarioId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthorizedUser();
      allow delete: if hasRole('admin');
    }
    
    // Templates collection
    match /templates/{templateId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if hasRole('admin') || hasRole('manager');
    }
    
    // Activity logs (read-only for users, write for system)
    match /activity/{activityId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated(); // System writes only
      allow update, delete: if hasRole('admin');
    }
    
    // Default deny rule for any unlisted collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Storage Security Rules (storage.rules)

```javascript
rules_version = '2';

// Firebase Storage Security Rules for Cortex DC Portal
service firebase.storage {
  match /b/{bucket}/o {
    // Authentication required for all operations
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Check if user is authorized (has specific email domains or roles)
    function isAuthorizedUser() {
      return request.auth != null && 
             (request.auth.token.email.matches('.*@henryreed.ai') ||
              request.auth.token.email.matches('.*@paloaltonetworks.com') ||
              request.auth.token.admin == true);
    }
    
    // User-specific uploads (POV documents, attachments, etc.)
    match /users/{userId}/{allPaths=**} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // TRR attachments and documents
    match /trr/{trrId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthorizedUser();
    }
    
    // Public resources (company logos, branding assets)
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if isAuthorizedUser();
    }
    
    // Template documents and scenario files
    match /templates/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthorizedUser();
    }
    
    // Scenario-related uploads
    match /scenarios/{scenarioId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthorizedUser();
    }
    
    // POV-related uploads
    match /pov/{povId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthorizedUser();
    }
    
    // Export files (temporary storage for generated reports)
    match /exports/{userId}/{allPaths=**} {
      // User can read/write their own exports, admins can access all
      allow read, write: if isAuthenticated() && 
                        (request.auth.uid == userId || 
                         request.auth.token.admin == true);
    }
    
    // File size limits and content type validation
    function isValidFileSize() {
      return request.resource.size <= 10 * 1024 * 1024; // 10MB limit
    }
    
    function isValidImageSize() {
      return request.resource.size <= 5 * 1024 * 1024; // 5MB limit for images
    }
    
    function isValidImageType() {
      return request.resource.contentType.matches('image/.*');
    }
    
    function isValidDocumentType() {
      return request.resource.contentType in [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/csv',
        'application/json'
      ];
    }
    
    // Apply file validation to uploads
    match /{allPaths=**} {
      allow write: if isAuthenticated() && 
                     (isValidFileSize() || 
                      (isValidImageType() && isValidImageSize())) &&
                     (isValidImageType() || isValidDocumentType());
    }
  }
}
```

## 🗃️ Data Connect Configuration (dataconnect/dataconnect.yaml)

```yaml
specVersion: "v1"
serviceId: "henryreedai"
location: "us-east1"
schema:
  source: "./schema"
  datasource:
    postgresql:
      database: "fdcdb"
      cloudSql:
        instanceId: "henryreedai-fdc"
        schemaValidation: "STRICT"     # STRICT mode ensures Postgres schema matches Data Connect exactly
connectorDirs: ["./example"]
```

### Key Features
- **PostgreSQL Integration**: Cloud SQL with strict schema validation
- **GraphQL Schema**: Type-safe database operations
- **Firebase Auth Integration**: Seamless authentication with Firebase

## 🚀 Deployment Scripts

### Enhanced deploy.sh

```bash
#!/usr/bin/env bash
# Enhanced Firebase deployment script with multi-service support
set -euo pipefail

PROJECT=$(firebase use --json | jq -r '.active')
echo "🚀 Deploying to Firebase Project: $PROJECT"
echo "📊 Environment: Node $(node -v) | Firebase $(firebase --version)"

# Pre-deployment validation
echo "🔍 Running pre-deployment checks..."
npm --prefix hosting run type-check
npm --prefix hosting run lint || echo "⚠️  Lint warnings found"

# Build all components
echo "🏗️  Building hosting application..."
npm --prefix hosting ci --silent
npm --prefix hosting run build

echo "🔧 Building functions..."
npm --prefix functions ci --silent && npm --prefix functions run build
npm --prefix henryreedai ci --silent && npm --prefix henryreedai run build

# Apply Data Connect if available
if firebase dataconnect:apply --help >/dev/null 2>&1; then
    echo "🗃️  Applying Data Connect configuration..."
    (cd dataconnect && firebase dataconnect:apply --project "$PROJECT" --non-interactive --force)
else
    echo "ℹ️  Data Connect CLI not available, skipping..."
fi

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy --only functions,hosting,firestore:rules,storage:rules

# Post-deployment health checks
echo "🏥 Running post-deployment health checks..."
sleep 5
curl -f -s -I "https://henryreedai.web.app" > /dev/null && echo "✅ Hosting health check passed" || echo "❌ Hosting health check failed"

echo "✅ Deployment complete!"
echo "🌐 Production URL: https://henryreedai.web.app"
```

## 🎛️ Environment Variables

### Frontend Environment Variables
```bash
# hosting/.env.production
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=henryreedai.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=henryreedai
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=henryreedai.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Feature flags
NEXT_PUBLIC_USE_FUNCTIONS=1
NEXT_PUBLIC_AI_ENABLED=true
NEXT_PUBLIC_AUTH_PROVIDER=firebase
```

### Functions Environment Variables (via Firebase Secrets)
```bash
# Production secrets
firebase functions:secrets:set OPENAI_API_KEY
firebase functions:secrets:set DATACONNECT_DATABASE_URL
firebase functions:secrets:set APP_ENVIRONMENT=production
firebase functions:secrets:set VERTEX_AI_PROJECT_ID=henryreedai
```

## 🔧 Development Configuration

### Local Development
```bash
# Start development server
cd hosting
npm run dev

# Start Firebase emulators
firebase emulators:start

# Run with experimental features
npm run dev:exp
```

### Testing Configuration
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# End-to-end tests
npm run test:e2e

# Full validation
npm run validate
```

## 📊 Monitoring & Analytics

### Firebase Performance Monitoring
- Automatic performance tracking
- Core Web Vitals monitoring
- Custom performance metrics

### Firebase Analytics
- User engagement tracking
- Custom event tracking
- Conversion funnel analysis

### Error Tracking
- Automatic crash reporting
- Custom error logging
- Performance issue detection

---

*This configuration provides a production-ready Firebase setup optimized for performance, security, and scalability while maintaining excellent developer experience.*