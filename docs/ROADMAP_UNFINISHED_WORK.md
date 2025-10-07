# Roadmap of Unfinished or Partially Implemented Work

This roadmap summarizes work that exists in this repository as scaffolding, stubs, or partial implementations, and proposes next steps.

Global
- Consolidated Functions: Multiple functions codebases exist (functions/, henryreedai/, hosting/cloud-functions/bigquery-export). Plan to merge under services/functions with unified API (see MIGRATION_PLAN.md).
- Unified Firebase Config: Root firebase.json and hosting/firebase.json both exist. Adopt infra/firebase.unified.json when apps/web migration completes.
- DataConnect Duplication: Generated artifacts live in multiple places (hosting/src/dataconnect-generated, functions/src/dataconnect-generated, hosting/cloud-functions/bigquery-export/src/dataconnect-generated). Centralize schema and generation (see DATACONNECT_RECOMMENDATIONS.md).
- Remote Config: hosting/remoteconfig.template.json exists; web app does not fully integrate Remote Config reading. Add client hooks and feature flags.

Scenario Engine
- Functions/Simulation Toggle: scenario flow supports simulation fallback; wire all generate/deploy/validate/export/destroy endpoints to unified API and persist deployment state in Firestore instead of in-memory map.
- Validation Outputs: Expand validation summary to include detection coverage %, mapped MITRE techniques, and downloadable artifacts; export via unified BQ schema.
- Templates: Ensure all ScenarioType templates in scenario-types.ts are reflected in UI and docs; add provider-specific options.

POV Management
- AI Analysis: dc-ai-client hooks exist; finalize integration with functions/ai endpoints; persist analysis results with DataConnect/Firestore.
- Reporting: pov report in terminal/UI references deliverables; add export routine (PDF/JSON) from functions and link in UI.
- Metrics: pov metrics command/UI should consume unified BQ tables; add parameterized time ranges.

TRR Management
- Backend Handlers: functions/src/index.ts lists TODOs for TRR export and signoff. Implement functions modules for trrExport (PDF/JSON) and trrSignoff (blockchain) and connect UI flows.
- Evidence Store: Define Storage bucket structure and metadata for TRR evidence; link evidence references to TRR items.
- CSV Import UX: Enhance error reporting and preview before import commit.

Content Hub
- Export: Standardize export flows to Storage signed URLs; log to unified BQ events; add batch export.
- Analytics: Build server-side aggregation endpoints for top content, usage by category, rating trends.

XSIAM Integration
- Credentials Store: Current approach stores encrypted credentials on client; migrate to Secret Manager via credentials API with per-user Firestore metadata.
- Proxy Endpoints: Add server-side proxy to XSIAM API for sensitive operations; add caching and rate limiting; validate tenant health endpoint.

BigQuery Export
- Idempotency: Exporter assigns IDs per record; add upsert or MERGE to avoid duplicate rows.
- Schema Evolution: Move to canonical schema in docs/BIGQUERY_SCHEMA.md; create views for domain-specific analytics (trr, scenario, content).
- Access Control: Confirm service account roles per env (Data Editor, Job User). Parameterize dataset/table per env.

Terminal System
- Not Yet Implemented Commands:
  - commands-ext.tsx: theme (placeholder), ai (placeholder), clear/logout/exit are handled in component but no side effect in handler; detect is a stub event output.
- Registry Extraction: Optionally move command sets into packages/commands for code-splitting and easier testing.

Testing & Quality
- E2E: Playwright suite exists; many smoke reports generated. Stabilize authentication flows; add CI runs against preview channel.
- Unit: Add unit tests in services/functions for each module (scenario, trr, content, bq, xsiam).
- Observability: Add structured logs and error correlation IDs; GA4 Web Vitals in the client.

Infra & CI/CD
- Multi-env: Adopt infra/.firebaserc.sample with dev/stage/prod; add GH Actions to deploy Hosting/Functions to preview channels on PRs.
- Secrets: Use Secret Manager for XSIAM, Vertex/Genkit, BigQuery, and other sensitive configs; prohibit plaintext secrets.

Priorities (Suggested)
1) Consolidate Functions (services/functions), wire /api/v1/* endpoints and callable mirrors
2) Migrate BigQuery exporter and unify schema (events_all)
3) Implement credential manager (Firestore + Secret Manager) and migrate XSIAM creds usage
4) Replace scenario simulation paths with real endpoints and Firestore state
5) Implement TRR export/signoff endpoints and wire UI
6) Adopt unified firebase config and migrate hosting → apps/web
7) CI/CD with preview channels, secrets, tests
