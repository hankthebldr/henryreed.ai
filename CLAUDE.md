# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Cortex Domain Consultant Portal** - A professional POV (Proof of Value) management and customer engagement platform for Palo Alto Networks Domain Consultants. Built with Next.js 15 (static export) and deployed on Firebase Hosting.

**Tech Stack:** Next.js 15 + TypeScript + Tailwind, Firebase (Hosting + Firestore + Storage). A Cloud Functions backend (default + Genkit codebases) and PostgreSQL Data Connect exist in-repo but are **currently dormant** — see deployment state below.

**Live URL:** https://henryreedai.web.app

**Auth (Demo Mode):** `user1/paloalto1` (user) or `cortex/xsiam` (admin)

> ### ⚠️ Current Deployment State (read before deploying)
>
> The GCP backend was **shut down for cost on 2025-11-05** (see [GCP_SHUTDOWN_LOG.md](GCP_SHUTDOWN_LOG.md)). The app currently runs as a **client-only static site in mock/demo auth mode** — no live Functions, no Cloud SQL.
>
> - `firebase.json` deploys **only `hosting`, `firestore:rules`, and `storage:rules`**. Its `functions`, `dataconnect`, and `/api`·`/health`·`/genkit` rewrite blocks were **removed**.
> - The Functions source (`functions/`, `henryreedai/`) and Data Connect (`dataconnect/`) still live in the repo but are **not wired into deployment**. Treat them as reference/restore material, not running services.
> - **`./deploy.sh` is STALE** — it still runs `firebase deploy --only functions,…` and builds `functions`/`henryreedai`/`dataconnect`, which no longer match `firebase.json`. **Do not use it.** Deploy with `cd hosting && npm run deploy` (hosting only).
> - `firebase deploy --only functions:default` / `functions:genkit` will fail until the `functions` block is restored. Re-enabling steps are in [GCP_SHUTDOWN_LOG.md](GCP_SHUTDOWN_LOG.md).

---

## Common Commands

### Development
```bash
# Start dev server (from hosting directory)
cd hosting && npm run dev              # With Turbopack (recommended)
cd hosting && npm run dev:no-turbo     # Without Turbopack if issues occur

# Type checking
cd hosting && npm run type-check

# Linting
cd hosting && npm run lint
cd hosting && npm run lint:fix

# Branding guardrail — fails if legacy ORANGE tokens reappear (brand is Cortex GREEN).
# Checks for #ff6900, fa582d, e55a00, ff8533, and cortex-orange/* class tokens.
cd hosting && npm run lint:branding   # report violations (scripts/check-no-orange.js)
cd hosting && npm run fix:branding    # auto-replace orange → cortex tokens
```

### Testing
```bash
# From hosting directory
npm run test                  # Run Jest unit tests
npm run test:e2e              # Run Playwright E2E tests
npm run test:e2e:ui           # Run E2E with UI
npm run test:smoke            # Smoke tests only
npm run test:all              # All tests
npm run validate              # Full validation (type-check + lint + test)
```

### Build & Deploy
```bash
# Build static export → hosting/out (from hosting directory)
npm run build                 # Standard build
npm run build:exp             # Build with webpack experiments (used by deploy)

# Local Firebase testing (hosting emulator on :5005, Emulator UI on :4000)
npm run firebase:serve        # Hosting emulator only
npm run firebase:emulators    # Auth + Firestore + Storage + Hosting (NO functions emulator)

# Deploy (hosting only — see "Current Deployment State" above)
cd hosting && npm run deploy          # build:exp → firebase deploy --only hosting
cd hosting && npm run deploy:preview  # build:exp → deploy to a preview channel
```

> **Do NOT run `./deploy.sh`** — it is stale (deploys `functions`, builds `henryreedai`/`dataconnect`)
> and no longer matches `firebase.json`. `npm run deploy` is the only supported path right now.

---

## Architecture Overview

### Directory Structure

```
henryreed.ai/
├── hosting/                     # Next.js 15 Static Export Application
│   ├── app/                    # App Router (Next.js 15+)
│   │   ├── layout.tsx          # Root layout with auth/state providers
│   │   ├── page.tsx            # Landing/login page
│   │   ├── gui/                # Main application interface
│   │   ├── terminal/           # Terminal interface pages
│   │   ├── trr/                # TRR management pages
│   │   └── content/            # Content management pages
│   ├── components/             # React Components (70+ components)
│   │   ├── CortexGUIInterface.tsx      # Main dashboard
│   │   ├── POVManagement.tsx           # POV project management
│   │   ├── TRRManagement.tsx           # Technical requirements
│   │   ├── EnhancedAIAssistant.tsx     # AI chat interface
│   │   └── terminal/                   # Terminal components
│   ├── lib/                    # Core Libraries & Business Logic
│   │   ├── commands.tsx        # Basic terminal commands (help, ls, whoami)
│   │   ├── pov-commands.tsx    # POV lifecycle commands
│   │   ├── scenario-commands.tsx # Security scenario management
│   │   ├── detect-commands.tsx # Detection testing
│   │   ├── monitor-commands.tsx # Monitoring
│   │   ├── cloud-functions-api.ts # GCP Functions integration
│   │   ├── scenario-types.ts   # TypeScript type definitions
│   │   └── auth/               # Authentication logic
│   ├── contexts/               # React Context Providers
│   ├── hooks/                  # Custom React Hooks
│   │   └── useCommandExecutor.ts # GUI→Terminal command executor
│   ├── next.config.ts          # Next.js static export config
│   └── package.json
├── functions/                  # Default Cloud Functions (Node 20)
│   ├── src/
│   │   ├── index.ts           # Functions entry point
│   │   ├── handlers/          # TRR, analytics, export handlers
│   │   ├── ai/                # AI integration logic
│   │   └── routes/            # API routes
│   └── package.json
├── henryreedai/               # Genkit AI Functions (Node 20)
│   ├── src/
│   │   ├── genkit-sample.ts  # Genkit AI flows
│   │   └── gemini.ts         # Google Gemini integration
│   └── package.json
├── dataconnect/              # PostgreSQL Data Connect
│   ├── schema/               # Database schema (GraphQL SDL)
│   ├── dataconnect.yaml      # Data Connect config
│   └── example/              # Connectors
├── firebase.json             # Firebase project config (2 codebases)
└── deploy.sh                # Automated deployment script
```

### Key Architectural Patterns

#### 1. **Static Export to Firebase Hosting**
- **Build Output:** `hosting/out/` → Deployed to Firebase Hosting CDN
- **Routing:** All routes rewrite to `/index.html` for SPA behavior (configured in `firebase.json`)
- **No SSR:** Purely client-side React app (no server-side rendering or API routes)
- **Images:** Unoptimized (`images.unoptimized: true` in `next.config.ts`)

#### 2. **Dual Cloud Functions Architecture (DORMANT — not currently deployed)**
> These functions are **not live** post-shutdown (see "Current Deployment State"). The source is retained for reference and future restore. The frontend tolerates their absence (mock/demo data paths).
- **Default Codebase** (`functions/`): TRR management, analytics, data exports, BigQuery, scenario orchestration, playbooks, XSIAM sync, "Badass Blueprint" generation. Entry: `functions/src/index.ts` (Express `api` + many `onCall`/trigger functions).
- **Genkit Codebase** (`henryreedai/`): Google Genkit AI flows, Gemini chat, POV analysis
- Both target **Node.js 20**
- When live, deployed independently: `firebase deploy --only functions:default` or `functions:genkit` (requires restoring the `functions` block in `firebase.json` first)

#### 3. **Single Terminal Command System**
All terminal commands route through a unified command registry:
- **Command Definition Pattern:**
  ```typescript
  interface CommandConfig {
    name: string;
    description: string;
    usage: string;
    aliases?: string[];
    permissions?: string[];  // RBAC permissions (e.g., 'terminal.user_commands')
    handler: (args: string[]) => React.ReactNode | Promise<React.ReactNode>;
  }
  ```
- **Command Files:** ~22 `lib/*-commands.tsx` files (commands, pov-commands, enhanced-pov-commands, scenario-commands, detect-commands, monitor-commands, cdr-commands, cortex-dc-commands, playbook-commands, xsiam-commands, bigquery-commands, gemini-commands, etc.)
- **Aggregation (important):** individual command files are imported and merged in **`lib/commands-ext.tsx`** (`allCommands`), which feeds **`lib/command-registry.ts`** (the categorized master registry with search). A runtime inventory is also exposed on `globalThis.__ALL_COMMANDS__`. **To register a new command, define it in a `*-commands.tsx` file AND import/spread it into `commands-ext.tsx`** — adding it to a command file alone is not enough.
- **GUI Integration:** Components use `useCommandExecutor` hook to trigger terminal commands from buttons
- **History & State:** Shared command history and output state across GUI and terminal interfaces

#### 4. **GUI → Terminal Command Execution**
Use the `useCommandExecutor` hook in any component to execute terminal commands:
```typescript
import { useCommandExecutor } from '../hooks/useCommandExecutor';

const { run: executeCommand, isRunning, error } = useCommandExecutor();

// Execute command with options
executeCommand('pov create "Acme Corp" --template technical-deep-dive', {
  openTerminal: true,          // Show terminal panel
  focus: true,                 // Focus terminal input
  trackActivity: {             // Telemetry tracking
    event: 'pov-create-click',
    source: 'pov-management',
    payload: { template: 'technical-deep-dive' }
  },
  onSuccess: () => showNotification('POV created successfully'),
  onError: (err) => handleError(err)
});
```

#### 5. **Firebase Services Integration**
- **Firestore:** Real-time database with security rules (`firestore.rules`)
- **Authentication:** Mock auth mode for development (email/password in production roadmap)
- **Storage:** Secure file uploads with user isolation (`storage.rules`)
- **Data Connect:** PostgreSQL with GraphQL schema (Cloud SQL instance `henryreedai-fdc`)

#### 6. **Role-Based Access Control (RBAC)**
- **Roles:** `admin`, `user`, `viewer`
- **Permission System:** Commands check `permissions` array (e.g., `['terminal.user_commands']`)
- **Middleware:** `lib/rbac-middleware.ts` enforces role-based access
- **Testing:** Use `lib/rbac-testing-utils.ts` for RBAC testing

#### 7. **Shared Component Library & Page Standardization**
There is an ongoing effort to route all pages through a shared design-system layer. **Prefer these over bespoke markup when building or modifying a page.**
- **Location:** `hosting/components/shared/` (exports in `index.ts`): `PageContainer`, `SectionCard`, `StandardButton`, `StandardBadge`, `StandardInput` (from `PageContainer.tsx`), plus `StatusBadge`. Also `ResourceCard`, `ListLayout`, `DetailLayout`, `UnifiedFilterBar`, `BusinessValueCard`.
- **Styling:** `cn()` className merge helper in `lib/utils.ts` (clsx + tailwind-merge). Theme is **token-driven** via `tailwind.config.js` — use `cortex-*` tokens (e.g. `bg-cortex-surface`, `text-cortex-text-primary`, `cortex-green`) backed by `--cortex-*` CSS variables. **Never hardcode hex colors, and never reintroduce orange** (enforced by `npm run lint:branding`).
- **Guides:** `hosting/docs/PAGE_STANDARDIZATION_GUIDE.md`, `hosting/docs/PAGE_TEMPLATE.tsx` (copy-paste page skeleton), `hosting/docs/MIGRATION_CHECKLIST.md`. Not all pages are migrated yet — match the standardized pattern when touching one.

---

## Core Feature Modules

### 1. POV (Proof of Value) Management
**Commands:** `pov init`, `pov create`, `pov status`, `pov add-scenario`, `pov report`
**Components:** `POVManagement.tsx`, `lib/pov-commands.tsx`
**Key Features:**
- Template-based POV initialization (technical-deep-dive, executive-overview, etc.)
- Milestone tracking with visual timelines
- Scenario integration (link security scenarios to POV projects)
- Report generation (executive summaries, technical reports)

### 2. TRR (Technical Requirements Review)
**Commands:** Enhanced TRR commands in `lib/enhanced-trr-commands.tsx`
**Components:** `TRRManagement.tsx`, `DORSDWFormCapture.tsx`
**Cloud Functions:** `functions/src/handlers/` (TRR CRUD, CSV import/export)
**Key Features:**
- Interactive TRR forms with validation
- CSV bulk import/export
- Solution Design Workbook (SDW) integration
- Workflow automation and approval tracking

### 3. Security Scenario Engine
**Commands:** `scenario generate`, `scenario deploy`, `scenario validate`, `scenario export`, `scenario destroy`
**Files:** `lib/scenario-commands.tsx`, `lib/scenario-types.ts`
**Key Features:**
- **Scenario Types:** cloud-posture, container-vuln, insider-threat, ransomware, code-vuln, etc.
- **Provider Support:** GCP, AWS, Azure, Kubernetes, local environments
- **Lifecycle Management:** Full deployment lifecycle automation
- **POV Integration:** Map scenarios to active POV projects via `lib/scenario-pov-map.ts`

### 4. AI Assistant (Google Genkit)
**Functions:** `henryreedai/src/genkit-sample.ts`
**Components:** `EnhancedAIAssistant.tsx`
**Commands:** `lib/gemini-commands.tsx`
**Key Features:**
- POV analysis (risk assessment, success factors, strategic recommendations)
- TRR automation (implementation guidance, technical validation)
- Detection generation (MITRE ATT&CK mapping, security rules)
- Chat assistant (domain expert for real-time Q&A)

### 5. Platform Health Monitoring
**Commands:** `monitor start`, `monitor status`, `metrics dashboard`
**Components:** `PlatformHealthMonitor.tsx`
**Key Features:**
- Real-time Cortex/XSIAM platform health monitoring
- Demo environment management
- Performance metrics and alerting
- Integration status tracking

---

## Development Workflows

### Adding a New Terminal Command

1. **Choose appropriate command file:**
   - Basic commands → `lib/commands.tsx`
   - POV-related → `lib/pov-commands.tsx`
   - Scenarios → `lib/scenario-commands.tsx`
   - Detection → `lib/detect-commands.tsx`
   - Monitoring → `lib/monitor-commands.tsx`

2. **Define command:**
   ```typescript
   const myCommand: CommandConfig = {
     name: 'mycommand',
     description: 'Does something useful',
     usage: 'mycommand [options] <args>',
     aliases: ['mc'],
     permissions: ['terminal.user_commands'],  // RBAC
     handler: async (args: string[]) => {
       // Command logic here
       return <div className="text-green-300">Success!</div>;
     }
   };
   ```

3. **Add to the command configs array** in that file, **then import/spread it into `lib/commands-ext.tsx`** so it's registered (a command defined but not aggregated there won't appear).

4. **Test:** `cd hosting && npm run dev`

### Adding GUI Integration for Command

1. **Import hook in component:**
   ```typescript
   import { useCommandExecutor } from '../hooks/useCommandExecutor';
   ```

2. **Use hook:**
   ```typescript
   const { run: executeCommand, isRunning } = useCommandExecutor();
   ```

3. **Trigger from button:**
   ```typescript
   <button
     disabled={isRunning}
     onClick={() => executeCommand('mycommand arg1 arg2', {
       openTerminal: true,
       trackActivity: { event: 'mycommand-click', source: 'my-component' }
     })}
   >
     {isRunning ? 'Running...' : 'Run Command'}
   </button>
   ```

### Local Development with Firebase Emulators

```bash
# Terminal 1: Start emulators (from project root)
cd hosting && npm run firebase:emulators

# Terminal 2: Start Next.js dev server
cd hosting && npm run dev

# Access (ports per firebase.json):
# - App (Next dev):  http://localhost:3000
# - Emulator UI:     http://localhost:4000
# - Hosting emulator: http://localhost:5005
# - Firestore:       localhost:8080
# - Auth:            localhost:9099
# - Storage:         localhost:9199
# (No functions emulator — functions are not part of the current firebase.json)
```

### Testing Cloud Functions Locally

```bash
# Default functions
cd functions
npm run serve          # Start functions emulator

# Genkit AI functions
cd henryreedai
npm run serve          # Start Genkit functions emulator
```

### Deploy Workflow

1. **Test locally:**
   ```bash
   cd hosting && npm run build && npm run firebase:serve
   ```

2. **Preview deployment (optional):**
   ```bash
   cd hosting && npm run deploy:preview
   ```

3. **Production deployment (hosting only):**
   ```bash
   cd hosting && npm run deploy   # build:exp → firebase deploy --only hosting
   ```
   Do **not** use `./deploy.sh` (stale — see "Current Deployment State").

4. **Functions deployment:** N/A while the backend is dormant. To restore, follow the
   re-enabling steps in [GCP_SHUTDOWN_LOG.md](GCP_SHUTDOWN_LOG.md) (re-add the `functions`
   block to `firebase.json` first), then `firebase deploy --only functions:default|genkit`.

---

## Important Configuration Notes

### Static Export Requirements (next.config.ts)
- **`output: 'export'`** - Required for Firebase Hosting
- **`trailingSlash: true`** - Firebase compatibility
- **`images: { unoptimized: true }`** - No Next.js Image Optimization
- **No API Routes** - Use Cloud Functions instead
- **No Server Components** - Client-side only

### Firebase Hosting Configuration (firebase.json)
- **Public directory:** `hosting/out`
- **Rewrites:** All routes (`**`) → `/index.html` for SPA routing
- **Cache headers:**
  - Static assets (JS/CSS/images): 1 year (`max-age=31536000`)
  - HTML: 5 minutes (`max-age=300`)
  - JSON: 5 minutes with stale-while-revalidate
- **Security headers:** CSP, X-Frame-Options, HSTS, etc.

### Dual Functions Codebase
- **Default codebase:** `functions/` (TRR, analytics, exports)
- **Genkit codebase:** `henryreedai/` (AI flows, Gemini chat)
- Both use **Node.js 20**
- Predeploy hooks: `npm ci && npm run build`
- Deploy separately: `--only functions:default` or `--only functions:genkit`

### Data Connect (PostgreSQL)
- **Instance:** Cloud SQL `henryreedai-fdc` (us-east1)
- **Database:** `fdcdb`
- **Schema:** GraphQL SDL in `dataconnect/schema/`
- **Schema Validation:** STRICT mode (Postgres must match Data Connect schema exactly)
- **Generated Client:** `@dataconnect/generated` (auto-generated, do not edit)

---

## TypeScript & Code Patterns

### Command Handler Patterns

**Synchronous:**
```typescript
handler: (args) => {
  return <div>Immediate response</div>;
}
```

**Asynchronous:**
```typescript
handler: async (args) => {
  const result = await someOperation();
  return <div>{result}</div>;
}
```

### Component Patterns

**Use React.memo for performance:**
```typescript
export const MyComponent = React.memo(({ prop1, prop2 }: Props) => {
  // Component logic
});
```

**Context usage:**
```typescript
import { useAppState } from '../contexts/AppStateContext';
import { useAuth } from '../contexts/AuthContext';

const { user, povProjects } = useAppState();
const { isAdmin } = useAuth();
```

### RBAC Permission Checking

```typescript
import { useAuth } from '../contexts/AuthContext';

const { hasPermission } = useAuth();

if (hasPermission('terminal.admin_commands')) {
  // Admin-only logic
}
```

---

## Testing & Validation

### Run Full Validation Suite
```bash
cd hosting
npm run validate  # type-check + lint + test:all
```

### Test Individual Suites
```bash
npm run test              # Jest unit tests
npm run test:watch        # Jest watch mode
npm run test:e2e          # Playwright E2E
npm run test:e2e:ui       # Playwright with UI
npm run test:smoke        # Smoke tests (@smoke tag)
```

### RBAC Testing
```bash
# Use lib/rbac-testing-utils.ts
import { testRBACPermissions } from '../lib/rbac-testing-utils';
```

---

## External Integrations

### Google Cloud Functions API
- **Client:** `lib/cloud-functions-api.ts`
- **Endpoint:** Configured per environment (production/emulator)
- **Authentication:** Service account for backend operations

### Firebase Storage
- **Uploads:** User-isolated buckets
- **Downloads:** Resource templates, scenario exports
- **Rules:** `storage.rules` for security

### BigQuery
- **Service:** `lib/bigquery-service.ts`
- **Commands:** `lib/bigquery-commands.tsx`
- **Features:** Data export, analytics, usage tracking

### XSIAM/Cortex Platform
- **API Client:** `lib/xsiam-api-service.ts`
- **Commands:** `lib/xsiam-commands.tsx`
- **Features:** Real-time health monitoring, demo environment management

---

## Common Pitfalls & Solutions

### Issue: "Window is not defined" errors
**Solution:** Wrap client-side code in `useEffect` or check `typeof window !== 'undefined'`

### Issue: Image optimization errors during build
**Solution:** Already configured with `images: { unoptimized: true }` in `next.config.ts`

### Issue: Routing not working after Firebase deployment
**Solution:** Ensure `trailingSlash: true` in `next.config.ts` and rewrites in `firebase.json`

### Issue: Functions / API calls fail (404, network error) locally or in prod
**Expected:** The Functions backend is dormant (see "Current Deployment State"). The app is designed to run client-only with mock/demo data — calls to `lib/cloud-functions-api.ts` endpoints will not resolve. Don't "fix" this by chasing the network error; the backend is intentionally offline. Restore via [GCP_SHUTDOWN_LOG.md](GCP_SHUTDOWN_LOG.md) if real backend behavior is needed.

### Issue: Data Connect schema validation errors
**Solution:** Data Connect uses STRICT validation. Ensure Postgres schema exactly matches `dataconnect/schema/`

### Issue: RBAC permissions not working
**Solution:** Check user role in AuthContext and command `permissions` array

---

## Performance Optimization

### Build Performance
- **Turbopack:** Use `npm run dev` (with Turbopack) for faster dev builds
- **Webpack Experiments:** Use `npm run build:exp` for production builds with experimental features
- **Code Splitting:** Configured in `next.config.ts` (vendor, commands, common chunks)

### Runtime Performance
- **CDN Caching:** 1-year cache for static assets, 5-minute for HTML
- **Component Memoization:** Use `React.memo` for components that re-render frequently
- **Lazy Loading:** Dynamic imports for large components
- **State Management:** Context providers wrapped in memoized components

---

## Additional Resources

> The repo root has 50+ status/summary `.md` files — most are point-in-time snapshots. The high-value, current ones:

- **GCP_SHUTDOWN_LOG.md** — what was torn down on 2025-11-05 and exact re-enable steps (read before any backend work)
- **hosting/docs/PAGE_STANDARDIZATION_GUIDE.md** + **STANDARDIZATION_SUMMARY.md** — shared component library & page patterns
- **RBAC_TESTING_GUIDE.md** — role-based access control testing procedures
- **WARP.md** — extended development workflows and terminal integration details
- **FIREBASE_CONFIGURATION_SUMMARY.md** — GCP service configuration (describes the pre-shutdown topology)
- **AGENTS.md** — cross-tool agent instructions for this repo
- **README.md** — user-facing feature overview
