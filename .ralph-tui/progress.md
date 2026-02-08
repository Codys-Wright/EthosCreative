# Progress

## Codebase Patterns

### Quiz Data Model Pattern
- Inline quiz questions stored as JSONB on `LessonPart` via `quizQuestions: S.optional(S.NullOr(S.parseJson(S.Array(CourseQuizQuestion))))`
- Follow same pattern as `downloadFiles` - JSONB array alongside the part
- `CourseQuizQuestion` supports `multiple-choice` and `true-false` types with `QuizOption` (id, text, isCorrect)
- Quiz results tracked separately via `quizResultsAtom` keyed by partId

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

### Verification
- All 52 tests pass: `cd apps/songmaking && npx vitest run`
- oxlint clean: 0 warnings, 0 errors
- TypeScript: Only pre-existing server-handler.ts error (not from our changes)

## 2026-02-08 - ethos-17x.11
- Implemented quiz lesson parts: data model, quiz-taking UI, scoring, results, retaking, and admin quiz builder
- Files changed:
  - `packages/course/src/features/lesson-part/domain/schema.ts` - Added `CourseQuizQuestion`, `QuizOption`, `QuizQuestionType` schemas and `quizQuestions` field to `LessonPart`, `CreateLessonPartInput`, `UpdateLessonPartInput`
  - `apps/songmaking/src/data/course.ts` - Added inline quiz questions to the existing quiz lesson part (creative space knowledge check)
  - `apps/songmaking/src/routes/$courseSlug/lesson.$lessonId.tsx` - Replaced "Quiz Coming Soon" placeholder with interactive `QuizPlayer` component (answer selection, submission, scoring, correct/incorrect feedback, explanations, retake)
  - `apps/songmaking/src/features/course/client/course-atoms.ts` - Added `quizResultsAtom`, `QuizResultsUpdate`, `QuizPartResult`, `quizPartResultAtom` for per-part quiz result persistence
  - `apps/songmaking/src/routes/$courseSlug/admin.tsx` - Added `QuizEditorDialog` with full quiz builder UI (add/remove questions, set question type, mark correct answers, add explanations), edit button on quiz parts in `SortablePartItem`
- **Learnings:**
  - Inline JSONB quiz data (on LessonPart) is simpler than linking to external `@quiz` package for course knowledge checks - the `@quiz` package is survey-focused (no correct answers)
  - Effect Schema `S.parseJson(S.Array(...))` pattern requires `JSON.stringify()` when providing mock data
  - Threading props through nested admin components (ContentTab -> SectionColumn -> SectionLessonCard -> SortablePartItem) requires updating each component's interface
  - Pre-existing lint issues in lesson viewer and admin files (unused imports like Clock, Home, Music, etc.) should not be fixed as part of unrelated changes
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
