# Deployment Guide

This document provides detailed instructions for deploying the henryreed.ai website to Firebase Hosting.

## Prerequisites

Before deploying, ensure you have:

1. **Node.js** installed (LTS version recommended)
2. **Firebase CLI** installed globally:
   ```bash
   npm install -g firebase-tools
   ```
3. **Firebase authentication** configured:
   ```bash
   firebase login
   ```

## Environment Setup

### Firebase Project Configuration

The project is configured to deploy to the `henryreedai` Firebase project:

- **Project ID**: `henryreedai` (defined in `.firebaserc`)
- **Hosting Public Directory**: `out/`
- **Build Output**: Static export from Next.js

### Next.js Configuration

The application is configured for static export with the following settings in `next.config.ts`:

```typescript
{
  output: 'export',                 // Static export mode
  trailingSlash: true,              // Match Firebase routing expectations
  distDir: 'out',                   // Output directory consumed by Firebase Hosting
  images: {
    unoptimized: true               // Required for static hosting
  },
  experimental: {
    webpackBuildWorker: true        // Enabled when NEXT_ENABLE_WEBPACK_EXPERIMENTS=1
  }
}
```

> **Tip:** The Webpack build worker experiment only activates when you run build commands with `NEXT_ENABLE_WEBPACK_EXPERIMENTS=1` (e.g. via `npm run build:exp`).

## Deployment Commands

### Option 1: One-Command Deploy (Recommended)

```bash
npm run deploy
```

This command:
1. Builds the Next.js application with the Webpack worker experiment (`npm run build:exp`)
2. Deploys to Firebase Hosting (`firebase deploy --only hosting`)

### Option 2: Manual Steps

1. **Build the application with the enhanced pipeline:**
   ```bash
   npm run build:exp
   ```

   This will:
   - Compile the Next.js application
   - Enable the optional Webpack build worker (`NEXT_ENABLE_WEBPACK_EXPERIMENTS=1`)
   - Generate static files in the `out/` directory
   - Optimize assets for production

2. **Deploy to Firebase Hosting:**
   ```bash
   firebase deploy --only hosting
   ```
   
   This will:
   - Upload files from the `out/` directory
   - Apply hosting configuration from `firebase.json`
   - Provide the live URL after deployment

### Option 3: Preview Deploy

For testing before going live:

```bash
npm run deploy:preview
```

This creates a preview channel that you can test before promoting to production.

## Verification Steps

After deployment, verify the following:

1. **Check the deployment URL** provided in the Firebase CLI output
2. **Test key pages** to ensure they load correctly
3. **Verify routing** works for all application routes
4. **Check browser console** for any errors
5. **Test on different devices/browsers**

## Environment-Specific Configurations

### Firebase Hosting Settings

The `firebase.json` file contains hosting-specific configurations:

```json
{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "cleanUrls": false,
    "trailingSlash": true
  }
}
```

### Cache Headers

The deployment includes optimized cache headers:

- **HTML files**: `Cache-Control: public, max-age=3600, s-maxage=3600` (1 hour)
- **JS/CSS files**: `Cache-Control: public, max-age=31536000, immutable` (1 year)
- **Images/Fonts**: `Cache-Control: public, max-age=31536000, immutable` (1 year)
- **Next.js static assets**: `Cache-Control: public, max-age=31536000, immutable` (1 year)

## Local Testing

Before deploying to production, you can test locally:

### 1. Test the Build

```bash
npm run build
```

Ensure the build completes without errors and check the `out/` directory.

### 2. Serve Locally with Firebase

```bash
npm run firebase:serve
```

This serves the built application using Firebase's local server, mimicking the production environment.

### 3. Use Firebase Emulators

```bash
npm run firebase:emulators
```

This starts the Firebase emulator suite for comprehensive local testing.

## Troubleshooting

### Common Issues and Solutions

#### Build Failures

**Problem**: Build fails with dependency errors
**Solution**: 
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Authentication Errors

**Problem**: `Error: Authentication Error`
**Solution**:
```bash
firebase logout
firebase login
firebase projects:list
```

#### Wrong Project Deployment

**Problem**: Deploying to the wrong Firebase project
**Solution**:
```bash
firebase use henryreedai
firebase deploy --only hosting
```

#### Cache Issues

**Problem**: Changes not visible after deployment
**Solution**:
- Clear browser cache
- Use incognito/private browsing mode
- Wait a few minutes for CDN propagation

#### Static Export Issues

**Problem**: Features not working in production
**Solution**: 
- Ensure code is compatible with static export
- Check Next.js static export limitations
- Verify no server-side only features are used

### Debug Commands

```bash
# Check current Firebase project
firebase projects:list
firebase use --list

# Check Firebase configuration
firebase hosting:sites:list

# View deployment history
firebase hosting:releases:list

# Check build output
ls -la out/

# Test local build
npm run firebase:serve
```

## Deployment Checklist

- [ ] All dependencies installed (`npm install`)
- [ ] Firebase CLI authenticated (`firebase login`)
- [ ] Correct project selected (`firebase use henryreedai`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Local testing completed (`npm run firebase:serve`)
- [ ] No build errors or warnings
- [ ] Deploy command executed (`npm run deploy`)
- [ ] Deployment URL tested and verified
- [ ] All routes working correctly
- [ ] No console errors in production

## Emergency Rollback

If a deployment needs to be rolled back:

1. **View release history:**
   ```bash
   firebase hosting:releases:list
   ```

2. **Rollback to previous version:**
   ```bash
   firebase hosting:releases:rollback
   ```

## Monitoring and Maintenance

### Regular Checks

- Monitor Firebase Hosting usage in the Firebase Console
- Check for any 404 errors or broken links
- Verify SSL certificate status
- Monitor performance metrics

### Updates

- Keep dependencies updated: `npm update`
- Update Firebase CLI: `npm update -g firebase-tools`
- Review and update caching strategies as needed
