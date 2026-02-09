# Progress

## Codebase Patterns

### RPC Client Mutation Pattern
```
// 1. Create client (AtomRpc.Tag)
export class FooClient extends AtomRpc.Tag<FooClient>()('@pkg/FooClient', {
  group: FooRpc,
  protocol: RpcProtocol,
}) {}

// 2. Create mutation atom (Client.runtime.fn)
export const updateFooAtom = FooClient.runtime.fn<{ id: FooId; input: UpdateFooInput }>()(
  Effect.fnUntraced(function* ({ id, input }) {
    const client = yield* FooClient;
    return yield* client('foo_update', { id, input });
  }),
);

// 3. Use in component
const updateFoo = useAtomSet(updateFooAtom);
await updateFoo({ id, input });
```

### Feature Index Export Pattern
- Feature `index.ts` files ONLY export domain code (safe for client bundle)
- Client code is imported via direct path: `@course/features/lesson-part/client/index.js`
- Server code is imported via `@course/server`
- This prevents bundling pg/server code into the client

## ethos-17x.16: US-016 - Add component tests for songmaking app

**Status**: Complete

### What was done
- Configured vitest with jsdom environment (`apps/songmaking/vitest.config.ts`)
- Created test setup file with jest-dom matchers (`apps/songmaking/src/__tests__/setup.ts`)
- Created shared test helpers with mock data factories (`apps/songmaking/src/__tests__/helpers.tsx`)
- Added testing dependencies to songmaking and root package.json

### Test files created (7 files, 52 tests)
1. **course-overview.test.tsx** (7 tests) - Hero section, navbar, section/lesson counts, curriculum, CTA
2. **dashboard.test.tsx** (9 tests) - Hero, quick stats, lesson count, content browser, community, sidebar, sections, messaging cards
3. **lesson-viewer.test.tsx** (8 tests) - Lesson title, section header, parts, type badges, mark complete, navigation, sidebar, TOC
4. **course-sidebar.test.tsx** (8 tests) - Course title, nav links, sections, content label, lessons, active highlighting, progress, sign-in
5. **admin-dashboard.test.tsx** (6 tests) - Course title, admin label, tab triggers, preview button, overview content, activity feed
6. **lesson-editor.test.tsx** (6 tests) - Lesson title, section name, part list, type badges, lesson parts heading, sidebar
7. **messaging.test.tsx** (8 tests) - Header, channels, course channels, DMs, empty state, new message button, chat area, SSE connection

### Key patterns
- TanStack Router file-based routes: Mock `createFileRoute`, access component via `(mod.Route as any)?.component`
- Effect Atom hooks: Return static values from `useAtomValue`/`useAtomSet` mocks
- Branded types: Use `as unknown as Type` for mock data with Effect Schema branded IDs
- Compound shadcn components: Mock with `Object.assign(Component, { SubComponent })`
- Result.builder pattern: Mock fluent chain `.onInitial().onSuccess().onFailure().render()` with state-tracking object
- motion/react mock: Create vitest alias to mock file for packages not installed in worktree

### Verification
- All 52 tests pass: `cd apps/songmaking && npx vitest run`
- oxlint clean: 0 warnings, 0 errors
- TypeScript: Only pre-existing server-handler.ts error (not from our changes)

## 2026-02-08 - ethos-17x.10
- **What was implemented:** Admin save operations - lesson editor persistence, content tab persistence, settings tab persistence
- **Files changed:**
  - `packages/course/src/rpc.ts` - Added LessonPartRpc to CourseRpcGroup export
  - `packages/course/src/features/lesson-part/client/client.ts` - New: LessonPartClient RPC client
  - `packages/course/src/features/lesson-part/client/atoms.ts` - New: CRUD + reorder mutation atoms
  - `packages/course/src/features/lesson-part/client/index.ts` - New: barrel export
  - `packages/course/src/features/lesson/client/atoms.ts` - Added reorderLessonsAtom
  - `packages/course/src/features/section/client/atoms.ts` - Added reorderSectionsAtom
  - `apps/songmaking/src/routes/__root.tsx` - Added Toaster component for toast notifications
  - `apps/songmaking/src/routes/lesson_.$lessonId.edit.tsx` - Wired lesson editor save to RPC (create/update/delete/reorder parts)
  - `apps/songmaking/src/routes/$courseSlug/admin.tsx` - Wired content tab save (lesson/part CRUD + reorder) and settings tab save (course update/publish/archive)
- **Learnings:**
  - LessonPartRpc was included in server-side CourseRpcLayer but missing from client-side CourseRpcGroup export
  - Feature index.ts files only export domain code; client code must be imported via direct path (`@course/features/*/client/index.js`)
  - Mutation atoms use `Client.runtime.fn<InputType>()(Effect.fnUntraced(...))` pattern, consumed via `useAtomSet`
  - Save orchestration order matters: delete first, then create (to get real IDs), then update, then reorder
  - Sonner toast is already installed in @shadcn but Toaster component needs to be added to root layout
  - oxlint improved from 66 to 52 errors (cleaned up unused imports in files we touched)
---

## 2026-02-08 - ethos-17x.20
- Created `CLAUDE.md` at repo root — comprehensive project guide for AI assistants
- Files changed:
  - `CLAUDE.md` (new) — Documents monorepo structure, commands, vertical slice architecture, Effect-TS patterns (Schema, Service, RPC, Atom, SQL), database setup, testing conventions, deployment config, UI conventions, and references to @example package READMEs
- **Learnings:**
  - CLAUDE.md should reference `@example` package READMEs rather than duplicate their content — keeps documentation DRY and maintainable
  - Pre-existing typecheck errors in `packages/ui/theme/` are due to missing node_modules in worktrees, not actual code issues
  - Pre-existing oxlint errors (45 warnings, 237 errors) across the codebase are not related to documentation changes
---

## 2026-02-08 - ethos-17x.4
- Added unit tests for @artist-types package covering domain, data loading, service, and RPC layers
- Files created:
  - `packages/artist-types/src/domain/schema.test.ts` (18 tests) - ArtistTypeId branding, ARTIST_TYPE_IDS validation, isValidArtistTypeId, normalizeArtistTypeId, ArtistTypeNotFoundError, ArtistTypeMetadata schema validation
  - `packages/artist-types/src/database/data/index.test.ts` (19 tests) - Seed data loading (getAllArtistTypeSeedData, getArtistTypeSeedData, getArtistTypeSeedDataBySlug, getArtistTypeSeedDataByOrder), sync variants, data integrity (unique IDs, unique orders, all required fields)
  - `packages/artist-types/src/server/live-service.test.ts` (8 tests) - ArtistTypeService list/getById/getBySlug/invalidateCache, error propagation, slug normalization (DB-dependent via testcontainers)
  - `packages/artist-types/src/server/rpc-live.test.ts` (5 tests) - RPC layer construction, handler routing through service, error propagation (DB-dependent via testcontainers)
- **Total**: 50 new tests (37 pure unit + 13 DB-dependent via testcontainers)
- **Learnings:**
  - Effect Schema `S.Class` validation errors use `"is missing"` text for required fields — not the `"Expected"` pattern from plain schemas
  - `ArtistTypeService.DefaultWithoutDependencies` can be combined with `ArtistTypesRepo.DefaultWithoutDependencies` and `PgTest` to create a full test layer
  - The `normalizeArtistTypeId` function has edge cases with partial formats (e.g., "the-visionary" without "-artist" suffix gets double-wrapped) — documented in tests
  - Pre-existing typecheck errors in artist-types/core/server/runtime.ts (Layer type mismatch) — not from our changes
---

## 2026-02-08 - ethos-17x.5
- Implemented component tests for my-artist-type app
- Files created:
  - `apps/my-artist-type/vitest.config.ts` - Vitest config with jsdom, path aliases, and motion/react mock alias
  - `apps/my-artist-type/src/__tests__/setup.ts` - jest-dom matchers + window.matchMedia mock for jsdom
  - `apps/my-artist-type/src/__tests__/mocks/motion-react.ts` - Mock for motion/react (strips animation props, renders simple DOM)
  - `apps/my-artist-type/src/__tests__/landing-page.test.tsx` (15 tests) - Hero section, explore artist types, footer
  - `apps/my-artist-type/src/__tests__/quiz-route.test.tsx` (2 tests) - Quiz page + pending skeleton
  - `apps/my-artist-type/src/__tests__/results-page.test.tsx` (6 tests) - URL decode, error states, valid results
  - `apps/my-artist-type/src/__tests__/admin-dashboard.test.tsx` (9 tests) - Sidebar, stats, charts, table, auth gate
  - `apps/my-artist-type/src/__tests__/artist-type-detail.test.tsx` (6 tests) - Detail page + catalog page
  - `apps/my-artist-type/src/__tests__/auth-route.test.tsx` (4 tests) - Auth view rendering, centered layout
  - `apps/my-artist-type/src/__tests__/navbar.test.tsx` (8 tests) - Nav links, quiz button, admin link, auth buttons
- **Learnings:**
  - `window.matchMedia` not available in jsdom - mock in setup.ts for useSyncExternalStore-based responsive hooks
  - `motion/react` package not installed in worktree - vitest `resolve.alias` to mock file is cleaner than per-test vi.mock
  - Result.builder fluent chain from @effect-atom requires careful mock implementation to track rendered state across chained calls
  - Testing Library `getByText` vs `getAllByText` matters when same text appears in hero + footer (e.g., "Discover your")
  - Pre-existing typecheck errors in packages (motion/react, culori, @tabler/icons-react, opentelemetry) are not from test changes
---
