# henryreed.ai

A Next.js-based website for henryreed.ai, configured for static export and Firebase Hosting deployment.

## Development

### Prerequisites
- Node.js (latest LTS version recommended)
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)

### Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Quick Deploy

For a complete build and deployment:
```bash
npm run deploy
```

### Manual Deployment Steps

1. **Build the application:**
   ```bash
   npm run build
   ```
   This creates an optimized static export in the `out/` directory.

2. **Deploy to Firebase Hosting:**
   ```bash
   firebase deploy --only hosting
   ```

### Preview Deployments

To create a preview deployment for testing:
```bash
npm run deploy:preview
```

## Environment Configuration

### Firebase Configuration
- **Project ID:** `henryreedai` (configured in `.firebaserc`)
- **Public Directory:** `out/` (static export output)
- **Hosting Configuration:** See `firebase.json`

### Next.js Configuration
- **Output:** Static export (`output: 'export'`)
- **Build Directory:** `out/`
- **Images:** Unoptimized for static hosting
- **Trailing Slash:** Enabled for Firebase Hosting compatibility

### Cache Configuration
The Firebase hosting configuration includes optimized caching headers:
- **HTML files:** 1 hour cache
- **Static assets (JS/CSS):** 1 year cache with immutable flag
- **Images and fonts:** 1 year cache with immutable flag
- **Next.js static files:** 1 year cache with immutable flag

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build and export the application
- `npm start` - Start production server (not used in static deployment)
- `npm run deploy` - Build and deploy to Firebase Hosting
- `npm run deploy:preview` - Build and deploy to a preview channel
- `npm run firebase:serve` - Serve the built application locally using Firebase
- `npm run firebase:emulators` - Start Firebase emulators for local testing

## Deployment Checklist

- [ ] Ensure Firebase CLI is installed and authenticated
- [ ] Verify project configuration in `.firebaserc`
- [ ] Run `npm run build` to test local build
- [ ] Test locally with `npm run firebase:serve`
- [ ] Deploy with `npm run deploy` or `firebase deploy --only hosting`
- [ ] Verify deployment at the Firebase Hosting URL

## Troubleshooting

### Common Issues

1. **Build Errors:** Ensure all dependencies are installed with `npm install`
2. **Firebase Auth:** Run `firebase login` if deployment fails with authentication errors
3. **Project Selection:** Verify correct project with `firebase use --list`
4. **Cache Issues:** Clear browser cache or use incognito mode to test deployments

### Environment-Specific Notes

- **Static Export:** This project uses Next.js static export, so server-side features are not available
- **Image Optimization:** Images are unoptimized due to static hosting requirements
- **Routing:** Client-side routing is handled via Firebase rewrites to `/index.html`
