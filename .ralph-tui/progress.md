## Codebase Patterns
- **Effect `it.layer()` shares state within a block**: When using `@effect/vitest`'s `it.layer(SomeLive)('name', (it) => { ... })`, all tests within the callback share the same layer instance. For stateful services (like those backed by `Ref`), use unique IDs/names per test to avoid cross-contamination, or use separate `it.layer()` blocks for test isolation.
- **Schema.Class must use `new` constructor**: Plain object literals typed as `Schema.Class` types won't pass validation when used as nested properties in other `Schema.Class` constructors. Always use `new ClassName({...})` to construct instances.
- **Vitest aliases needed for `@sse` / `@chat`**: These packages require manual aliases in `vitest.shared.js` (like other `@<package>` aliases) because `vite-tsconfig-paths` doesn't always resolve them correctly for test imports.

---

## 2026-02-08 - ethos-17x.18
- What was implemented:
  - Unit tests for `@sse` package: domain schema (12 tests), server hub (11 tests), SSE response helpers (4 tests)
  - Unit tests for `@chat` package: ChatHub (19 tests), ChatService (19 tests)
  - Total: 65 tests across 5 test files, all passing
  - Added `@sse` and `@chat` aliases to `vitest.shared.js` for test module resolution
  - Fixed bug in `chat-service.ts` where `ChatMessage` and `ChatUser` were constructed as plain objects instead of Schema.Class instances, causing `MessageSentEvent` construction to fail
- Files changed:
  - `vitest.shared.js` (added @sse/@chat aliases)
  - `packages/sse/src/domain/schema.test.ts` (new)
  - `packages/sse/src/server/sse-hub.test.ts` (new)
  - `packages/sse/src/server/sse-response.test.ts` (new)
  - `packages/chat/src/server/chat-hub.test.ts` (new)
  - `packages/chat/src/server/chat-service.test.ts` (new)
  - `packages/chat/src/server/chat-service.ts` (bug fix: Schema.Class construction)
- **Learnings:**
  - `@effect/vitest` `it.effect()` runs Effect programs as tests; `it.layer()` provides a service layer shared across tests in that block
  - `Layer.effect` (used by `ChatServiceLive` and `ChatHubLive`) creates state once per layer provision, not per test - tests within the same `it.layer()` block share state
  - `oxlint`'s `no-standalone-expect` rule gives false positives for `@effect/vitest` generator-based tests (warnings, not errors)
  - The existing database repo tests (19 files) require testcontainers/PostgreSQL and are expected to fail without a running DB
---
