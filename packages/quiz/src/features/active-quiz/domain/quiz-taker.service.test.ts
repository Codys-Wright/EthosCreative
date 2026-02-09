// QuizTakerService Tests
// Tests for quiz session metadata handling, navigation, and response tracking

import { expect, it } from '@effect/vitest';
import * as Effect from 'effect/Effect';
import * as DateTime from 'effect/DateTime';
import type { Question } from '@quiz/features/quiz/questions/schema.js';
import type { QuizSession } from '@quiz/features/responses/domain/schema.js';
import type { Quiz, QuizId } from '@quiz/features/quiz/domain/schema.js';
import { QuizTakerService } from './quiz-taker.service.js';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const makeQuestion = (id: string, order: number): Question =>
  ({
    id,
    order,
    title: `Question ${id}`,
    data: { type: 'rating', minRating: 1, maxRating: 10, minLabel: 'Low', maxLabel: 'High' },
    metadata: null,
  }) as any;

const makeQuiz = (questionIds: string[]): Quiz =>
  ({
    id: crypto.randomUUID() as QuizId,
    version: { semver: '1.0.0', comment: 'test' },
    title: 'Test Quiz',
    questions: questionIds.map((id, i) => makeQuestion(id, i)),
    isPublished: true,
    isTemp: false,
    createdAt: DateTime.unsafeNow(),
    updatedAt: DateTime.unsafeNow(),
    deletedAt: null,
  }) as any;

const TestLayer = QuizTakerService.Default;

// ============================================================================
// TESTS: initializeSession
// ============================================================================

it.layer(TestLayer)('initializeSession', (it) => {
  it.effect('creates empty session with startedAt timestamp', () =>
    Effect.gen(function* () {
      const service = yield* QuizTakerService;
      const quiz = makeQuiz(['q1', 'q2', 'q3']);

      const session = yield* service.initializeSession(quiz);
      expect(session.responses).toEqual({});
      expect(session.logs).toEqual([]);
      expect(session.sessionMetadata.startedAt).toBeDefined();
    }),
  );
});

// ============================================================================
// TESTS: selectAnswer
// ============================================================================

it.layer(TestLayer)('selectAnswer', (it) => {
  it.effect('records a selection and updates responses', () =>
    Effect.gen(function* () {
      const service = yield* QuizTakerService;
      const quiz = makeQuiz(['q1', 'q2']);
      const initial = yield* service.initializeSession(quiz);

      const updated = yield* service.selectAnswer(initial as QuizSession, 'q1', 7);
      expect(updated.responses['q1']).toBe(7);
    }),
  );

  it.effect('adds initial navigation log on first selection', () =>
    Effect.gen(function* () {
      const service = yield* QuizTakerService;
      const quiz = makeQuiz(['q1', 'q2']);
      const initial = yield* service.initializeSession(quiz);

      const updated = yield* service.selectAnswer(initial as QuizSession, 'q1', 7);
      // First selection should add a navigation log entry + selection log entry
      expect(updated.logs.length).toBe(2);
      expect(updated.logs[0]!.type).toBe('navigation');
      expect(updated.logs[1]!.type).toBe('selection');
    }),
  );

  it.effect('does not add navigation log if logs already exist', () =>
    Effect.gen(function* () {
      const service = yield* QuizTakerService;
      const quiz = makeQuiz(['q1', 'q2']);
      const initial = yield* service.initializeSession(quiz);

      let session: QuizSession = yield* service.selectAnswer(initial as QuizSession, 'q1', 7);
      session = yield* service.selectAnswer(session, 'q2', 3);

      // 2 from first + 1 from second = 3
      expect(session.logs.length).toBe(3);
      expect(session.logs[2]!.type).toBe('selection');
    }),
  );

  it.effect('logs "changed response to" when updating an existing answer', () =>
    Effect.gen(function* () {
      const service = yield* QuizTakerService;
      const quiz = makeQuiz(['q1']);
      const initial = yield* service.initializeSession(quiz);

      let session: QuizSession = yield* service.selectAnswer(initial as QuizSession, 'q1', 5);
      session = yield* service.selectAnswer(session, 'q1', 8);

      // Should be the changed response action
      const lastLog = session.logs[session.logs.length - 1]!;
      expect(lastLog.action).toBe('changed response to');
      expect(lastLog.rating).toBe(8);
      expect(session.responses['q1']).toBe(8);
    }),
  );

  it.effect('logs "selected" for new answers', () =>
    Effect.gen(function* () {
      const service = yield* QuizTakerService;
      const quiz = makeQuiz(['q1']);
      const initial = yield* service.initializeSession(quiz);

      const session: QuizSession = yield* service.selectAnswer(initial as QuizSession, 'q1', 5);

      const selectionLog = session.logs.find((l) => l.type === 'selection');
      expect(selectionLog?.action).toBe('selected');
    }),
  );
});

// ============================================================================
// TESTS: navigateToQuestion
// ============================================================================

it.layer(TestLayer)('navigateToQuestion', (it) => {
  it.effect('adds navigation log when moving to a valid question', () =>
    Effect.gen(function* () {
      const service = yield* QuizTakerService;
      const quiz = makeQuiz(['q1', 'q2', 'q3']);
      const questions = quiz.questions!;
      const initial = yield* service.initializeSession(quiz);

      // Need to have logs already to avoid the init navigation
      let session: QuizSession = yield* service.selectAnswer(initial as QuizSession, 'q1', 5);
      const logsBefore = session.logs.length;

      session = yield* service.navigateToQuestion(session, 0, 1, questions);
      expect(session.logs.length).toBe(logsBefore + 1);
      expect(session.logs[session.logs.length - 1]!.type).toBe('navigation');
      expect(session.logs[session.logs.length - 1]!.questionId).toBe('q2');
    }),
  );

  it.effect('returns session unchanged for out-of-bounds target', () =>
    Effect.gen(function* () {
      const service = yield* QuizTakerService;
      const quiz = makeQuiz(['q1', 'q2']);
      const questions = quiz.questions!;
      const initial = yield* service.initializeSession(quiz);

      let session: QuizSession = yield* service.selectAnswer(initial as QuizSession, 'q1', 5);
      const logsBefore = session.logs.length;

      // Navigate to index 99 (out of bounds)
      session = yield* service.navigateToQuestion(session, 0, 99, questions);
      expect(session.logs.length).toBe(logsBefore); // No change
    }),
  );

  it.effect('adds initial navigation log if logs are empty', () =>
    Effect.gen(function* () {
      const service = yield* QuizTakerService;
      const quiz = makeQuiz(['q1', 'q2', 'q3']);
      const questions = quiz.questions!;
      const initial = yield* service.initializeSession(quiz);

      const updated = yield* service.navigateToQuestion(initial as QuizSession, 0, 1, questions);
      // Should have initial nav log + the actual navigation
      expect(updated.logs.length).toBe(2);
      expect(updated.logs[0]!.type).toBe('navigation');
      expect(updated.logs[1]!.type).toBe('navigation');
      expect(updated.logs[1]!.questionId).toBe('q2');
    }),
  );
});

// ============================================================================
// TESTS: submitQuiz
// ============================================================================

it.layer(TestLayer)('submitQuiz', (it) => {
  it.effect('adds submission log and sets completedAt', () =>
    Effect.gen(function* () {
      const service = yield* QuizTakerService;
      const quiz = makeQuiz(['q1', 'q2']);
      const initial = yield* service.initializeSession(quiz);

      let session: QuizSession = yield* service.selectAnswer(initial as QuizSession, 'q1', 5);
      session = yield* service.selectAnswer(session, 'q2', 8);

      const submitted = yield* service.submitQuiz(session);
      expect(submitted.sessionMetadata.completedAt).toBeDefined();
      expect(submitted.sessionMetadata.totalDurationMs).toBeDefined();
      expect(submitted.sessionMetadata.totalDurationMs).toBeGreaterThanOrEqual(0);

      const lastLog = submitted.logs[submitted.logs.length - 1]!;
      expect(lastLog.type).toBe('submission');
    }),
  );

  it.effect('calculates totalDurationMs from startedAt to now', () =>
    Effect.gen(function* () {
      const service = yield* QuizTakerService;
      const quiz = makeQuiz(['q1']);
      const initial = yield* service.initializeSession(quiz);
      const session: QuizSession = yield* service.selectAnswer(initial as QuizSession, 'q1', 5);

      const submitted = yield* service.submitQuiz(session);
      // Duration should be non-negative (could be 0 if same tick)
      expect(submitted.sessionMetadata.totalDurationMs).toBeGreaterThanOrEqual(0);
    }),
  );
});

// ============================================================================
// TESTS: Helper methods
// ============================================================================

it.layer(TestLayer)('helper methods', (it) => {
  it.effect('getCurrentQuestion returns question at index', () =>
    Effect.gen(function* () {
      const service = yield* QuizTakerService;
      const questions = [makeQuestion('q1', 0), makeQuestion('q2', 1)];

      const q = yield* service.getCurrentQuestion(questions, 0);
      expect(q?.id).toBe('q1');

      const q2 = yield* service.getCurrentQuestion(questions, 1);
      expect(q2?.id).toBe('q2');

      const qMissing = yield* service.getCurrentQuestion(questions, 99);
      expect(qMissing).toBeUndefined();
    }),
  );

  it.effect('canNavigateBack returns correct values', () =>
    Effect.gen(function* () {
      const service = yield* QuizTakerService;
      expect(service.canNavigateBack(0)).toBe(false);
      expect(service.canNavigateBack(1)).toBe(true);
      expect(service.canNavigateBack(5)).toBe(true);
    }),
  );

  it.effect('canNavigateNext returns correct values', () =>
    Effect.gen(function* () {
      const service = yield* QuizTakerService;
      expect(service.canNavigateNext(0, 3)).toBe(true);
      expect(service.canNavigateNext(1, 3)).toBe(true);
      expect(service.canNavigateNext(2, 3)).toBe(false);
      expect(service.canNavigateNext(0, 1)).toBe(false);
    }),
  );

  it.effect('findQuizBySlug matches by slug-ified title', () =>
    Effect.gen(function* () {
      const service = yield* QuizTakerService;
      const quizzes = [
        { ...makeQuiz(['q1']), title: 'My Artist Type' },
        { ...makeQuiz(['q2']), title: 'Another Quiz' },
      ];

      const found = yield* service.findQuizBySlug(quizzes, 'my-artist-type');
      expect(found?.title).toBe('My Artist Type');

      const notFound = yield* service.findQuizBySlug(quizzes, 'nonexistent');
      expect(notFound).toBeUndefined();
    }),
  );

  it.effect('getSavedResponse returns saved value or undefined', () =>
    Effect.gen(function* () {
      const service = yield* QuizTakerService;
      const quiz = makeQuiz(['q1', 'q2']);
      const initial = yield* service.initializeSession(quiz);

      const session: QuizSession = yield* service.selectAnswer(initial as QuizSession, 'q1', 7);

      const saved = yield* service.getSavedResponse(session, 'q1');
      expect(saved).toBe(7);

      const missing = yield* service.getSavedResponse(session, 'q2');
      expect(missing).toBeUndefined();
    }),
  );

  it.effect('getRandomCategoryColorClass returns consistent color for same input', () =>
    Effect.gen(function* () {
      const service = yield* QuizTakerService;
      const color1 = service.getRandomCategoryColorClass('test-category');
      const color2 = service.getRandomCategoryColorClass('test-category');
      expect(color1).toBe(color2);
    }),
  );

  it.effect('getRandomCategoryColorClass returns bg-muted when colorOn is false', () =>
    Effect.gen(function* () {
      const service = yield* QuizTakerService;
      const color = service.getRandomCategoryColorClass('test', false);
      expect(color).toBe('bg-muted');
    }),
  );

  it.effect('getRandomCategoryColorClass returns gradient for undefined category', () =>
    Effect.gen(function* () {
      const service = yield* QuizTakerService;
      const color = service.getRandomCategoryColorClass(undefined);
      expect(color).toContain('bg-gradient-to-b');
    }),
  );
});
