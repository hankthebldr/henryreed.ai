# Credentials Manager Design (User-Centric, Multi-Key, Genkit-Compatible)

Objectives
- Provide per-user credential storage with CRUD, supporting multiple providers and key combinations
- Keep secrets out of the client; store only references and metadata in Firestore
- Integrate with Google Secret Manager and support Genkit secrets

Data Model
- Collection: `users/{uid}/credentials/{id}`
```
{
  id: string,
  provider: 'xsiam'|'vertex'|'genkit'|'bq'|'custom',
  name: string,
  keysRef: string, // Secret Manager resource name (projects/{p}/secrets/{name}/versions/latest)
  metadata?: {
    region?: string,
    labels?: Record<string,string>
  },
  status: 'valid'|'invalid'|'unknown',
  isDefault?: boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastUsedAt?: Timestamp
}
```

Secret Payloads (typed unions)
```json
// XSIAM
{
  "provider": "xsiam",
  "apiAddress": "https://api.xdr.tenant.com",
  "apiId": "...",
  "apiKey": "...",
  "tenantName": "...",
  "region": "..."
}

// Vertex/Genkit
{
  "provider": "vertex",
  "projectId": "...",
  "location": "us-central1",
  "serviceAccountKey": { /* full SA JSON or ref */ }
}

// BigQuery
{
  "provider": "bq",
  "projectId": "...",
  "dataset": "...",
  "serviceAccountKey": { /* optional */ }
}
```

API Endpoints (HTTP)
- POST /api/v1/credentials — create (validates, stores secret in GSM, writes doc)
- GET /api/v1/credentials — list (returns metadata only)
- GET /api/v1/credentials/:id — details (no secret values)
- PATCH /api/v1/credentials/:id — update metadata or rotate keys
- DELETE /api/v1/credentials/:id — delete doc and destroy secret (optionally keep previous versions)

Validation & Security
- Validate formats per provider (zod)
- On create/update: test connection where possible (e.g., XSIAM health)
- Never return secret values; only metadata and keysRef
- RBAC: only the owner (uid) can CRUD
- Audit logs: write to `audit_logs` on create/update/delete/use

Genkit Secret Handling
- Map Genkit-required secret names to user-level or project-level secrets
- Loader module in functions/ai resolves keysRef → value at runtime
- Optionally allow admin-level project secrets with org-wide scope

Multiple Key Combinations
- Store provider-specific key objects in a single JSON payload in Secret Manager
- Support naming profiles (e.g., name = "primary", "backup-us-east") and mark isDefault

Rotation & Lifecycle
- Use new secret versions on rotation; update keysRef version or secret name
- Track lastUsedAt; warn if stale

Client UX Hooks
- UI components read list of credentials (metadata) for selection
- Secret values never touch the client; all sensitive calls go via functions proxy
