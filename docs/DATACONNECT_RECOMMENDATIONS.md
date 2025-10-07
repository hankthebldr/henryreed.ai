# DataConnect Recommendations

Objectives
- Centralize schema and codegen to avoid drift and duplication
- Use typed access where it improves safety; avoid shipping heavy generated bundles to the client
- Preserve static export constraints in Next.js

Source of Truth
- data/dataconnect/schema.yaml — single schema for collections/queries/models

Code Generation Targets
- packages/shared/dataconnect/web — ESM target with tree-shakeable exports for the browser
- packages/shared/dataconnect/functions — CJS/ESM target for functions

Build Strategy
- Generate in CI (on build) and check in artifacts to avoid dev friction
- Version the schema; emit version.json for cache busting

Client Usage (Web)
- Prefer narrow, paginated queries
- Dynamically import only the specific generated modules you need
- Memoize results (SWR) with TTL based on NEXT_PUBLIC_DB_CACHE_TTL
- Use Firestore indexes; include index definitions alongside schema

Server Usage (Functions)
- Prefer server-side aggregations for heavy queries
- Expose API endpoints that return just-enough data for the UI

Performance Guardrails
- Avoid N+1 reads; batch where possible
- Prefer composite indexes for list views
- Do not bundle entire generated client into the main web chunk — code-split

Environment & Emulators
- Provide emulator mapping for DataConnect in firebase.json
- Respect NEXT_PUBLIC_USE_EMULATOR in the web app and use local ports

Developer Workflow
- Make schema changes in schema.yaml
- Run `npm run dataconnect:generate` to refresh both web/functions targets
- Review generated diffs; commit with message `dataconnect: gen for schema vX.Y`
