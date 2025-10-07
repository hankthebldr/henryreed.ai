# Restore Branch Regression Analysis

## Baseline Reference
- **Restore snapshot** (pre-regression): `hosting/hosting/` directory preserves the streamlined Firebase-authenticated build used on the restore branch.
- **Current working tree**: `hosting/` directory contains the redesigned Cortex DC Portal with mock authentication, expanded layout system, and terminal bridge.

## Authentication Layer Changes
- The restore branch relied on direct Firebase auth initialization without any mock credentials, providing a minimal but production-aligned flow. 【F:hosting/hosting/contexts/AuthContext.tsx†L1-L76】【F:hosting/hosting/lib/firebase.ts†L1-L18】
- Current implementation adds a proxy-based initializer with mock-mode fallbacks. While useful for local demos, it introduced state handling bugs (non-memoized callbacks) that caused repeated context re-renders and credential loss. 【F:hosting/lib/firebase-config.ts†L1-L79】【F:hosting/contexts/AuthContext.tsx†L1-L141】
- Resolution: reintroduced stable callbacks for `signIn`, `signUp`, `signInWithGoogle`, and `logout` so the provider no longer emits new function identities on every render, preserving session continuity across navigation. 【F:hosting/contexts/AuthContext.tsx†L103-L137】

## Layout & Terminal State Management
- Restore branch delivered a simpler layout without conditional wrappers or GUI/terminal orchestration, so state sharing issues were nonexistent. 【F:hosting/hosting/contexts/AuthContext.tsx†L1-L76】
- Modern branch added a comprehensive `AppStateContext` with terminal bridge integration, but nested hooks inside `useMemo` violated React rules and captured stale state, preventing terminal execution, GUI quick actions, and notification lifecycles from completing. 【F:hosting/contexts/AppStateContext.tsx†L1-L224】
- Fix: refactored the provider to maintain a live `stateRef`, create each action with `useCallback`, and memoize the exported API once. Terminal focus, command bridge dispatches, and RBAC checks now read the latest state while remaining deployment-safe. 【F:hosting/contexts/AppStateContext.tsx†L226-L375】

## Build & Deployment (Enhanced Webpack Path)
- Restore build shipped with default Next.js compilation and no static export configuration, aligning with Firebase Hosting defaults but lacking bundler optimizations. 【F:hosting/hosting/lib/firebase.ts†L1-L18】
- Current `next.config.ts` enables static exports and optional Webpack build workers gated behind `NEXT_ENABLE_WEBPACK_EXPERIMENTS=1`, matching Firebase Hosting requirements for the enhanced pipeline. 【F:hosting/next.config.ts†L1-L44】
- Recommendation: run `npm run build:exp` before `firebase deploy --only hosting` so the worker-enabled build executes when the environment variable is set.

## Front-End Regression Summary
- ✅ Restored predictable authentication callbacks and notification auto-dismiss timers.
- ✅ Repaired terminal command execution, GUI-triggered actions, and RBAC enforcement by removing invalid hook usage.
- ✅ Documented delta between restore and current branches to guide future hotfixes and Firebase deployment audits.

