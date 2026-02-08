## Codebase Patterns

### Effect RPC Server Setup Pattern
The songmaking app follows the same pattern as my-artist-type for wiring up RPC:
1. Create `domain.ts` with merged RPC groups + middleware
2. In `server-handler.ts`, use `RpcServer.layerHttpRouter({ group: DomainRpc, path: "/api/rpc" })`
3. Provide handler layers: `CourseRpcLayer`, `RpcAuthenticationMiddlewareLive`, `AuthService.Default`, `RpcSerialization.layerNdjson`

### Progress Atom Architecture
- `progressStoreAtom` (Map) is the fast synchronous cache for UI
- `progressAtom` is a writable atom that updates the store AND fires server RPCs
- `useProgressSync()` hook in `CourseProvider` handles:
  - Loading server progress on mount (for authenticated users)
  - Setting a module-level `_serverSyncEnabled` flag for the atom writer
- Unauthenticated users get local-only progress (no server calls)

### Module-Level Sync Flag Pattern
When atom writers need to fire side effects conditionally (e.g., only when authenticated), use a module-level flag set by a React hook. This avoids threading React context into pure atom code.

---

## 2026-02-08 - ethos-17x.9
- Implemented server-side user progress persistence for the songmaking app
- Files changed:
  - `apps/songmaking/src/features/core/server/server-handler.ts` - Added RPC router with CourseRpcLayer
  - `apps/songmaking/src/features/core/server/domain.ts` - New: Domain RPC group with auth middleware
  - `apps/songmaking/src/features/course/client/course-atoms.ts` - Added server sync to progress atom writer
  - `apps/songmaking/src/features/course/client/use-progress-sync.ts` - New: Progress sync hook
  - `apps/songmaking/src/features/course/client/course-context.tsx` - Mount sync hook in CourseProvider
  - `packages/course/package.json` - Added `./rpc` export path for CourseRpcGroup
- **Learnings:**
  - The @course package already had full server infrastructure (db table, repo, service, RPC handlers, client atoms) - only needed wiring
  - The songmaking app had NO RPC router at all - only health check and Better Auth routes
  - The `RpcAuthenticationMiddleware` allows anonymous access (returns "anonymous" userId) - individual handlers check auth
  - Consumer components needed ZERO changes - the progressAtom Map interface stayed the same
  - `ProgressClient.Default` provides the layer needed for `Effect.runPromise` in browser context
---
