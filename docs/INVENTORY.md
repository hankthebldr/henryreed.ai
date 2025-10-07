# Repository Inventory (henryreed.ai)

Purpose
- Provide a comprehensive, navigable inventory of code, docs, routes, commands, cloud functions, and configs so a future model can recreate an optimized functional app in a different repository.
- Organized by feature domain and layer.

Legend
- Layers: routes (Next pages), components (UI), libs (client/services/types), commands (terminal), functions (Cloud Functions), docs, tests, configs
- Paths are relative to repo root unless noted.

Top-level Structure
- hosting/  Next.js App Router static app deployed to Firebase Hosting
- functions/  Firebase Cloud Functions (Node 18, TypeScript)
- henryreedai/  Additional Cloud Functions (Node 20) with Genkit/Vertex AI
- scripts/  helper scripts for k8s/deploy
- docs/  root-level project docs
- WARP.md  operational guidance for warp.dev
- firebase.json, .firebaserc (root)  project config for hosting/functions/dataconnect/emulators

Core Configs and Deployment
- firebase.json (root): hosting public: hosting/out; rewrites; headers; functions codebases; emulators
- hosting/firebase.json: hosting public: out; rewrites; headers (app-local alternate)
- .firebaserc (root and hosting/): default project henryreedai
- hosting/next.config.ts: output: 'export'; trailingSlash; distDir: 'out'; images.unoptimized; webpack experiments
- hosting/package.json: scripts dev, build, deploy, emulators; dependencies (next/react/tw)
- deploy.sh (root): build (experimental) then firebase deploy --only hosting
- hosting/.env.example: Firebase, Functions URLs, GA/Sentry, feature flags, emulator settings
- hosting/tailwind.config.js, postcss.config.js
- hosting/tsconfig.json

Routes (Next.js App Router)
- hosting/app/
  - page.tsx (login → GUI route)
  - layout.tsx (AuthProvider, AppStateProvider, header, breadcrumbs, notifications)
  - terminal/page.tsx (UnifiedTerminal)
  - gui/page.tsx (CortexGUIInterface)
  - content/page.tsx (EnhancedContentCreator)
  - creator/page.tsx (ContentCreatorManager)
  - docs/page.tsx (Terminal docs/reference)
  - alignment-guide/page.tsx (Command alignment doc)

Terminal System and Commands
- components
  - ImprovedTerminal.tsx, EnhancedTerminal.tsx, UnifiedTerminal.tsx, Terminal.tsx, TerminalOutput.tsx, TerminalOutputs.tsx, CortexDCTerminal.tsx
- libs
  - commands.tsx (core), commands-ext.tsx (extended), command-registry.ts, with-help.tsx, arg-parser.ts
  - linux-commands.tsx, help-renderer.tsx, guide-commands.tsx, download-commands.tsx, resources-commands.tsx
  - project-commands.tsx, pov-commands.tsx, enhanced-pov-commands.tsx, enhanced-trr-commands.tsx, cdr-commands.tsx, cortex-dc-commands.tsx, gemini-commands.tsx, bigquery-commands.tsx, xsiam-commands.tsx
- context/hooks
  - contexts/AuthContext.tsx, contexts/AppStateContext.tsx
  - hooks/useAuthGuard.ts, hooks/useActivityTracking.ts
- docs (hosting)
  - COMMAND_REFERENCE.md, COMMAND_REFERENCE_POV.md, COMMAND_PARAMETERS_SCHEMA.md, COMMAND_AUDIT.md, TERMINAL_TEST_VERIFICATION.md

Feature Domain Inventory

1) Domain Consultant (DC) Workspace
- components
  - hosting/components/DomainConsultantWorkspace.tsx
  - hosting/components/ManagementDashboard.tsx
- libs
  - hosting/lib/user-management.ts, hosting/lib/user-activity-service.ts
- routes
  - gui/page.tsx (main entry to GUI)
- docs
  - hosting/docs/domain-consultant-guide.md
  - hosting/docs/gui-user-flows.md

2) POV Management
- components
  - hosting/components/POVProjectManagement.tsx
- libs
  - hosting/lib/pov-commands.tsx, hosting/lib/enhanced-pov-commands.tsx
  - hosting/lib/project-commands.tsx
  - hosting/lib/dc-api-client.ts, hosting/lib/dc-context-store.ts, hosting/lib/dc-ai-client.ts
- commands
  - pov, project, guide, resources commands (see terminal list above)
- docs
  - hosting/docs/POV_CONSULTANT_GUIDE.md
  - hosting/docs/POV_OPTIMIZATION_ANALYSIS.md
  - COMMAND_REFERENCE_POV.md
- tests
  - hosting/tests/e2e/smoke.spec.ts (POV flows mixed into smoke coverage)

3) TRR Management
- components
  - hosting/components/TRRManagement.tsx, hosting/components/ProductionTRRManagement.tsx
  - hosting/components/TRRProgressChart.tsx
- libs/types
  - hosting/lib/enhanced-trr-commands.tsx
  - hosting/lib/trr-blockchain-signoff.tsx
  - hosting/types/trr.ts, hosting/types/trr-extended.ts
- docs
  - TRR_MANAGEMENT_OPTIMIZATION_SUMMARY.md (root)
  - hosting/docs/trr-optimization-summary.md
- tests
  - smoke tests across test-results/* (TRR section navigation and creation)

4) Scenario Engine
- components
  - hosting/components/ScenarioEngine.tsx
- libs
  - hosting/lib/scenario-engine.ts, hosting/lib/scenario-engine-client.ts
  - hosting/lib/scenario-types.ts (templates/typing), hosting/lib/scenario-commands.tsx, hosting/lib/scenario-command-wrapper.tsx
  - hosting/lib/cloud-functions-api.ts (deploy/status/validate/destroy)
- Cloud Functions (orchestration/execution)
  - functions/src/index.ts
  - functions/src/handlers/scenario-orchestration.ts
  - functions/src/handlers/scenario-executor.ts
- docs
  - COMPREHENSIVE_SCENARIO_ENGINE.md (root)
  - scenario-management-schema-documentation.md (root)

5) Content Hub (Creator, Library, Analytics)
- components
  - hosting/components/EnhancedContentCreator.tsx, hosting/components/UnifiedContentCreator.tsx
  - hosting/components/ContentCreatorManager.tsx, hosting/components/ContentLibrary.tsx, hosting/components/ConsolidatedContentLibrary.tsx
  - hosting/components/ContentAnalytics.tsx
- libs
  - hosting/lib/content-library-service.ts
- routes
  - content/page.tsx, creator/page.tsx (auth-guarded)
- docs
  - hosting/README-DOWNLOADS.md

6) XSIAM Integration
- components
  - hosting/components/XSIAMIntegrationPanel.tsx, hosting/components/XSIAMHealthMonitor.tsx
- libs
  - hosting/lib/xsiam-api-service.ts (credentials store + API client)
  - hosting/lib/xsiam-commands.tsx (terminal)
- docs
  - hosting/docs/xsiam-integration.md

7) BigQuery Export and Explorer
- components
  - hosting/components/BigQueryExportPanel.tsx, hosting/components/BigQueryExplorer.tsx
- libs
  - hosting/lib/bigquery-service.ts (client-side queue/export via Cloud Function)
  - hosting/lib/bigquery-commands.tsx
- Cloud Function (HTTP)
  - hosting/cloud-functions/bigquery-export/index.js (exportToBigQuery, health)
- docs
  - hosting/docs/bigquery-export.md

Cross-cutting Services and Config
- Firebase (web client): hosting/lib/firebase/client.ts; hosting/lib/firebase-config.ts
- DataConnect (generated):
  - hosting/src/dataconnect-generated/* and hosting/cloud-functions/bigquery-export/src/dataconnect-generated/*
  - functions/src/dataconnect-generated/*
- GCP backend config helpers: hosting/lib/gcp-backend-config.ts
- AI/Gemini/Genkit
  - hosting/lib/gemini-ai-service.ts, hosting/lib/gemini-commands.tsx
  - functions/src/gemini.ts (OpenAI/gpt-4 backed endpoint)
  - henryreedai/package.json (Genkit/Vertex dependencies)

Docs (root and hosting)
- Root docs: BACKEND_SERVICES_SUMMARY.md, EXTERNAL_INTEGRATION_ARCHITECTURE.md, FIREBASE_CONFIGURATION_SUMMARY.md, DEPLOYMENT.md, QUICK_START.md, EXTENSION_FRAMEWORK_DOCUMENTATION.md, DATA_FLOW_LIFECYCLE_DOCUMENTATION.md, UNIFIED_SCHEMA_DOCUMENTATION.md, TYPESCRIPT_STRUCTURE_ANALYSIS.md, CLOUD_NATIVE_SECOPS_EXPANSION_PLAN.md, PROJECT_COMPLETION_SUMMARY.md, ENHANCEMENT_SUMMARY.md, ENHANCED_SYSTEM_GUIDE.md
- Hosting docs: CHANGELOG.md, SETUP.md, README.md, README-DOWNLOADS.md, FIREBASE_DEPLOYMENT_FIX.md, PRODUCTION_READINESS_REPORT.md, SYNC_VALIDATION.md, TEST_COMPLETION_SUMMARY.md, COMMAND_* (see above), docs/* (guides for POV, domain consultant, GUI flows, branding, xsiam, bigquery)

Tests
- hosting/tests/e2e/smoke.spec.ts (Playwright @playwright/test)
- hosting/tests/smoke.test.ts (Jest)
- hosting/playwright.config.ts, hosting/jest.config.js, hosting/jest.setup.js
- hosting/test-results and playwright-report (artifacts)

Emulators and Local Dev
- hosting/package.json: firebase:serve, firebase:emulators, firebase:emulators:full
- Root firebase.json: emulators block for auth, firestore, hosting, functions, storage, dataconnect

Security/Policies
- hosting/lib/safety-policy.ts (terminal safety guardrails)
- firestore.rules, storage.rules (hosting)

Known Duplications/Note-worthy Structure
- Duplicate Firebase configs: root firebase.json and hosting/firebase.json (hosting-only vs full stack)
- Duplicate dataconnect-generated artifacts across hosting/functions
- hosting/hosting/*: nested folder with hosting/lib/firebase.ts (legacy copy)

Open Questions (captured for migration plan)
- Target new repo name/owner and whether to adopt a monorepo layout (apps/hosting, services/functions, packages/*)
- Consolidate functions into single codebase or keep multiple (functions/ vs henryreedai/ vs hosting/cloud-functions)
- DataConnect generation source-of-truth location and CI strategy
- XSIAM credentials: final handling (client-side encrypted localStorage vs server-side Secret Manager proxy)
- BigQuery dataset/table naming for dev/stage/prod; SA roles
- Vertex/Genkit usage in production (models/regions/secrets)

Appendix A: Quick Index by Feature → Layer (High-level)
- DC Workspace: components (DomainConsultantWorkspace, ManagementDashboard), libs (user-management, user-activity-service), route (gui)
- POV: components (POVProjectManagement), libs (pov-commands, enhanced-pov-commands, project-commands, dc-*), docs (POV*), route (gui)
- TRR: components (TRRManagement, ProductionTRRManagement, TRRProgressChart), libs (enhanced-trr-commands, trr-blockchain-signoff, types), docs (TRR*), tests
- Scenario Engine: components (ScenarioEngine), libs (scenario-engine*, scenario-types, scenario-commands, cloud-functions-api), functions (scenario-* handlers)
- Content Hub: components (EnhancedContentCreator, ContentCreatorManager, ContentLibrary, ConsolidatedContentLibrary, ContentAnalytics), lib (content-library-service), routes (content, creator)
- XSIAM: components (XSIAMIntegrationPanel, XSIAMHealthMonitor), libs (xsiam-api-service, xsiam-commands), docs (xsiam-integration)
- BigQuery: components (BigQueryExportPanel, BigQueryExplorer), libs (bigquery-service, bigquery-commands), function (exportToBigQuery), docs (bigquery-export)
- Terminal: components (ImprovedTerminal, EnhancedTerminal, UnifiedTerminal), libs (commands*, registry, arg-parser, linux-commands), docs (COMMAND_*)
- Infra: configs (firebase.json x2, .firebaserc x2, next.config.ts, .env.example, tailwind/postcss/tsconfig), deploy.sh

This document is intended to serve as the authoritative map for migration and scale refactor.
