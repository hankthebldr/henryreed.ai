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
The application uses a **single-terminal approach** for unified command execution across all interfaces:

1. **ImprovedTerminal.tsx** (Single Canonical Terminal) - Comprehensive POV-focused terminal with full command set
2. **TerminalHost.tsx** - Lightweight wrapper that manages the single terminal instance
3. **Single Terminal Instance** - All GUI commands route through the same terminal for consistency

**Single Terminal Benefits:**
- Unified command history across GUI and terminal interfaces  
- Consistent command execution and output formatting
- Shared state management between interfaces
- Simplified debugging and troubleshooting
- Better user experience with context preservation

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

### GUI Command Execution Hook
**`hooks/useCommandExecutor.ts`** - Standardized hook for GUI-to-terminal command execution

```typescript
const { run: executeCommand, isRunning, error } = useCommandExecutor();

// Execute command with full options
executeCommand('scenario generate --type cloud-posture', {
  openTerminal: true,  // Open terminal panel
  focus: true,         // Focus terminal input
  trackActivity: {     // Telemetry tracking
    event: 'scenario-deploy-click',
    source: 'unified-creator', 
    payload: { scenarioKey, provider }
  },
  onStart: () => setLoading(true),
  onSuccess: () => setLoading(false),
  onError: (err) => handleError(err)
});
```

**Key Features:**
- Unified command execution across all GUI components
- Automatic loading state management (`isRunning`)
- Built-in telemetry integration with `userActivityService`
- Error handling with user notifications
- Terminal focus management and UX polish
- Success notifications with "View in Terminal" links

### Command Module Organization
- **`lib/commands.tsx`** - Core commands (help, ls, whoami, contact)
- **`lib/commands-ext.tsx`** - Extended commands for specific features
- **`lib/scenario-commands.tsx`** - Security scenario management
- **`lib/pov-commands.tsx`** - POV (Proof of Value) project management
- **`lib/detect-commands.tsx`** - Detection testing and validation
- **`lib/monitor-commands.tsx`** - Real-time monitoring and analysis
- **`lib/download-commands.tsx`** - Resource download functionality
- **`lib/scenario-types.ts`** - TypeScript definitions for scenario system

### Scenario Management System
Comprehensive security assessment framework with:
- **Scenario Types**: cloud-posture, container-vuln, code-vuln, insider-threat, ransomware, etc.
- **Provider Support**: GCP, AWS, Azure, Kubernetes, local
- **Deployment Lifecycle**: generate → deploy → validate → export → destroy
- **Templates**: Pre-built scenarios for common security testing patterns

### POV Integration System
**Dynamic POV Integration** (`lib/scenario-pov-map.ts`) provides intelligent scenario-to-POV mapping:

```typescript
// Get context-aware POV commands for any scenario
const povCommands = getPovIntegrationCommands({
  scenarioKey: 'ransomware',
  provider: 'aws',
  hasActivePov: false,
  customerName: 'Acme Corp'
});

// Results in dynamic buttons based on POV state:
// - No active POV: "New POV from Scenario" 
// - Active POV: "Add to Current POV"
```

**POV Command Examples:**
- `pov init "Customer Name" --template technical-deep-dive --scenarios ransomware`
- `pov add-scenario --scenario cloud-posture`
- `pov status --current --detailed`
- `pov report --format executive --export pdf`

### New Command Categories

**Detection Testing Commands:**
- `detect test --scenario [scenario] --all-rules` - Comprehensive detection validation
- `detect scan-images --registry all --severity high` - Container vulnerability scanning
- `mitre validate --techniques T1078,T1110 --coverage-report` - MITRE ATT&CK validation

**Monitoring Commands:**
- `monitor start --scenario [scenario] --real-time --alerts` - Real-time monitoring
- `monitor status --scenario [scenario]` - Check monitoring status
- `metrics dashboard --scenario [scenario] --kpi-view` - Performance metrics

**POV Management Commands:**
- `pov init --interactive` - Interactive POV creation wizard
- `pov create "Customer" --template [template]` - Create new POV project
- `pov timeline --scenario [scenario]` - Project timeline management
- `pov demo-setup --scenario [scenario] --safe-mode` - Demo environment setup

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
     permissions: ['terminal.user_commands'], // Role-based access
     handler: async (args: string[]) => {
       // Implementation here
       return <div>Command output</div>;
     }
   };
   ```

2. **Add to Command Configs Array:**
   - For basic commands: Add to `lib/commands.tsx`
   - For POV commands: Add to `lib/pov-commands.tsx`
   - For detection: Add to `lib/detect-commands.tsx`
   - For monitoring: Add to `lib/monitor-commands.tsx`
   - For scenario-related: Add to `lib/scenario-commands.tsx`

3. **Test Locally:**
   ```bash
   cd hosting
   npm run dev
   ```

### Adding GUI Command Integration
1. **Import the Hook:**
   ```typescript
   import { useCommandExecutor } from '../hooks/useCommandExecutor';
   
   const { run: executeCommand, isRunning } = useCommandExecutor();
   ```

2. **Create Button with Command Execution:**
   ```typescript
   <CortexButton
     variant="primary"
     icon="🚀"
     loading={isRunning}
     ariaLabel="Deploy cloud security scenario"
     onClick={() => {
       executeCommand('scenario generate --type cloud-posture', {
         trackActivity: {
           event: 'scenario-deploy-click',
           source: 'my-component',
           payload: { scenarioType: 'cloud-posture' }
         }
       });
     }}
   >
     Deploy Scenario
   </CortexButton>
   ```

3. **Telemetry Integration:**
   - All commands executed via `useCommandExecutor` automatically track telemetry
   - Use standardized event names: `[component]-[action]-click`
   - Include relevant payload data for analytics

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
