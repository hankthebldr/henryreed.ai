# apps/web

This directory will host the migrated Next.js static app from `hosting/`.

Plan
- Phase 1: Keep `hosting/` as the deployment source while we prepare this structure.
- Phase 2: Copy `hosting/` content into `apps/web` and update imports to use packages/shared.
- Phase 3: Update unified `infra/firebase.json` to point Hosting public dir at `apps/web/out`.

Notes
- Do not delete `hosting/` yet. Leave shims/comments in legacy paths during/after migration.
- Keep `next.config.ts` configured for static export: `output: 'export'`, `trailingSlash: true`, `images.unoptimized`.
