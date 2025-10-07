# Migration Plan → cortex-dc-web

Destination repository
- /Users/henry/Github/Github_desktop/cortex-dc-web

Goals
- Consolidate all Cloud Functions into a single, scalable codebase with a consistent API surface
- Keep Next.js as a static app (no SSR) deployed via Firebase Hosting
- Introduce a common event schema across modules for unified BigQuery export keyed by user
- Implement a user-centric credential manager supporting multiple key combos and Genkit/Vertex secrets
- Preserve current app behavior; provide shims and do not delete legacy code immediately

Proposed Repository Layout
- apps/
  - web/               # Next.js static app (current hosting/ content)
- services/
  - functions/         # Consolidated Firebase Functions (Node 20)
    - src/
      - app.ts         # Express app (HTTP API)
      - callable.ts    # Callable wrapper exports
      - common/        # middleware, types, response helper, auth, errors
      - modules/
        - scenario/    # generate, deploy, status, validate, export, destroy
        - trr/         # validate, evidence, signoff, export
        - content/     # export/sign URLs; analytics ingest (optional)
        - bq/          # exportToBigQuery (migrated from hosting/cloud-functions)
        - xsiam/       # proxy endpoints; health
        - ai/          # aiTrrSuggest, detection-generation (Genkit/OpenAI)
      - index.ts       # Firebase entrypoints: api (onRequest), callable names
    - package.json     # functions package
    - tsconfig.json
- packages/
  - shared/            # shared types, utils, clients
    - src/
      - types/         # TRR, Scenario, Content, XSIAM, Events
      - clients/       # api-client, storage, logger, firebase web client helpers
      - dataconnect/   # generated typings (see data/dataconnect)
  - commands/          # terminal command registry bundles (optional extraction)
- data/
  - dataconnect/
    - schema.yaml      # single schema source of truth
    - codegen.config   # codegen targets for web/functions
- infra/
  - firebase.json      # single unified config
  - .firebaserc        # dev/stage/prod aliases
  - functions.env      # local env mapping for functions

Functions Consolidation Plan
- Merge sources:
  1) henryreed.ai/functions → services/functions/src/modules/{trr,scenario,ai}
  2) henryreed.ai/henryreedai (Genkit) → services/functions/src/modules/ai (and configure Secret Manager)
  3) hosting/cloud-functions/bigquery-export → services/functions/src/modules/bq/http/exportToBigQuery.ts
- API Surface (HTTP): /api/v1/{domain}/{action}
  - scenario: POST /api/v1/scenario/generate|deploy|status|validate|export|destroy
  - trr: POST /api/v1/trr/validate|evidence|signoff|export
  - content: POST /api/v1/content/export, GET /api/v1/content/signed-url
  - bq: POST /api/v1/bq/export, GET /api/v1/bq/health
  - xsiam: POST /api/v1/xsiam/credentials, GET /api/v1/xsiam/health, POST /api/v1/xsiam/query
  - ai: POST /api/v1/ai/trr-suggest, POST /api/v1/ai/generate-detection
- API Surface (Callable): mirror critical actions for auth-bound use: scenarioDeploy, trrValidate, aiTrrSuggest, etc.
- Standard Response Shape
  {
    "success": boolean,
    "data"?: any,
    "error"?: { "code": string, "message": string, "details"?: any },
    "timestamp": string,
    "requestId": string
  }
- Common Middleware
  - CORS (strict allowlist with preview + prod hosts)
  - Helmet
  - Rate limiter (rate-limiter-flexible)
  - Auth (Firebase ID token) where required
  - Input validation (zod schemas per endpoint)
  - Logger (winston) with structured logs

Next.js App Migration
- Move henryreed.ai/hosting → apps/web
  - Keep next.config.ts (output: 'export', trailingSlash, images.unoptimized, distDir: 'out')
  - Update any imports referencing hosting/ paths to packages/shared as we extract common code
  - Keep SPA rewrites in unified firebase.json

Client Libraries Updates
- Replace existing lib/cloud-functions-api.ts base URL with env var NEXT_PUBLIC_FUNCTIONS_BASE_URL (already present), pointing to /api
- Ensure all libs call the new /api/v1/{domain}/{action} endpoints or callable equivalents
- Keep legacy wrapper functions temporarily with comments pointing to the new endpoints (no deletions)

BigQuery Export Unification
- Use a canonical Events table (see docs/BIGQUERY_SCHEMA.md) across modules
- Move exporter to services/functions/modules/bq + expose POST /api/v1/bq/export
- Add idempotency key (id) and table clustering on user_id,event_type; partition on timestamp

Credential Manager Implementation (User-centric)
- Data model: users/{uid}/credentials/{id}
  {
    id: string,              // doc id
    provider: 'xsiam'|'vertex'|'genkit'|'bq'|'custom',
    name: string,            // user-friendly
    keysRef: string,         // Secret Manager resource name
    metadata: { region?: string, labels?: Record<string,string> },
    status: 'valid'|'invalid'|'unknown',
    isDefault?: boolean,
    createdAt: Timestamp,
    updatedAt: Timestamp,
    lastUsedAt?: Timestamp
  }
- Secrets: Store actual keys in Secret Manager; only store keysRef in Firestore
- CRUD API: POST/GET/PATCH/DELETE /api/v1/credentials (server-side validation & masking)
- Support multiple key combinations by storing an object in the secret payload with typed unions per provider (see docs/CREDENTIALS_MANAGER_DESIGN.md)
- Genkit Secrets: map Genkit-required secret names to keysRef and load in module/ai at runtime

DataConnect Centralization
- Single schema at data/dataconnect/schema.yaml
- Generate targets:
  - packages/shared/dataconnect/web
  - packages/shared/dataconnect/functions
- Enable code-splitting for web, and rely on server-side access for expensive queries
- Index management documented and validated in CI

CI/CD
- GitHub Actions:
  - pr.yml: install, build, test (web+functions), generate docs (optional), deploy preview (hosting+functions) with channel per PR
  - main.yml: deploy to staging; manual promotion to prod
- Firebase Targets: dev/stage/prod in .firebaserc; secrets provisioned via Secret Manager

Migration Steps (Phased)
1) Create repo skeleton (apps/web, services/functions, packages/shared, data/dataconnect, infra)
2) Copy hosting code → apps/web; adjust paths incrementally; keep shims in apps/web/lib for old paths
3) Move all functions into services/functions modules; normalize responses; add CORS/helmet/rate-limiter/auth/logger; wire Express api and callable
4) Implement credential manager (FireStore documents + Secret Manager); create endpoints
5) Move BigQuery exporter; apply unified schema; add idempotency and table creation logic if missing
6) Point web libs to new API base; test locally with emulators
7) Configure CI; deploy preview; run smoke tests
8) Cutover and leave deprecation comments in original repo until switched fully

No-Deletion Policy
- For each moved file, leave a stub with comments linking to the new module
- Add DEPRECATIONS.md to track mappings

Validation
- Follow docs/VALIDATION_CHECKLIST.md (to be produced) to verify: build, routing, scenarios (simulate/callable), TRR flows, content, XSIAM health, BigQuery export
