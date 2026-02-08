## Codebase Patterns

### Effect Service Testing (No Database)
- Pure domain logic services like `AnalysisService` and `QuizTakerService` don't need testcontainers
- Use `ServiceName.Default` as the test layer directly
- For config-dependent services, use `ConfigProvider.fromMap()` + `Layer.setConfigProvider()`
- Per-test config overrides via `Effect.withConfigProvider()` inside the test body
- `Effect.exit` is useful when you need to check failure without narrowing error types (e.g. when schema validation fails at construction)

### QuizSession Type Narrowing
- `initializeSession` returns a literal type `{ responses: {}, logs: never[], ... }` which is narrower than `QuizSession`
- When reassigning session variables after mutations, type-annotate as `QuizSession` or cast with `as QuizSession`

### Quiz Editor Utils (Plain Functions)
- Use standard vitest `describe`/`it`/`expect` for non-Effect utility functions
- Use `as unknown as QuizId` for branded type casts in test fixtures

---

## 2026-02-08 - ethos-17x.3
- What was implemented:
  - 72 unit tests for the @quiz package across 3 new test files
  - `packages/quiz/src/features/analysis/domain/service.test.ts` (33 tests)
    - convertResponseQuestionIds: filtering, empty results, full matches
    - computeEndingPoints: exact match, distance falloff, primary/secondary, weightMultiplier, non-numeric skip, min floor, zero falloff, accumulation
    - computeAllEndingScores: percentage normalization, winner detection, sorting, threshold filtering, max results, zero scores, beta amplification
    - validateAnalysisInputs: empty responses, no endings, inactive engine, valid inputs
    - analyzeResponse: full analysis flow, winner identification, question filtering
    - analyzeWithValidation: valid + invalid inputs
    - getAnalysisSummary: empty results, distribution computation
    - disableSecondaryPoints: config toggle
  - `packages/quiz/src/features/active-quiz/domain/quiz-taker.service.test.ts` (19 tests)
    - initializeSession: empty session creation
    - selectAnswer: response recording, navigation log init, changed responses, action logging
    - navigateToQuestion: valid navigation, out-of-bounds, empty logs initialization
    - submitQuiz: submission log, completedAt, totalDurationMs
    - Helpers: getCurrentQuestion, canNavigateBack/Next, findQuizBySlug, getSavedResponse, getRandomCategoryColorClass
  - `packages/quiz/src/features/quiz/ui/quiz-editor/utils.test.ts` (20 tests)
    - getDisplayVersion: non-temp, temp drafts, sequential numbering, different versions
    - hasQuizChanged: no changes, question changes, description/subtitle changes, missing original, temp version detection
    - getTempBadgeColor: consistency, variety, valid CSS classes
    - artistTypes: count and expected values
    - getArtistTypeColorStyle/getArtistTypeTextStyle: CSS variable references
- Files changed:
  - packages/quiz/src/features/analysis/domain/service.test.ts (NEW)
  - packages/quiz/src/features/active-quiz/domain/quiz-taker.service.test.ts (NEW)
  - packages/quiz/src/features/quiz/ui/quiz-editor/utils.test.ts (NEW)
- **Learnings:**
  - Effect branded types (like `AnalysisResultId`) validate at construction time - `'summary' as AnalysisResultId` compiles but fails at runtime
  - The `AnalysisService.getAnalysisSummary()` has a bug: uses `'summary' as AnalysisResultId` which fails schema validation for the error constructor
  - `ConfigProvider.fromMap()` is the cleanest way to inject deterministic config values in tests
  - `Effect.withConfigProvider()` allows per-test config overrides without layer changes
  - Database tests (testcontainers) are pre-existing in the repo but require Docker; pure logic tests don't need it
---
