# Code Index - HenryReed.ai Cortex Domain Consultant Platform

**Generated:** 2025-10-08T04:39:12.743Z  
**Purpose:** Complete inventory for scalable refactoring

## Overview

This codebase implements a sophisticated cybersecurity domain consultant platform with:
- **Terminal-first Interface:** Single canonical terminal with GUI integration
- **Security Scenario Engine:** Comprehensive security testing and validation
- **POV Management System:** Customer proof-of-value lifecycle management  
- **TRR Management:** Technical requirements review with blockchain signoff
- **Domain Consultant AI:** GenAI-powered security consulting workflows

## Architecture Highlights

- **Frontend:** Next.js static export with React 18 + TypeScript
- **Deployment:** Firebase Hosting with experimental webpack
- **Command System:** Modular command architecture with mock/real mode switching
- **State Management:** Hybrid localStorage + optional Firestore sync
- **Integration Ready:** XSIAM, BigQuery, Genkit AI with graceful degradation

## Key Feature Modules

### Domain Consultant
- **Components:** DomainConsultantWorkspace.tsx, EnhancedAIAssistant.tsx
- **Commands:** Core consulting commands in commands.tsx
- **AI Integration:** Genkit-powered recommendations and analysis

### POV Management  
- **Components:** POVManagement.tsx, POVProjectManagement.tsx
- **Commands:** pov-commands.tsx with full lifecycle support
- **Integration:** Dynamic scenario-to-POV mapping

### TRR Management
- **Components:** TRRManagement.tsx, ProductionTRRManagement.tsx  
- **Commands:** detect-commands.tsx, monitor-commands.tsx
- **Blockchain:** trr-blockchain-signoff.tsx for immutable audit trails

### Scenario Engine
- **Commands:** scenario-commands.tsx with 20+ scenario types
- **Types:** scenario-types.ts with MITRE ATT&CK mappings
- **Providers:** GCP, AWS, Azure, Kubernetes, local support

### Content Hub
- **Components:** ConsolidatedContentLibrary.tsx, ContentCreatorManager.tsx
- **Service:** content-library-service.ts for resource management
- **Search:** Client-side search with content-index.json

---

## Core Command System

- `hosting/lib/bigquery-commands.tsx`
- `hosting/lib/cdr-commands.tsx`
- `hosting/lib/cloud-config-commands.tsx`
- `hosting/lib/commands-ext.tsx`
- `hosting/lib/commands.tsx`
- `hosting/lib/cortex-dc-commands.tsx`
- `hosting/lib/detect-commands.tsx`
- `hosting/lib/download-commands.tsx`
- `hosting/lib/enhanced-cdr-commands.tsx`
- `hosting/lib/enhanced-help-commands.tsx`
- `hosting/lib/enhanced-pov-commands.tsx` - 🎯 **POV Lifecycle Management**
- `hosting/lib/enhanced-trr-commands.tsx`
- `hosting/lib/gemini-commands.tsx`
- `hosting/lib/guide-commands.tsx`
- `hosting/lib/linux-commands.tsx`
- `hosting/lib/monitor-commands.tsx`
- `hosting/lib/pov-commands.tsx` - 🎯 **POV Lifecycle Management**
- `hosting/lib/project-commands.tsx`
- `hosting/lib/resources-commands.tsx`
- `hosting/lib/scenario-command-wrapper.tsx`
- `hosting/lib/scenario-commands.tsx` - 🛡️ **Security Scenario Engine**
- `hosting/lib/template-config-commands.tsx`
- `hosting/lib/xsiam-commands.tsx`

## GUI Components

- `hosting/components/AppHeader.tsx`
- `hosting/components/AppShell.tsx`
- `hosting/components/AuthLanding.tsx`
- `hosting/components/BigQueryExplorer.tsx`
- `hosting/components/BigQueryExportPanel.tsx`
- `hosting/components/BreadcrumbNavigation.tsx`
- `hosting/components/CommandAlignmentGuide.tsx`
- `hosting/components/ConditionalLayout.tsx`
- `hosting/components/ConsolidatedContentLibrary.tsx`
- `hosting/components/ContentAnalytics.tsx`
- `hosting/components/ContentCreatorManager.tsx`
- `hosting/components/ContentLibrary.tsx`
- `hosting/components/CortexButton.tsx`
- `hosting/components/CortexCloudFrame.tsx`
- `hosting/components/CortexCommandButton.tsx`
- `hosting/components/CortexDCTerminal.tsx`
- `hosting/components/CortexGUIInterface.tsx`
- `hosting/components/DomainConsultantWorkspace.tsx`
- `hosting/components/EnhancedAIAssistant.tsx`
- `hosting/components/EnhancedContentCreator.tsx`
- `hosting/components/EnhancedGUIInterface.tsx`
- `hosting/components/EnhancedManualCreationGUI.tsx`
- `hosting/components/EnhancedScenarioCreator.tsx`
- `hosting/components/EnhancedTerminal.tsx`
- `hosting/components/ImprovedTerminal.tsx` - 🔥 **Single Canonical Terminal**
- `hosting/components/InteractiveCharts.tsx`
- `hosting/components/LoginForm.tsx`
- `hosting/components/ManagementDashboard.tsx`
- `hosting/components/ManualCreationGUI.tsx`
- `hosting/components/NotificationSystem.tsx`
- `hosting/components/OnboardingGuide.tsx`
- `hosting/components/POVManagement.tsx`
- `hosting/components/POVProjectManagement.tsx`
- `hosting/components/ProductionTRRManagement.tsx`
- `hosting/components/SDWWorkflow.tsx`
- `hosting/components/ScenarioEngine.tsx.bak`
- `hosting/components/SettingsPanel.tsx`
- `hosting/components/TRRManagement.tsx`
- `hosting/components/TRRProgressChart.tsx`
- `hosting/components/Terminal.tsx`
- `hosting/components/TerminalIntegrationSettings.tsx`
- `hosting/components/TerminalOutput.tsx`
- `hosting/components/TerminalOutputs.tsx`
- `hosting/components/TerminalWindow.tsx`
- `hosting/components/UnifiedContentCreator.tsx`
- `hosting/components/UnifiedTerminal.tsx`
- `hosting/components/UserTimelineView.tsx`
- `hosting/components/XSIAMHealthMonitor.tsx`
- `hosting/components/XSIAMIntegrationPanel.tsx`
- `hosting/components/terminal/TerminalHost.tsx`
- `hosting/components/ui/Button.tsx`
- `hosting/components/ui/Card.tsx`
- `hosting/components/ui/Input.tsx`
- `hosting/components/ui/Loading.tsx`
- `hosting/components/ui/index.ts`

## Feature Modules

- `hosting/lib/ai-insights-client.ts`
- `hosting/lib/api-service.ts`
- `hosting/lib/arg-parser.ts`
- `hosting/lib/auth-service.ts`
- `hosting/lib/bigquery-service.ts`
- `hosting/lib/cloud-command-executor.ts`
- `hosting/lib/cloud-functions-api.ts`
- `hosting/lib/command-registry.ts`
- `hosting/lib/content-library-service.ts`
- `hosting/lib/context-storage.ts`
- `hosting/lib/data-service.ts`
- `hosting/lib/dc-ai-client.ts`
- `hosting/lib/dc-api-client.ts`
- `hosting/lib/dc-context-store.ts`
- `hosting/lib/feature-parity-audit.ts`
- `hosting/lib/firebase-config.ts`
- `hosting/lib/firebase/client.ts`
- `hosting/lib/gcp-backend-config.ts`
- `hosting/lib/gemini-ai-service.ts`
- `hosting/lib/help-renderer.tsx`
- `hosting/lib/knowledge-base.ts`
- `hosting/lib/rbac-middleware.ts`
- `hosting/lib/resource-ledger.ts`
- `hosting/lib/safety-policy.ts`
- `hosting/lib/scenario-engine-client.ts.bak`
- `hosting/lib/scenario-engine.ts.bak`
- `hosting/lib/scenario-pov-map.ts`
- `hosting/lib/scenario-types.ts`
- `hosting/lib/sdw-models.ts`
- `hosting/lib/trr-blockchain-signoff.tsx`
- `hosting/lib/types.ts`
- `hosting/lib/unified-command-service.ts`
- `hosting/lib/user-activity-service.ts`
- `hosting/lib/user-management.ts`
- `hosting/lib/utils.ts`
- `hosting/lib/vfs.ts`
- `hosting/lib/virtual-fs.ts`
- `hosting/lib/with-help.tsx`
- `hosting/lib/xsiam-api-service.ts`

## Pages & Routing

- `hosting/app/alignment-guide/page.tsx`
- `hosting/app/content/page.tsx`
- `hosting/app/creator/page.tsx`
- `hosting/app/dc-portal-styles.css`
- `hosting/app/docs/page.tsx`
- `hosting/app/globals.css`
- `hosting/app/gui/page.tsx`
- `hosting/app/layout.tsx`
- `hosting/app/page.tsx`
- `hosting/app/terminal/page.tsx`
- `hosting/app/test.tsx`

## Services & Utilities

- `hosting/.depcheck-report.txt`
- `hosting/.env.example`
- `hosting/.eslintrc.cjs`
- `hosting/.gitignore`
- `hosting/.prettierignore`
- `hosting/.prettierrc`
- `hosting/.repo-inventory.txt`
- `hosting/.ts-prune-report.txt`
- `hosting/cloud-functions/bigquery-export/index.js`
- `hosting/cloud-functions/bigquery-export/src/dataconnect-generated/esm/index.esm.js`
- `hosting/cloud-functions/bigquery-export/src/dataconnect-generated/index.cjs.js`
- `hosting/cloud-functions/bigquery-export/src/dataconnect-generated/index.d.ts`
- `hosting/contexts/AppStateContext.tsx`
- `hosting/contexts/AuthContext.tsx`
- `hosting/firestore.rules`
- `hosting/hooks/useActivityTracking.ts`
- `hosting/hooks/useAuthGuard.ts`
- `hosting/hooks/useCommandExecutor.ts` - ⚡ **GUI-to-Terminal Bridge**
- `hosting/hosting/contexts/AuthContext.tsx`
- `hosting/jest.setup.js`
- `hosting/playwright-report/data/073429a0781caa6a9c2415a649edefd7ce19df4d.png`
- `hosting/playwright-report/data/22906aa3e463bfbb785011b3b877f3e9306850dd.png`
- `hosting/playwright-report/data/23f96f409fe0ec5f8bcb0063a8aef50da1221154.webm`
- `hosting/playwright-report/data/51d7385c451cb8b3b36b1ae24b16a584d31e32ed.png`
- `hosting/playwright-report/data/58a4a500b4bda2d639a7482d15554f5e2a50e002.webm`
- `hosting/playwright-report/data/75fc26e766566fa040f98a54373d1a573fa7ab92.webm`
- `hosting/playwright-report/data/b2653dc310ac217498f0bf79369bee26462ef177.webm`
- `hosting/playwright-report/data/d1743ed0c1a42d8c6cca3273d8e09eb7204fecd4.png`
- `hosting/playwright-report/data/d3dc69a0fe01c1e0d1c85f57048fffab427a196b.webm`
- `hosting/playwright-report/data/de3776a883bcf82210ed4b3018bacf49540d751c.png`
- `hosting/playwright-report/index.html`
- `hosting/providers/ThemeProvider.tsx`
- `hosting/public/apple-touch-icon-180x180.png`
- `hosting/public/apple-touch-icon.png`
- `hosting/public/assets/branding/favicons/favicon-32x32.png`
- `hosting/public/assets/branding/icons/cortex-192x192.png`
- `hosting/public/assets/branding/icons/cortex-32x32.png`
- `hosting/public/assets/branding/logos/pan-logo-dark.svg`
- `hosting/public/favicon.ico`
- `hosting/public/favicon.svg`
- `hosting/scripts/content-index.ts`
- `hosting/scripts/firestore-ingest.ts`
- `hosting/scripts/validate-qa.js`
- `hosting/src/components/branding/BrandedButton.tsx`
- `hosting/src/components/branding/CortexIcon.tsx`
- `hosting/src/components/branding/PaloAltoLogo.tsx`
- `hosting/src/components/branding/index.ts`
- `hosting/src/dataconnect-generated/esm/index.esm.js`
- `hosting/src/dataconnect-generated/index.cjs.js`
- `hosting/src/dataconnect-generated/index.d.ts`
- `hosting/src/dataconnect-generated/react/esm/index.esm.js`
- `hosting/src/dataconnect-generated/react/index.cjs.js`
- `hosting/src/dataconnect-generated/react/index.d.ts`
- `hosting/storage.rules`
- `hosting/test-results/results.xml`
- `hosting/test-results/smoke-Authentication-Flow--bfc1a-ogin-with-valid-credentials-Mobile-Chrome/test-failed-1.png`
- `hosting/test-results/smoke-Authentication-Flow--bfc1a-ogin-with-valid-credentials-Mobile-Chrome/video.webm`
- `hosting/test-results/smoke-Authentication-Flow--bfc1a-ogin-with-valid-credentials-Mobile-Safari/test-failed-1.png`
- `hosting/test-results/smoke-Authentication-Flow--bfc1a-ogin-with-valid-credentials-Mobile-Safari/video.webm`
- `hosting/test-results/smoke-Authentication-Flow--bfc1a-ogin-with-valid-credentials-chromium/test-failed-1.png`
- `hosting/test-results/smoke-Authentication-Flow--bfc1a-ogin-with-valid-credentials-chromium/video.webm`
- `hosting/test-results/smoke-Authentication-Flow--bfc1a-ogin-with-valid-credentials-firefox/test-failed-1.png`
- `hosting/test-results/smoke-Authentication-Flow--bfc1a-ogin-with-valid-credentials-firefox/video.webm`
- `hosting/test-results/smoke-Authentication-Flow--bfc1a-ogin-with-valid-credentials-webkit/test-failed-1.png`
- `hosting/test-results/smoke-Authentication-Flow--bfc1a-ogin-with-valid-credentials-webkit/video.webm`
- `hosting/tests/e2e/smoke.spec.ts`
- `hosting/tests/smoke.test.ts`
- `hosting/types/content.ts`
- `hosting/types/gray-matter.d.ts`
- `hosting/types/trr-extended.ts`
- `hosting/types/trr.ts`

## Firebase & Config

- `.firebaserc`
- `.vscode/extensions.json`
- `firebase.json` - ⚙️ **Firebase Deployment Config**
- `functions-shared/package.json`
- `functions-shared/tsconfig.json`
- `functions/package-lock.json`
- `functions/package.json`
- `functions/src/dataconnect-generated/esm/package.json`
- `functions/src/dataconnect-generated/package.json`
- `functions/tsconfig.json`
- `henryreedai/package-lock.json`
- `henryreedai/package.json`
- `henryreedai/tsconfig.json`
- `hosting/.firebaserc`
- `hosting/cloud-functions/bigquery-export/package-lock.json`
- `hosting/cloud-functions/bigquery-export/package.json`
- `hosting/cloud-functions/bigquery-export/src/dataconnect-generated/esm/package.json`
- `hosting/cloud-functions/bigquery-export/src/dataconnect-generated/package.json`
- `hosting/documentation/index.json`
- `hosting/firebase.json` - ⚙️ **Firebase Deployment Config**
- `hosting/firestore.indexes.json`
- `hosting/hosting/lib/firebase.ts`
- `hosting/jest.config.js`
- `hosting/next.config.ts` - 📦 **Next.js Build Configuration**
- `hosting/package-lock.json`
- `hosting/package.json`
- `hosting/playwright.config.ts`
- `hosting/postcss.config.js`
- `hosting/public/content-index.json`
- `hosting/public/manifest.json`
- `hosting/remoteconfig.template.json`
- `hosting/src/config/brand.ts`
- `hosting/src/dataconnect-generated/esm/package.json`
- `hosting/src/dataconnect-generated/package.json`
- `hosting/src/dataconnect-generated/react/esm/package.json`
- `hosting/src/dataconnect-generated/react/package.json`
- `hosting/src/lib/firebase.ts`
- `hosting/tailwind.config.js`
- `hosting/test-results/.last-run.json`
- `hosting/test-results/results.json`
- `hosting/tsconfig.json`
- `k8s/configmap.yaml`
- `package-lock.json`
- `package.json`
- `src/config/brand.ts`
- `src/dataconnect-generated/esm/package.json`
- `src/dataconnect-generated/package.json`

## Documentation

- `BACKEND_SERVICES_SUMMARY.md`
- `BRANDING_ASSETS.md`
- `CLOUD_NATIVE_SECOPS_EXPANSION_PLAN.md`
- `COMMAND_INVENTORY.md`
- `COMPREHENSIVE_SCENARIO_ENGINE.md`
- `Cortex_DC_Portal_Design.md`
- `DATA_FLOW_LIFECYCLE_DOCUMENTATION.md`
- `DEPLOYMENT.md`
- `EXTENSION_FRAMEWORK_DOCUMENTATION.md`
- `EXTERNAL_INTEGRATION_ARCHITECTURE.md`
- `FIREBASE_CONFIGURATION_SUMMARY.md`
- `README.md`
- `README_NEW.md`
- `TRR_MANAGEMENT_OPTIMIZATION_SUMMARY.md`
- `TYPESCRIPT_STRUCTURE_ANALYSIS.md`
- `UNIFIED_SCHEMA_DOCUMENTATION.md`
- `WARP.md` - 📋 **Terminal Architecture Guide**
- `docs/README.md`
- `docs/RECOVERY-TODO.md`
- `docs/architecture.md`
- `docs/archive/terminal/DEPRECATED.md`
- `docs/branding/BRAND_GUIDELINES.md`
- `docs/branding/COLOR_REFERENCE.md`
- `docs/branding/COMPONENT_API.md`
- `docs/cli.md`
- `docs/cloud-integration.md`
- `docs/commands/README.md`
- `docs/development.md`
- `docs/restore-branch-analysis.md`
- `functions/src/dataconnect-generated/README.md`
- `henryreedai/LEGACY_README.md`
- `hosting/BRANDING_ASSETS.md`
- `hosting/CHANGELOG.md`
- `hosting/COMMAND_AUDIT.md`
- `hosting/COMMAND_PARAMETERS_SCHEMA.md`
- `hosting/COMMAND_REFERENCE.md`
- `hosting/COMMAND_REFERENCE_POV.md`
- `hosting/DEPLOYMENT.md`
- `hosting/ENHANCED_SYSTEM_GUIDE.md`
- `hosting/ENHANCEMENT_SUMMARY.md`
- `hosting/FIREBASE_DEPLOYMENT_FIX.md`
- `hosting/HEADER_OPTIMIZATION_SUMMARY.md`
- `hosting/INTEGRATION_LOG.md`
- `hosting/PRODUCTION_READINESS_REPORT.md`
- `hosting/PROJECT_COMPLETION_SUMMARY.md`
- `hosting/QA_CHECKLIST.md`
- `hosting/README-DOWNLOADS.md`
- `hosting/README.md`
- `hosting/SETUP.md`
- `hosting/STYLING_GUIDE.md`
- `hosting/SYNC_VALIDATION.md`
- `hosting/TERMINAL_TEST_VERIFICATION.md`
- `hosting/TEST_COMPLETION_SUMMARY.md`
- `hosting/UX_IMPLEMENTATION_GUIDE.md`
- `hosting/UX_IMPROVEMENT_PLAN.md`
- `hosting/cloud-functions/bigquery-export/src/dataconnect-generated/README.md`
- `hosting/docs/POV_CONSULTANT_GUIDE.md`
- `hosting/docs/POV_OPTIMIZATION_ANALYSIS.md`
- `hosting/docs/README.md`
- `hosting/docs/bigquery-export.md`
- `hosting/docs/content-architecture.md`
- `hosting/docs/cortex-branding-implementation.md`
- `hosting/docs/dc-portal-optimization-summary.md`
- `hosting/docs/domain-consultant-guide.md`
- `hosting/docs/gui-user-flows.md`
- `hosting/docs/panw-cortex-branding-final.md`
- `hosting/docs/portal-ui-map.md`
- `hosting/docs/technical-specs/rbac-terminal-integration-plan.md`
- `hosting/docs/trr-optimization-summary.md`
- `hosting/docs/user-stories/dashboard-user-stories.md`
- `hosting/docs/xsiam-integration.md`
- `hosting/documentation/00-conventions.md`
- `hosting/documentation/01-navigation-structure.md`
- `hosting/documentation/03-page-layouts/dashboard.md`
- `hosting/documentation/04-workflows/new-pov-creation.md`
- `hosting/documentation/06-route-mapping.md`
- `hosting/documentation/99-changelog.md`
- `hosting/documentation/README.md`
- `hosting/playwright-report/data/1e7cf92cb2e7eb0168eb2bb6e2f1f21f8851c260.md`
- `hosting/playwright-report/data/a771d08eb46ed936bd5ec6a888a0d093262720bb.md`
- `hosting/playwright-report/data/bbce89ecde49336e1712c2d715f7bbf4461b6c24.md`
- `hosting/playwright-report/data/cee5ee5b9d258d74d8f1cd67d60e34953bbac096.md`
- `hosting/playwright-report/data/d62d7f3d46cd53ac8e61d846f8ec006fe9fa18ce.md`
- `hosting/src/dataconnect-generated/README.md`
- `hosting/src/dataconnect-generated/react/README.md`
- `hosting/test-results/smoke-Authentication-Flow--bfc1a-ogin-with-valid-credentials-Mobile-Chrome/error-context.md`
- `hosting/test-results/smoke-Authentication-Flow--bfc1a-ogin-with-valid-credentials-Mobile-Safari/error-context.md`
- `hosting/test-results/smoke-Authentication-Flow--bfc1a-ogin-with-valid-credentials-chromium/error-context.md`
- `hosting/test-results/smoke-Authentication-Flow--bfc1a-ogin-with-valid-credentials-firefox/error-context.md`
- `hosting/test-results/smoke-Authentication-Flow--bfc1a-ogin-with-valid-credentials-webkit/error-context.md`
- `scenario-lifecycle-flowchart.md`
- `scenario-management-schema-documentation.md`
- `src/dataconnect-generated/README.md`

## Scripts & Tools

- `deploy-test.sh`
- `deploy.sh`
- `k8s/deployment.yaml`
- `scripts/build.sh`
- `scripts/cleanup-k8s.sh`
- `scripts/deploy-k8s.sh`

## Root Files

- `.depcheck-report.txt`
- `.dockerignore`
- `.gitignore`
- `.repo-inventory.txt`
- `.ts-prune-report.txt`
- `Dockerfile`
- `dataconnect/dataconnect.yaml`
- `dataconnect/example/connector.yaml`
- `dataconnect/example/mutations.gql`
- `dataconnect/example/queries.gql`
- `dataconnect/schema/schema.gql`
- `docker-compose.yml`
- `examples/pov-ransomware-gcp.yaml`
- `functions-shared/src/index.ts`
- `functions/lib/ai/genkit-flows.d.ts`
- `functions/lib/ai/genkit-flows.js`
- `functions/lib/ai/genkit-flows.js.map`
- `functions/lib/ai/henry-ai-functions.d.ts`
- `functions/lib/ai/henry-ai-functions.js`
- `functions/lib/ai/henry-ai-functions.js.map`
- `functions/lib/ai/henry-genkit-sample.d.ts`
- `functions/lib/ai/henry-genkit-sample.js`
- `functions/lib/ai/henry-genkit-sample.js.map`
- `functions/lib/gemini.d.ts`
- `functions/lib/gemini.js`
- `functions/lib/gemini.js.map`
- `functions/lib/handlers/ai-trr-suggest.d.ts`
- `functions/lib/handlers/ai-trr-suggest.js`
- `functions/lib/handlers/ai-trr-suggest.js.map`
- `functions/lib/handlers/scenario-executor.d.ts`
- `functions/lib/handlers/scenario-executor.js`
- `functions/lib/handlers/scenario-executor.js.map`
- `functions/lib/handlers/scenario-orchestration.d.ts`
- `functions/lib/handlers/scenario-orchestration.js`
- `functions/lib/handlers/scenario-orchestration.js.map`
- `functions/lib/index.d.ts`
- `functions/lib/index.js`
- `functions/lib/index.js.map`
- `functions/lib/middleware/auth.d.ts`
- `functions/lib/middleware/auth.js`
- `functions/lib/middleware/auth.js.map`
- `functions/lib/routes/ai.d.ts`
- `functions/lib/routes/ai.js`
- `functions/lib/routes/ai.js.map`
- `functions/lib/routes/bigquery.d.ts`
- `functions/lib/routes/bigquery.js`
- `functions/lib/routes/bigquery.js.map`
- `functions/lib/routes/trr.d.ts`
- `functions/lib/routes/trr.js`
- `functions/lib/routes/trr.js.map`
- `functions/lib/utils/logger.d.ts`
- `functions/lib/utils/logger.js`
- `functions/lib/utils/logger.js.map`
- `functions/src/ai/genkit-flows.ts`
- `functions/src/ai/henry-ai-functions.ts`
- `functions/src/ai/henry-genkit-sample.ts`
- `functions/src/dataconnect-generated/esm/index.esm.js`
- `functions/src/dataconnect-generated/index.cjs.js`
- `functions/src/dataconnect-generated/index.d.ts`
- `functions/src/gemini.ts`
- `functions/src/handlers/ai-trr-suggest.ts`
- `functions/src/handlers/scenario-executor.ts`
- `functions/src/handlers/scenario-orchestration.ts`
- `functions/src/index.ts`
- `functions/src/middleware/auth.ts`
- `functions/src/routes/ai.ts`
- `functions/src/routes/bigquery.ts`
- `functions/src/routes/trr.ts`
- `functions/src/utils/logger.ts`
- `henryreedai/.gitignore`
- `henryreedai/src/ai-functions.ts`
- `henryreedai/src/genkit-sample.ts`
- `henryreedai/src/index.ts`
- `k8s/hpa.yaml`
- `k8s/ingress.yaml`
- `k8s/kustomization.yaml`
- `k8s/namespace.yaml`
- `k8s/pdb.yaml`
- `k8s/service.yaml`
- `k8s/tls-secret-template.yaml`
- `public/apple-touch-icon-180x180.png`
- `public/assets/branding/favicons/favicon-32x32.png`
- `public/assets/branding/icons/cortex-192x192.png`
- `public/assets/branding/icons/cortex-32x32.png`
- `public/assets/branding/logos/pan-logo-dark.svg`
- `public/favicon.ico`
- `src/components/branding/BrandedButton.tsx`
- `src/components/branding/CortexIcon.tsx`
- `src/components/branding/PaloAltoLogo.tsx`
- `src/components/branding/index.ts`
- `src/dataconnect-generated/esm/index.esm.js`
- `src/dataconnect-generated/index.cjs.js`
- `src/dataconnect-generated/index.d.ts`

## Refactoring Priorities

### Phase 1: Foundation
1. **Firebase Config Cleanup** - Hosting-only configuration
2. **TypeScript Strict Mode** - Re-enable strict type checking  
3. **Module Boundaries** - Clear separation of feature modules

### Phase 2: Architecture  
1. **Plugin System** - Pluggable scenario and provider architecture
2. **State Management** - Unified state management strategy
3. **Test Coverage** - Comprehensive test suite for command system

### Phase 3: Optimization
1. **Performance** - Bundle optimization and lazy loading
2. **CI/CD Pipeline** - Automated testing and deployment
3. **Production Readiness** - Monitoring and error handling

## Integration Strategy

### Mock-First Approach
All external integrations (XSIAM, BigQuery, GenAI) support mock mode for:
- **Offline Development** - Full functionality without external dependencies
- **Demo Environments** - Consistent demo behavior  
- **Testing** - Predictable test scenarios
- **Graceful Degradation** - Automatic fallback when backends unavailable

### External Services
- **XSIAM API** - Palo Alto Networks security platform
- **BigQuery Export** - Google Cloud data analytics
- **Genkit/Vertex AI** - Google AI services for domain consulting
- **Firebase Services** - Hosting, Firestore, Storage, Functions

---

*Generated by scripts/generate-code-index.mjs*  
*Last updated: 2025-10-08T04:39:12.744Z*
