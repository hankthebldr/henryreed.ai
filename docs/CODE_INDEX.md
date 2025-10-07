# Code Index (Feature → Layers → Files)

Use this as a precise map to reconstruct features in a new repo. Pair with INVENTORY.md and GRAPHS.md.

Conventions
- Feature buckets: Domain Consultant, POV, TRR, Scenario Engine, Content Hub, XSIAM, BigQuery, Terminal, Infra
- Layers: routes, components, libs, commands, functions, docs, tests, configs
- Build/deploy acceptance: `firebase deploy` succeeds; all services functional; static export only

1) Domain Consultant
- components
  - hosting/components/DomainConsultantWorkspace.tsx — DC dashboard (stats, quick actions)
  - hosting/components/ManagementDashboard.tsx — management panels
- libs
  - hosting/lib/user-management.ts — demo user store, roles/permissions
  - hosting/lib/user-activity-service.ts — timeline/events tracking
- routes
  - hosting/app/gui/page.tsx — GUI entry (AuthGuard, ActivityProvider)
- docs
  - hosting/docs/domain-consultant-guide.md, hosting/docs/gui-user-flows.md

2) POV Management
- components
  - hosting/components/POVProjectManagement.tsx — POV lifecycle UI (dashboard/create/manage/templates/analytics)
- libs
  - hosting/lib/pov-commands.tsx — CLI for pov init/list/configure/execute/status/report/cleanup/metrics/templates
  - hosting/lib/enhanced-pov-commands.tsx — enriched terminal POV flows
  - hosting/lib/project-commands.tsx — broader project commands (ctxpov etc.)
  - hosting/lib/dc-api-client.ts — client calls for POV/project resources
  - hosting/lib/dc-context-store.ts — POV/customer context store
  - hosting/lib/dc-ai-client.ts — AI helper for workflows
- docs
  - hosting/docs/POV_CONSULTANT_GUIDE.md, hosting/docs/POV_OPTIMIZATION_ANALYSIS.md, hosting/COMMAND_REFERENCE_POV.md

3) TRR Management
- components
  - hosting/components/TRRManagement.tsx — TRR CRUD + validation flows (forms, filters, grids)
  - hosting/components/ProductionTRRManagement.tsx — expanded production view
  - hosting/components/TRRProgressChart.tsx — progress visualization
- libs/types
  - hosting/lib/enhanced-trr-commands.tsx — TRR terminal features (CSV import, validation, status)
  - hosting/lib/trr-blockchain-signoff.tsx — signoff flow stubs (modular)
  - hosting/types/trr.ts, hosting/types/trr-extended.ts — typing for TRR domain
- docs
  - TRR_MANAGEMENT_OPTIMIZATION_SUMMARY.md (root), hosting/docs/trr-optimization-summary.md

4) Scenario Engine
- components
  - hosting/components/ScenarioEngine.tsx — blueprint UX, execution monitor, analytics
- libs
  - hosting/lib/scenario-engine.ts — client-side engine, lifecycle control
  - hosting/lib/scenario-engine-client.ts — client abstraction
  - hosting/lib/scenario-types.ts — ScenarioType/Provider/Template configs and manifests
  - hosting/lib/scenario-commands.tsx, hosting/lib/scenario-command-wrapper.tsx — terminal API
  - hosting/lib/cloud-functions-api.ts — deploy/status/validate/destroy (HTTP callable or simulate)
- functions
  - functions/src/index.ts — CF entrypoints (aiTrrSuggest, generateThreatActorScenario, executeScenario, controlScenarioExecution, generateDetectionQueries, api)
  - functions/src/handlers/scenario-orchestration.ts — generate/execute/control/query
  - functions/src/handlers/scenario-executor.ts — background processing, Firestore integration
- docs
  - COMPREHENSIVE_SCENARIO_ENGINE.md, scenario-management-schema-documentation.md

5) Content Hub
- components
  - hosting/components/EnhancedContentCreator.tsx, hosting/components/UnifiedContentCreator.tsx
  - hosting/components/ContentCreatorManager.tsx, hosting/components/ContentLibrary.tsx, hosting/components/ConsolidatedContentLibrary.tsx
  - hosting/components/ContentAnalytics.tsx
- libs
  - hosting/lib/content-library-service.ts — content data model, filtering, analytics integration
- routes
  - hosting/app/content/page.tsx, hosting/app/creator/page.tsx
- docs
  - hosting/README-DOWNLOADS.md

6) XSIAM Integration
- components
  - hosting/components/XSIAMIntegrationPanel.tsx — config, ops panel
  - hosting/components/XSIAMHealthMonitor.tsx — health/trends
- libs
  - hosting/lib/xsiam-api-service.ts — encrypted credentials store (client-local) + API calls
  - hosting/lib/xsiam-commands.tsx — terminal commands (health/query/config)
- docs
  - hosting/docs/xsiam-integration.md

7) BigQuery Export
- components
  - hosting/components/BigQueryExportPanel.tsx — export UI for sessions/analytics
  - hosting/components/BigQueryExplorer.tsx — query/preview UI (client)
- libs
  - hosting/lib/bigquery-service.ts — event queue, sanitize, collect, export via HTTP Cloud Function
  - hosting/lib/bigquery-commands.tsx — terminal export commands
- functions
  - hosting/cloud-functions/bigquery-export/index.js — http('exportToBigQuery'), option CORS + table creation + insert
- docs
  - hosting/docs/bigquery-export.md

8) Terminal System
- components
  - hosting/components/ImprovedTerminal.tsx (PoV-focused), hosting/components/EnhancedTerminal.tsx (SecOps-focused), hosting/components/UnifiedTerminal.tsx (RBAC-aware), hosting/components/Terminal*.tsx
- libs
  - hosting/lib/commands.tsx (core), hosting/lib/commands-ext.tsx (extended), hosting/lib/command-registry.ts
  - hosting/lib/arg-parser.ts, hosting/lib/help-renderer.tsx, hosting/lib/linux-commands.tsx, hosting/lib/download-commands.tsx, hosting/lib/resources-commands.tsx, hosting/lib/with-help.tsx
  - feature command sets: pov-*, enhanced-pov-*, enhanced-trr-*, cdr-*, cortex-dc-*, gemini-*, bigquery-*, xsiam-*
- docs
  - hosting/COMMAND_REFERENCE.md, hosting/COMMAND_PARAMETERS_SCHEMA.md, hosting/COMMAND_AUDIT.md, hosting/TERMINAL_TEST_VERIFICATION.md

9) Infra/Configs/Build
- configs
  - firebase.json (root), hosting/firebase.json — hosting+functions vs hosting-only
  - .firebaserc (root, hosting/)
  - hosting/next.config.ts, hosting/tsconfig.json, hosting/tailwind.config.js, hosting/postcss.config.js
  - hosting/.env.example — Firebase, Functions base URLs, GA/Sentry, flags, emulator settings
- deploy
  - deploy.sh — cd hosting; build:exp; firebase deploy --only hosting
- docs (selected)
  - WARP.md (development guide, flows), FIREBASE_CONFIGURATION_SUMMARY.md, DEPLOYMENT.md, SETUP.md, PRODUCTION_READINESS_REPORT.md

Environment Variables (source: hosting/.env.example + code scans)
- Firebase web: NEXT_PUBLIC_FIREBASE_* (api, authDomain, projectId, storageBucket, senderId, appId, measurementId)
- Feature flags: NEXT_PUBLIC_ENABLE_* (AI, blockchain signoff, analytics, offline)
- Functions base: NEXT_PUBLIC_FUNCTIONS_BASE_URL, NEXT_PUBLIC_DEV_API_URL, NEXT_PUBLIC_PROD_API_URL
- Analytics/Monitoring: NEXT_PUBLIC_GOOGLE_ANALYTICS_ID, NEXT_PUBLIC_SENTRY_DSN
- Emulators: FIRESTORE_EMULATOR_HOST, FIREBASE_AUTH_EMULATOR_HOST, FIREBASE_STORAGE_EMULATOR_HOST, FUNCTIONS_EMULATOR_HOST
- App config: NEXT_PUBLIC_APP_NAME, NEXT_PUBLIC_APP_VERSION, NEXT_PUBLIC_SUPPORT_EMAIL

External/Back-end Services
- Cloud Functions (functions/): aiTrrSuggest, generateThreatActorScenario, executeScenario, controlScenarioExecution, generateDetectionQueries, api (Express)
- Cloud Functions (hosting/cloud-functions/bigquery-export): exportToBigQuery, health (HTTP)
- Vertex/Genkit (henryreedai/): @genkit-ai/*, @genkit-ai/vertexai integrations
- DataConnect codegen folders under hosting/, functions/, and cloud-functions/bigquery-export/

Rebuild Steps (high-level, per WARP.md and configs)
1) Install deps in hosting/; ensure Node LTS and Firebase CLI
2) Build static: hosting/npm run build (or build:exp if using webpack experiments)
3) Deploy Hosting: firebase deploy --only hosting (root deploy.sh performs this)
4) Functions: firebase deploy --only functions (ensure emulators/local tests first)
5) Verify: SPA routing, terminal commands, scenario flows (simulated or functions), TRR forms/validation, content hub, BigQuery export health

Acceptance & Constraints
- Marker of success: `firebase deploy` functional app with Generative AI, Storage, DataConnect, Firestore, Hosting, BigQuery export, and XSIAM panels working per documentation
- Static export only (no server-side Next routes); Images unoptimized; SPA rewrites
- Do not delete code during refactor — comment out or provide shims; preserve evolution trail
- Provide Mermaid diagrams (see GRAPHS.md) for components/modules

Notes for Migration
- Prefer monorepo: apps/hosting, services/functions, packages/shared (types/utils/clients), packages/commands (terminal bundles), packages/ui (shared UI)
- Consolidate Firebase configs (single root firebase.json) and remove duplicates via shims
- Centralize DataConnect generation and CI cache
- Move shared types/clients from hosting/lib into packages/shared with re-export shims left in place
- Proxy XSIAM calls via functions (Secret Manager) if moving sensitive flows server-side
