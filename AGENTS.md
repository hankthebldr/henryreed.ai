# Repository Guidelines

## Project Structure & Module Organization
- `hosting/` houses the Next.js portal (`app/`, `components/`, `tests/`) and branding scripts; this is the customer-facing surface.
- `functions/` contains Firebase Cloud Functions (`src/routes`, `handlers`, `ai`) compiled to `lib/` and consuming generated Dataconnect models from `src/dataconnect-generated`.
- `src/` stores shared React components and configuration imported by both runtime packages via `file:` dependencies.
- `functions-shared/` and `dataconnect/` provide shared utilities and generated APIs; avoid editing any `*generated` files directly.
- `docs/`, `k8s/`, `scripts/`, and `deploy*.sh` hold architecture notes and automation—keep them aligned with feature work.

## Build, Test, and Development Commands
- Frontend: `cd hosting && npm install && npm run dev` for local work, `npm run build` for production, and `npm run validate` before PRs.
- Functions: `cd functions && npm install && npm run build` to emit `lib/`, `npm run serve` for the Firebase emulator suite, and `npm run deploy` when shipping.
- Release helpers: `./deploy-test.sh` validates staging environments and `./deploy.sh` promotes to production; both expect Firebase CLI credentials.

## Coding Style & Naming Conventions
- TypeScript across packages with 2-space indentation, 100-character lines, semicolons, and single quotes enforced by Prettier/ESLint (`npm run lint`, `npm run lint:fix`).
- React components live in PascalCase files (`src/components/branding/BrandedButton.tsx`); hooks and utilities are camelCase. Tailwind utility classes should stay small and composable.
- Cloud Functions route files remain lowercase (e.g., `routes/trr.ts`) and export `Router` instances like `trrRouter`; align filenames with REST paths and colocate validation schemas.

## Testing Guidelines
- Frontend unit tests run with Jest: `cd hosting && npm run test`. Playwright suites live in `hosting/tests/` and run via `npm run test:e2e` or `npm run test:smoke`; review failure artifacts in `hosting/test-results/`.
- Functions rely on `ts-jest`: `cd functions && npm run test`. Coverage reports land in `functions/coverage/`; keep new logic instrumented and store fixtures beside the source they exercise.
- Emulator sessions must respect `firestore.rules`; load seed data before e2e runs so generated models resolve consistently.

## Commit & Pull Request Guidelines
- Use concise Conventional-Commit prefixes (`feat:`, `fix:`, `chore:`) as seen in the history; avoid generic “update” messages.
- PRs should include a summary, linked issues, affected Firebase resources, and UI screenshots or emulator logs when behavior changes.
- Verify `npm run validate` (hosting) and `npm run build`/`npm run test` (functions) before review, and call out skipped checks.
