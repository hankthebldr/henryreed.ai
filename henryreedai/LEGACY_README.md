# Legacy Genkit Functions Codebase

This directory contains the original Genkit AI functions codebase (Node.js 20) used during earlier iterations.

Status: Legacy (Do Not Delete)

- Active API integration is consolidated under the primary Express API in `functions/src/index.ts`.
- The Gemini AI HTTP endpoint is now mounted at `/api/gemini` via the main `functions` codebase.
- Scenario HTTP endpoints are also exposed under `/api` for frontend compatibility.

Why keep this directory?
- Per project rules, we do not delete generated/created content. Keeping this directory preserves
  historical context and makes it easy to reference or migrate specific Genkit flows.

Next steps (optional):
- Migrate any remaining Genkit/Vertex AI function logic that you want to actively deploy into `functions/src/ai/`.
- Update documentation to reflect the consolidated deployment model (single codebase under `functions/`).

Note: No deployment happens from this directory unless explicitly added to `firebase.json`.