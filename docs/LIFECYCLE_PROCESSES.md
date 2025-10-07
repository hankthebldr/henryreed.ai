# Lifecycle Processes (Scenario, POV, TRR, Content Hub, XSIAM, Terminal)

This document captures all major lifecycle-oriented processes with mappings to UI routes, terminal commands, libraries, and (where applicable) Cloud Functions.

Scenario Engine Lifecycle
- Steps: generate → deploy → status → validate → export → destroy
- Terminal commands: scenario list|generate|status|validate|export|destroy (hosting/lib/scenario-commands.tsx)
- UI: hosting/components/ScenarioEngine.tsx
- Client libs: hosting/lib/scenario-engine*.ts; hosting/lib/cloud-functions-api.ts (simulate or call functions)
- Functions (current): functions/src/handlers/{scenario-orchestration,scenario-executor}.ts; onCall in functions/src/index.ts
- Data: hosting/lib/scenario-types.ts (ScenarioType, templates), activeDeployments (in-memory in UI)
- Notes:
  - Simulate vs Functions: controlled by NEXT_PUBLIC_USE_FUNCTIONS (fallback simulateDeployment)
  - MITRE mapping provided per scenario type; validation shows expected detections

POV Management Lifecycle
- Steps: init → configure → execute (scenarios) → status/metrics → report → cleanup
- Terminal: hosting/lib/pov-commands.tsx (init, list, configure, execute, status, report, cleanup, metrics, templates)
- UI: hosting/components/POVProjectManagement.tsx
- Context: hosting/lib/dc-context-store.ts; hosting/lib/dc-api-client.ts; hosting/lib/dc-ai-client.ts
- Docs: hosting/docs/POV_CONSULTANT_GUIDE.md, hosting/docs/POV_OPTIMIZATION_ANALYSIS.md
- Notes:
  - Rich form-driven POV creation; timeline, milestones, resources, stakeholders
  - AI analysis hooks exist (dc-ai-client); end-to-end function calls are simulated / to be wired

TRR Management Lifecycle
- Steps: create → validate (criteria/test cases) → evidence → signoff (blockchain) → export
- Terminal: hosting/lib/enhanced-trr-commands.tsx (CSV import/parse; validation; status)
- UI: hosting/components/TRRManagement.tsx, hosting/components/ProductionTRRManagement.tsx, TRRProgressChart.tsx
- Types: hosting/types/trr.ts, hosting/types/trr-extended.ts
- Functions (present but TODOs in index): aiTrrSuggest implemented; TRR-specific export/signoff endpoints marked as TODO
- Docs: TRR_MANAGEMENT_OPTIMIZATION_SUMMARY.md (root); hosting/docs/trr-optimization-summary.md
- Notes:
  - CSV parser for TRR validations exists; blockchain signoff is a UI module with planned backend

Content Hub Lifecycle
- Steps: create → save into library → analyze (usage/ratings/metadata) → export/download
- UI: EnhancedContentCreator.tsx, ContentCreatorManager.tsx, ContentLibrary.tsx, ConsolidatedContentLibrary.tsx, ContentAnalytics.tsx
- Lib: hosting/lib/content-library-service.ts (models and utilities)
- Terminal: download/resources commands (hosting/lib/download-commands.tsx, resources-commands.tsx)
- Notes:
  - Exports tie into Storage/BigQuery flows; ensure unified event schema when exporting

XSIAM Integration Flow
- Steps: configure credentials → test health → run queries/analytics → monitor dashboards
- UI: XSIAMIntegrationPanel.tsx, XSIAMHealthMonitor.tsx
- Lib: hosting/lib/xsiam-api-service.ts (client-side encrypted store) and hosting/lib/xsiam-commands.tsx
- Docs: hosting/docs/xsiam-integration.md
- Notes:
  - Current design stores credentials client-side (encrypted localStorage); migration plan introduces server-side Secret Manager with user-level credential docs

BigQuery Export Flow
- Steps: track events → batch/queue client-side → call HTTP exporter → insert into dataset tables
- UI: BigQueryExportPanel.tsx, BigQueryExplorer.tsx
- Lib: hosting/lib/bigquery-service.ts (queue + sanitize + export), hosting/lib/bigquery-commands.tsx
- Function: hosting/cloud-functions/bigquery-export/index.js (http("exportToBigQuery"), health)
- Docs: hosting/docs/bigquery-export.md; docs/BIGQUERY_SCHEMA.md (new unified schema)

Terminal System
- Implementations: ImprovedTerminal.tsx (active PoV-focused), EnhancedTerminal.tsx (SecOps-focused), UnifiedTerminal.tsx (RBAC)
- Commands: hosting/lib/commands.tsx (core), hosting/lib/commands-ext.tsx (extended) plus specialized command modules
- Registry: hosting/lib/command-registry.ts
- Notes:
  - Several commands render stubs (theme, ai placeholder) and are flagged Not yet implemented (see roadmap)

Authentication & App State
- Auth: contexts/AuthContext.tsx and lib/firebase/client.ts
- Route guards: hooks/useAuthGuard.ts
- App state: contexts/AppStateContext.tsx (breadcrumbs, notifications), useActivityTracking.ts

DataConnect Usage
- Generated: hosting/src/dataconnect-generated/* (also duplicated in functions and cloud-functions)
- Recommendation: centralize schema and codegen (see DATACONNECT_RECOMMENDATIONS.md)

End-to-end Acceptance (current)
- Static export only; SPA rewrites to /index.html
- Functions used selectively; scenario flow supports simulation mode
- BigQuery exporter function used via HTTP; table is created on first export; schema expansion handled in code
