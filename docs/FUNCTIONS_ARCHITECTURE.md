# Functions Architecture (Unified)

Objectives
- Single functions codebase (Node 20) with consistent HTTP and Callable APIs
- Common middleware (CORS, helmet, auth, rate limiting, validation, logging)
- Standard JSON response envelope across all endpoints
- Clear module boundaries with scaffolding templates for new functions

Directory Structure (services/functions)
- src/
  - app.ts (Express app, router mounting, middleware)
  - callable.ts (exports of https.onCall wrappers)
  - common/
    - response.ts (ok/error helpers, requestId/timestamp injection)
    - auth.ts (Firebase ID token verification)
    - cors.ts, errors.ts, logger.ts, rateLimit.ts
    - types.ts (ApiResponse<T>, ErrorShape, UserContext)
  - modules/
    - scenario/handlers.ts (generate/deploy/status/validate/export/destroy)
    - trr/handlers.ts (validate/evidence/signoff/export)
    - content/handlers.ts (export/signed-url)
    - bq/handlers.ts (export, health)
    - xsiam/handlers.ts (credentials CRUD, health, proxy)
    - ai/handlers.ts (aiTrrSuggest, generateDetection)
  - index.ts (Firebase entrypoints: api onRequest(app), callable names)

Response Envelope
```
{
  success: boolean,
  data?: any,
  error?: { code: string, message: string, details?: any },
  requestId: string,
  timestamp: string
}
```

Input Validation
- zod schemas per endpoint (e.g., ScenarioDeployRequest)
- Convert validation errors to error.code = 'invalid-argument'

Auth
- For protected endpoints, require ID token (Authorization: Bearer)
- Attach uid and user claims to request context

CORS
- Allowlist: localhost (emulators), preview channel domains, production domain
- Preflight OPTIONS handled globally

Rate Limiting
- rate-limiter-flexible (memory or Redis if needed), keyed by uid/IP

Logging
- winston + structured logs; include requestId; redact secrets

Scaffolding Template (HTTP handler)
```ts path=null start=null
import { Request, Response } from 'express';
import { ok, err, withRequestMeta } from '../../common/response';
import { z } from 'zod';

const Req = z.object({ /* fields */ });

export async function doAction(req: Request, res: Response) {
  const meta = withRequestMeta(req);
  try {
    const body = Req.parse(req.body);
    // ... business logic
    return res.json(ok(meta, { /* data */ }));
  } catch (e: any) {
    return res.status(400).json(err(meta, 'invalid-argument', e.message));
  }
}
```

Callable Wrapper Pattern
```ts path=null start=null
import * as functions from 'firebase-functions';
import { callableWrap } from './common/callable';
import { z } from 'zod';

const Req = z.object({ /* fields */ });

export const scenarioDeploy = functions.region('us-central1').https.onCall(async (data, context) =>
  callableWrap(context, Req, async (input, user) => {
    // ... do work using input + user.uid
    return { success: true, data: {/* ... */} };
  })
);
```

Versioning & Namespacing
- URL: /api/v1/{domain}/{action}
- Callable: {domain}{Action} (camelCase)

Observability & Resilience
- Add retries for transient failures (BigQuery inserts)
- Health endpoints for bq/xsiam/ai modules

Security
- Secrets via Google Secret Manager (no plaintext in code or env)
- Parameterize project/region via env; do not echo secrets in logs
