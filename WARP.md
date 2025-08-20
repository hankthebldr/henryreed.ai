# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common Development Commands

### Development Server
```bash
cd hosting
npm run dev
```
Start the Next.js development server with Turbopack on http://localhost:3000

### Build and Export
```bash
cd hosting
npm run build
```
Build and export the static site to `hosting/out/` directory for Firebase deployment

### Deploy to Firebase Hosting
```bash
# Quick deploy (from root directory)
./deploy.sh

# Or manually from hosting directory
npm run deploy
```

### Local Testing with Firebase
```bash
cd hosting
npm run firebase:serve
```
Serve the built application locally using Firebase hosting emulator

### Preview Deployment
```bash
cd hosting
npm run deploy:preview
```
Deploy to a Firebase preview channel for testing changes

### Firebase Emulators
```bash
cd hosting
npm run firebase:emulators
```
Start Firebase emulators for local development and testing

## High-Level Architecture

### Next.js Static Export Configuration
- **Output**: Static export (`output: 'export'`) configured in `next.config.ts`
- **Build Directory**: `hosting/out/` for Firebase hosting
- **Images**: Unoptimized for static hosting compatibility
- **Routing**: Client-side routing handled via Firebase rewrites to `/index.html`

### Terminal Component Architecture
The application features a sophisticated terminal interface with three implementations:

1. **ImprovedTerminal.tsx** (Currently Active) - Proof of Value-focused terminal with comprehensive command set
2. **EnhancedTerminal.tsx** - Security operations focused variant
3. **Terminal.tsx** - Basic terminal implementation

### Command System Architecture
```typescript
interface CommandConfig {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
  handler: (args: string[]) => React.ReactNode | Promise<React.ReactNode>;
}
```

**Key Features:**
- Support for both synchronous and asynchronous command handlers
- Multi-word command parsing (e.g., "getting started")
- Alias resolution system for improved UX
- Tab completion and command history
- Loading states for async operations

### Command Module Organization
- **`lib/commands.tsx`** - Core commands (help, ls, whoami, contact)
- **`lib/commands-ext.tsx`** - Extended commands for specific features
- **`lib/scenario-commands.tsx`** - Security scenario management
- **`lib/download-commands.tsx`** - Resource download functionality
- **`lib/scenario-types.ts`** - TypeScript definitions for scenario system

### Scenario Management System
Comprehensive security assessment framework with:
- **Scenario Types**: cloud-posture, container-vuln, code-vuln, insider-threat, ransomware, etc.
- **Provider Support**: GCP, AWS, Azure, Kubernetes, local
- **Deployment Lifecycle**: generate → deploy → validate → export → destroy
- **Templates**: Pre-built scenarios for common security testing patterns

### External Integrations
- **Google Cloud Functions** - Backend API for scenario deployment
- **Firebase Storage** - Resource and template downloads
- **Service Account Authentication** - Secure GCP access
- **Calendar System** (cal.com) - Meeting scheduling
- **GitHub Repository** - CDR platform integration

## Key Configuration Files

### `next.config.ts`
```typescript
const nextConfig: NextConfig = {
  output: 'export',        // Static site generation
  trailingSlash: true,     // Firebase hosting compatibility
  distDir: 'out',          // Build output directory
  images: { unoptimized: true }  // Required for static hosting
}
```

### `firebase.json` (Root)
Configures Firebase hosting with:
- Public directory: `hosting/out`
- Rewrites for client-side routing
- Cache headers for static assets (1 year for JS/CSS, 1 hour for HTML)

### `deploy.sh`
Automated deployment script that:
1. Navigates to `hosting/` directory
2. Runs `npm run build`
3. Returns to root and runs `firebase deploy --only hosting`

## Development Workflows

### Adding New Terminal Commands
1. **Define Command Configuration:**
   ```typescript
   const newCommand: CommandConfig = {
     name: 'mycommand',
     description: 'Description of command functionality',
     usage: 'mycommand [options]',
     aliases: ['mc', 'cmd'],
     handler: async (args: string[]) => {
       // Implementation here
       return <div>Command output</div>;
     }
   };
   ```

2. **Add to Command Configs Array:**
   - For basic commands: Add to `lib/commands.tsx`
   - For specialized features: Add to appropriate module or create new one
   - For scenario-related: Add to `lib/scenario-commands.tsx`

3. **Test Locally:**
   ```bash
   cd hosting
   npm run dev
   ```

### Local Development with Firebase
1. **Build the Application:**
   ```bash
   cd hosting
   npm run build
   ```

2. **Test with Firebase Emulator:**
   ```bash
   npm run firebase:serve
   ```

3. **Verify Routing:** Ensure client-side routing works correctly with Firebase rewrites

### Preview Deployment Workflow
1. **Create Preview:**
   ```bash
   cd hosting
   npm run deploy:preview
   ```

2. **Test Preview URL:** Firebase provides temporary URL for testing

3. **Deploy to Production:**
   ```bash
   npm run deploy
   # or from root: ./deploy.sh
   ```

### Command Handler Patterns

**Synchronous Commands:**
```typescript
handler: (args) => {
  return <div className="text-blue-300">Immediate response</div>;
}
```

**Asynchronous Commands:**
```typescript
handler: async (args) => {
  // Show loading state automatically
  const result = await someAsyncOperation();
  return <div className="text-green-300">{result}</div>;
}
```

## Important Development Notes

### Static Export Limitations
- **No Server-Side Rendering**: Application runs purely client-side
- **No API Routes**: Use external APIs (Google Cloud Functions)
- **No Image Optimization**: Images must be unoptimized
- **No Incremental Static Regeneration**: Full rebuild required for changes

### Firebase Hosting Specifics
- **Cache Strategy**: Long-term caching for assets, short-term for HTML
- **Rewrites Configuration**: All routes redirect to `/index.html` for SPA behavior
- **Preview Channels**: Use for testing before production deployment
- **Deployment Target**: Static files only, no server-side execution

### TypeScript Configuration
- **Strict Mode**: Enabled for type safety
- **Command Interfaces**: All commands must implement `CommandConfig`
- **Async Handling**: Proper typing for Promise-based command handlers
- **Component Props**: Strict typing for React components

### Development Environment Setup
1. **Prerequisites:**
   - Node.js (Latest LTS)
   - Firebase CLI (`npm install -g firebase-tools`)
   - Git for version control

2. **Initial Setup:**
   ```bash
   git clone [repository]
   cd henryreed.ai/hosting
   npm install
   firebase login  # if deploying
   ```

3. **Environment Variables:**
   - Check `.env.example` in hosting directory
   - Configure Firebase project settings in `.firebaserc`
