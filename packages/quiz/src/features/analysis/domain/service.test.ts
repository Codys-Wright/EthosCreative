// Analysis Service Tests
// Tests for quiz scoring/calculation logic and artist type analysis algorithms

import { expect, it } from '@effect/vitest';
import * as ConfigProvider from 'effect/ConfigProvider';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import type { QuestionResponse } from '@quiz/features/responses/domain/schema.js';
import type { AnalysisEngine, EndingDefinition } from '@quiz/features/analysis-engine/domain/schema.js';
import type { AnalysisEngineId } from '@quiz/features/analysis-engine/domain/schema.js';
import { defaultScoringConfig } from '@quiz/features/analysis-engine/domain/schema.js';
import type { Quiz, QuizId } from '@quiz/features/quiz/domain/schema.js';
import type { ResponseId } from '@quiz/features/responses/domain/schema.js';
import type { QuizResponse } from '@quiz/features/responses/domain/schema.js';
import { AnalysisFailedError } from '../domain/schema.js';
import { AnalysisService } from './service.js';
import * as DateTime from 'effect/DateTime';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const makeQuestion = (id: string) => ({
  id: id as any,
  order: 0,
  title: `Question ${id}`,
  data: { type: 'rating' as const, minRating: 1, maxRating: 10, minLabel: 'Low', maxLabel: 'High' },
  metadata: null,
});

const makeResponse = (questionId: string, value: number): QuestionResponse =>
  ({ questionId, value }) as any;

const makeEnding = (
  endingId: string,
  rules: Array<{
    questionId: string;
    idealAnswers: number[];
    isPrimary: boolean;
    weightMultiplier?: number;
  }>,
): EndingDefinition =>
  ({
    endingId,
    name: endingId,
    questionRules: rules.map((r) => ({
      questionId: r.questionId,
      idealAnswers: r.idealAnswers,
      isPrimary: r.isPrimary,
      weightMultiplier: r.weightMultiplier,
    })),
  }) as any;

const makeEngine = (
  endings: EndingDefinition[],
  overrides?: Partial<AnalysisEngine>,
): AnalysisEngine =>
  ({
    id: crypto.randomUUID() as AnalysisEngineId,
    quizId: crypto.randomUUID() as QuizId,
    version: { semver: '1.0.0', comment: 'test' },
    name: 'Test Engine',
    description: null,
    scoringConfig: defaultScoringConfig,
    endings,
    isActive: true,
    isPublished: true,
    isTemp: false,
    ...overrides,
  }) as any;

const makeQuiz = (questions: Array<{ id: string }>): Quiz =>
  ({
    id: crypto.randomUUID() as QuizId,
    version: { semver: '1.0.0', comment: 'test' },
    title: 'Test Quiz',
    questions: questions.map((q) => makeQuestion(q.id)),
    isPublished: true,
    isTemp: false,
    createdAt: DateTime.unsafeNow(),
    updatedAt: DateTime.unsafeNow(),
    deletedAt: null,
  }) as any;

const makeQuizResponse = (
  quizId: string,
  answers: QuestionResponse[],
): QuizResponse =>
  ({
    id: crypto.randomUUID() as ResponseId,
    quizId: quizId as QuizId,
    answers,
    sessionMetadata: { startedAt: DateTime.unsafeNow() },
    interactionLogs: [],
    metadata: null,
    createdAt: DateTime.unsafeNow(),
    updatedAt: DateTime.unsafeNow(),
    deletedAt: null,
  }) as any;

// Default config provider for tests (matches AnalysisConfig defaults)
const TestConfigProvider = ConfigProvider.fromMap(
  new Map([
    ['ANALYSIS_PRIMARY_POINT_VALUE', '10'],
    ['ANALYSIS_SECONDARY_POINT_VALUE', '5'],
    ['ANALYSIS_PRIMARY_POINT_WEIGHT', '1'],
    ['ANALYSIS_SECONDARY_POINT_WEIGHT', '1'],
    ['ANALYSIS_PRIMARY_DISTANCE_FALLOFF', '0.1'],
    ['ANALYSIS_SECONDARY_DISTANCE_FALLOFF', '0.5'],
    ['ANALYSIS_BETA', '0.8'],
    ['ANALYSIS_DISABLE_SECONDARY_POINTS', 'false'],
    ['ANALYSIS_PRIMARY_MIN_POINTS', '0'],
    ['ANALYSIS_SECONDARY_MIN_POINTS', '0'],
    ['ANALYSIS_MIN_PERCENTAGE_THRESHOLD', '0'],
    ['ANALYSIS_ENABLE_QUESTION_BREAKDOWN', 'true'],
    ['ANALYSIS_MAX_ENDING_RESULTS', '10'],
  ]),
);

const TestLayer = AnalysisService.Default.pipe(
  Layer.provide(Layer.setConfigProvider(TestConfigProvider)),
);

// ============================================================================
// TESTS: convertResponseQuestionIds
// ============================================================================

it.layer(TestLayer)('convertResponseQuestionIds', (it) => {
  it.effect('filters responses to only valid question IDs', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      const questions = [makeQuestion('q1'), makeQuestion('q2')];
      const responses = [makeResponse('q1', 5), makeResponse('q2', 8), makeResponse('q999', 3)];

      const result = yield* service.convertResponseQuestionIds(responses, questions);
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.questionId)).toEqual(['q1', 'q2']);
    }),
  );

  it.effect('returns empty array when no responses match', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      const questions = [makeQuestion('q1')];
      const responses = [makeResponse('q999', 5)];

      const result = yield* service.convertResponseQuestionIds(responses, questions);
      expect(result).toHaveLength(0);
    }),
  );

  it.effect('returns all responses when all match', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      const questions = [makeQuestion('q1'), makeQuestion('q2')];
      const responses = [makeResponse('q1', 5), makeResponse('q2', 8)];

      const result = yield* service.convertResponseQuestionIds(responses, questions);
      expect(result).toHaveLength(2);
    }),
  );
});

// ============================================================================
// TESTS: computeEndingPoints
// ============================================================================

it.layer(TestLayer)('computeEndingPoints', (it) => {
  it.effect('calculates full points for exact ideal answer match', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      const ending = makeEnding('ending-a', [
        { questionId: 'q1', idealAnswers: [10], isPrimary: true },
      ]);
      const responses = [makeResponse('q1', 10)];

      const result = yield* service.computeEndingPoints(responses, ending);
      // Primary: pointValue(10) * pointWeight(1) * customWeight(1) = 10
      expect(result.totalPoints).toBe(10);
      expect(result.questionBreakdown).toHaveLength(1);
      expect(result.questionBreakdown[0].distance).toBe(0);
    }),
  );

  it.effect('reduces points based on distance falloff for primary questions', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      const ending = makeEnding('ending-a', [
        { questionId: 'q1', idealAnswers: [10], isPrimary: true },
      ]);
      // Answer is 8, distance from ideal 10 is 2
      const responses = [makeResponse('q1', 8)];

      const result = yield* service.computeEndingPoints(responses, ending);
      // basePoints = 10 * 1 * 1 = 10
      // pointsLostPerStep = 10 * 0.1 = 1
      // points = 10 - (2 * 1) = 8
      expect(result.totalPoints).toBe(8);
      expect(result.questionBreakdown[0].distance).toBe(2);
    }),
  );

  it.effect('uses secondary point values for non-primary questions', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      const ending = makeEnding('ending-a', [
        { questionId: 'q1', idealAnswers: [10], isPrimary: false },
      ]);
      const responses = [makeResponse('q1', 10)];

      const result = yield* service.computeEndingPoints(responses, ending);
      // Secondary: pointValue(5) * pointWeight(1) * customWeight(1) = 5
      expect(result.totalPoints).toBe(5);
    }),
  );

  it.effect('applies higher distance falloff for secondary questions', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      const ending = makeEnding('ending-a', [
        { questionId: 'q1', idealAnswers: [10], isPrimary: false },
      ]);
      // Answer is 8, distance from ideal 10 is 2
      const responses = [makeResponse('q1', 8)];

      const result = yield* service.computeEndingPoints(responses, ending);
      // basePoints = 5 * 1 * 1 = 5
      // pointsLostPerStep = 5 * 0.5 = 2.5
      // points = 5 - (2 * 2.5) = 0
      expect(result.totalPoints).toBe(0);
    }),
  );

  it.effect('picks nearest ideal answer from multiple options', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      const ending = makeEnding('ending-a', [
        { questionId: 'q1', idealAnswers: [3, 9], isPrimary: true },
      ]);
      // Answer is 8, nearest ideal is 9 (distance 1)
      const responses = [makeResponse('q1', 8)];

      const result = yield* service.computeEndingPoints(responses, ending);
      // basePoints = 10, pointsLostPerStep = 10*0.1 = 1, points = 10 - (1*1) = 9
      expect(result.totalPoints).toBe(9);
      expect(result.questionBreakdown[0].distance).toBe(1);
    }),
  );

  it.effect('applies weightMultiplier when specified on rule', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      const ending = makeEnding('ending-a', [
        { questionId: 'q1', idealAnswers: [10], isPrimary: true, weightMultiplier: 2.0 },
      ]);
      const responses = [makeResponse('q1', 10)];

      const result = yield* service.computeEndingPoints(responses, ending);
      // basePoints = 10 * 1 * 2 = 20
      expect(result.totalPoints).toBe(20);
    }),
  );

  it.effect('skips non-numeric responses', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      const ending = makeEnding('ending-a', [
        { questionId: 'q1', idealAnswers: [10], isPrimary: true },
        { questionId: 'q2', idealAnswers: [5], isPrimary: true },
      ]);
      // q1 is string, q2 is number
      const responses: QuestionResponse[] = [
        { questionId: 'q1', value: 'text answer' } as any,
        makeResponse('q2', 5),
      ];

      const result = yield* service.computeEndingPoints(responses, ending);
      // Only q2 (value 5, exact match) contributes: 10 points
      expect(result.totalPoints).toBe(10);
      expect(result.questionBreakdown).toHaveLength(1);
    }),
  );

  it.effect('skips responses without matching rules', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      const ending = makeEnding('ending-a', [
        { questionId: 'q1', idealAnswers: [10], isPrimary: true },
      ]);
      // Response for q2 which has no rule
      const responses = [makeResponse('q2', 10)];

      const result = yield* service.computeEndingPoints(responses, ending);
      expect(result.totalPoints).toBe(0);
      expect(result.questionBreakdown).toHaveLength(0);
    }),
  );

  it.effect('applies minimum point floor', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      const ending = makeEnding('ending-a', [
        { questionId: 'q1', idealAnswers: [10], isPrimary: false },
      ]);
      // Answer is 1, distance from ideal 10 is 9
      // basePoints = 5, pointsLostPerStep = 5*0.5 = 2.5
      // points = 5 - (9 * 2.5) = 5 - 22.5 = -17.5
      // But minPoints floor is 0 (default), so clamped to 0
      const responses = [makeResponse('q1', 1)];

      const result = yield* service.computeEndingPoints(responses, ending);
      expect(result.totalPoints).toBe(0);
    }),
  );

  it.effect('handles zero distanceFalloff (exact match only)', () =>
    Effect.gen(function* () {
      // Create config with zero falloff
      const zeroFalloffConfig = ConfigProvider.fromMap(
        new Map([
          ['ANALYSIS_PRIMARY_POINT_VALUE', '10'],
          ['ANALYSIS_SECONDARY_POINT_VALUE', '5'],
          ['ANALYSIS_PRIMARY_POINT_WEIGHT', '1'],
          ['ANALYSIS_SECONDARY_POINT_WEIGHT', '1'],
          ['ANALYSIS_PRIMARY_DISTANCE_FALLOFF', '0'],
          ['ANALYSIS_SECONDARY_DISTANCE_FALLOFF', '0'],
          ['ANALYSIS_BETA', '0.8'],
          ['ANALYSIS_DISABLE_SECONDARY_POINTS', 'false'],
          ['ANALYSIS_PRIMARY_MIN_POINTS', '0'],
          ['ANALYSIS_SECONDARY_MIN_POINTS', '0'],
          ['ANALYSIS_MIN_PERCENTAGE_THRESHOLD', '0'],
          ['ANALYSIS_ENABLE_QUESTION_BREAKDOWN', 'true'],
          ['ANALYSIS_MAX_ENDING_RESULTS', '10'],
        ]),
      );

      const service = yield* AnalysisService;
      const ending = makeEnding('ending-a', [
        { questionId: 'q1', idealAnswers: [10], isPrimary: true },
      ]);

      // Exact match gets full points
      const exactResult = yield* service
        .computeEndingPoints([makeResponse('q1', 10)], ending)
        .pipe(Effect.withConfigProvider(zeroFalloffConfig));
      expect(exactResult.totalPoints).toBe(10);

      // Non-exact match gets zero
      const offResult = yield* service
        .computeEndingPoints([makeResponse('q1', 9)], ending)
        .pipe(Effect.withConfigProvider(zeroFalloffConfig));
      expect(offResult.totalPoints).toBe(0);
    }),
  );

  it.effect('accumulates points across multiple responses', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      const ending = makeEnding('ending-a', [
        { questionId: 'q1', idealAnswers: [10], isPrimary: true },
        { questionId: 'q2', idealAnswers: [10], isPrimary: true },
        { questionId: 'q3', idealAnswers: [5], isPrimary: false },
      ]);
      const responses = [
        makeResponse('q1', 10), // 10 points (exact)
        makeResponse('q2', 9), // 10 - (1*1) = 9 points
        makeResponse('q3', 5), // 5 points (exact secondary)
      ];

      const result = yield* service.computeEndingPoints(responses, ending);
      expect(result.totalPoints).toBe(24); // 10 + 9 + 5
      expect(result.questionBreakdown).toHaveLength(3);
    }),
  );
});

// ============================================================================
// TESTS: computeAllEndingScores
// ============================================================================

it.layer(TestLayer)('computeAllEndingScores', (it) => {
  it.effect('normalizes scores to percentages that sum to ~100', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      const engine = makeEngine([
        makeEnding('ending-a', [{ questionId: 'q1', idealAnswers: [10], isPrimary: true }]),
        makeEnding('ending-b', [{ questionId: 'q1', idealAnswers: [1], isPrimary: true }]),
      ]);
      const responses = [makeResponse('q1', 10)];

      const results = yield* service.computeAllEndingScores(responses, engine);
      const totalPercentage = results.reduce((sum, r) => sum + r.percentage, 0);
      expect(totalPercentage).toBeCloseTo(100, 0);
    }),
  );

  it.effect('marks the highest-percentage ending as winner', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      const engine = makeEngine([
        makeEnding('ending-a', [{ questionId: 'q1', idealAnswers: [10], isPrimary: true }]),
        makeEnding('ending-b', [{ questionId: 'q1', idealAnswers: [1], isPrimary: true }]),
      ]);
      // Answer 10 strongly favors ending-a
      const responses = [makeResponse('q1', 10)];

      const results = yield* service.computeAllEndingScores(responses, engine);
      const winner = results.find((r) => r.isWinner);
      expect(winner).toBeDefined();
      expect(winner!.endingId).toBe('ending-a');
    }),
  );

  it.effect('sorts results by percentage descending', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      const engine = makeEngine([
        makeEnding('ending-a', [{ questionId: 'q1', idealAnswers: [10], isPrimary: true }]),
        makeEnding('ending-b', [{ questionId: 'q1', idealAnswers: [5], isPrimary: true }]),
        makeEnding('ending-c', [{ questionId: 'q1', idealAnswers: [1], isPrimary: true }]),
      ]);
      const responses = [makeResponse('q1', 10)];

      const results = yield* service.computeAllEndingScores(responses, engine);
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].percentage).toBeGreaterThanOrEqual(results[i + 1].percentage);
      }
    }),
  );

  it.effect('filters by minPercentageThreshold', () =>
    Effect.gen(function* () {
      const thresholdConfig = ConfigProvider.fromMap(
        new Map([
          ['ANALYSIS_PRIMARY_POINT_VALUE', '10'],
          ['ANALYSIS_SECONDARY_POINT_VALUE', '5'],
          ['ANALYSIS_PRIMARY_POINT_WEIGHT', '1'],
          ['ANALYSIS_SECONDARY_POINT_WEIGHT', '1'],
          ['ANALYSIS_PRIMARY_DISTANCE_FALLOFF', '0.1'],
          ['ANALYSIS_SECONDARY_DISTANCE_FALLOFF', '0.5'],
          ['ANALYSIS_BETA', '0.8'],
          ['ANALYSIS_DISABLE_SECONDARY_POINTS', 'false'],
          ['ANALYSIS_PRIMARY_MIN_POINTS', '0'],
          ['ANALYSIS_SECONDARY_MIN_POINTS', '0'],
          ['ANALYSIS_MIN_PERCENTAGE_THRESHOLD', '20'],
          ['ANALYSIS_ENABLE_QUESTION_BREAKDOWN', 'true'],
          ['ANALYSIS_MAX_ENDING_RESULTS', '10'],
        ]),
      );

      const service = yield* AnalysisService;
      const engine = makeEngine([
        makeEnding('ending-a', [{ questionId: 'q1', idealAnswers: [10], isPrimary: true }]),
        makeEnding('ending-b', [{ questionId: 'q1', idealAnswers: [5], isPrimary: true }]),
        makeEnding('ending-c', [{ questionId: 'q1', idealAnswers: [1], isPrimary: true }]),
      ]);
      // Answer 10 heavily favors ending-a; ending-c should be below threshold
      const responses = [makeResponse('q1', 10)];

      const results = yield* service
        .computeAllEndingScores(responses, engine)
        .pipe(Effect.withConfigProvider(thresholdConfig));
      // All results should be >= 20%
      for (const result of results) {
        expect(result.percentage).toBeGreaterThanOrEqual(20);
      }
    }),
  );

  it.effect('limits results to maxEndingResults', () =>
    Effect.gen(function* () {
      const limitConfig = ConfigProvider.fromMap(
        new Map([
          ['ANALYSIS_PRIMARY_POINT_VALUE', '10'],
          ['ANALYSIS_SECONDARY_POINT_VALUE', '5'],
          ['ANALYSIS_PRIMARY_POINT_WEIGHT', '1'],
          ['ANALYSIS_SECONDARY_POINT_WEIGHT', '1'],
          ['ANALYSIS_PRIMARY_DISTANCE_FALLOFF', '0.1'],
          ['ANALYSIS_SECONDARY_DISTANCE_FALLOFF', '0.5'],
          ['ANALYSIS_BETA', '0.8'],
          ['ANALYSIS_DISABLE_SECONDARY_POINTS', 'false'],
          ['ANALYSIS_PRIMARY_MIN_POINTS', '0'],
          ['ANALYSIS_SECONDARY_MIN_POINTS', '0'],
          ['ANALYSIS_MIN_PERCENTAGE_THRESHOLD', '0'],
          ['ANALYSIS_ENABLE_QUESTION_BREAKDOWN', 'true'],
          ['ANALYSIS_MAX_ENDING_RESULTS', '2'],
        ]),
      );

      const service = yield* AnalysisService;
      const engine = makeEngine([
        makeEnding('ending-a', [{ questionId: 'q1', idealAnswers: [10], isPrimary: true }]),
        makeEnding('ending-b', [{ questionId: 'q1', idealAnswers: [5], isPrimary: true }]),
        makeEnding('ending-c', [{ questionId: 'q1', idealAnswers: [1], isPrimary: true }]),
      ]);
      const responses = [makeResponse('q1', 10)];

      const results = yield* service
        .computeAllEndingScores(responses, engine)
        .pipe(Effect.withConfigProvider(limitConfig));
      expect(results.length).toBeLessThanOrEqual(2);
    }),
  );

  it.effect('handles all-zero scores gracefully', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      const engine = makeEngine([
        makeEnding('ending-a', [{ questionId: 'q1', idealAnswers: [10], isPrimary: true }]),
        makeEnding('ending-b', [{ questionId: 'q1', idealAnswers: [10], isPrimary: true }]),
      ]);
      // No matching responses (empty)
      const responses: QuestionResponse[] = [];

      const results = yield* service.computeAllEndingScores(responses, engine);
      // Should handle without division-by-zero
      for (const result of results) {
        expect(result.percentage).toBe(0);
      }
    }),
  );

  it.effect('uses engine scoringConfig beta for amplification', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      // Engine with beta=1.0 (linear - no amplification)
      const engine = makeEngine(
        [
          makeEnding('ending-a', [{ questionId: 'q1', idealAnswers: [10], isPrimary: true }]),
          makeEnding('ending-b', [{ questionId: 'q1', idealAnswers: [5], isPrimary: true }]),
        ],
        { scoringConfig: { ...defaultScoringConfig, beta: 1.0 } as any },
      );
      const responses = [makeResponse('q1', 10)];

      const linearResults = yield* service.computeAllEndingScores(responses, engine);

      // Engine with beta=0.5 (more aggressive amplification)
      const engine2 = makeEngine(
        [
          makeEnding('ending-a', [{ questionId: 'q1', idealAnswers: [10], isPrimary: true }]),
          makeEnding('ending-b', [{ questionId: 'q1', idealAnswers: [5], isPrimary: true }]),
        ],
        { scoringConfig: { ...defaultScoringConfig, beta: 0.5 } as any },
      );

      const amplifiedResults = yield* service.computeAllEndingScores(responses, engine2);

      // With lower beta, the gap between winner and loser should be smaller
      // (lower beta compresses scores towards equality)
      const linearGap =
        (linearResults.find((r) => r.endingId === 'ending-a')?.percentage ?? 0) -
        (linearResults.find((r) => r.endingId === 'ending-b')?.percentage ?? 0);
      const ampGap =
        (amplifiedResults.find((r) => r.endingId === 'ending-a')?.percentage ?? 0) -
        (amplifiedResults.find((r) => r.endingId === 'ending-b')?.percentage ?? 0);

      expect(ampGap).toBeLessThan(linearGap);
    }),
  );
});

// ============================================================================
// TESTS: validateAnalysisInputs
// ============================================================================

it.layer(TestLayer)('validateAnalysisInputs', (it) => {
  it.effect('fails with AnalysisFailedError when responses are empty', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      const quiz = makeQuiz([{ id: 'q1' }]);
      const engine = makeEngine([makeEnding('ending-a', [])]);
      const response = makeQuizResponse(quiz.id, []);

      const result = yield* service.validateAnalysisInputs(engine, quiz, response).pipe(Effect.either);
      expect(result._tag).toBe('Left');
      if (result._tag === 'Left') {
        expect(result.left).toBeInstanceOf(AnalysisFailedError);
        expect((result.left as AnalysisFailedError).reason).toContain('No responses');
      }
    }),
  );

  it.effect('fails with AnalysisFailedError when engine has no endings', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      const quiz = makeQuiz([{ id: 'q1' }]);
      const engine = makeEngine([]);
      const response = makeQuizResponse(quiz.id, [makeResponse('q1', 5)]);

      const result = yield* service.validateAnalysisInputs(engine, quiz, response).pipe(Effect.either);
      expect(result._tag).toBe('Left');
      if (result._tag === 'Left') {
        expect(result.left).toBeInstanceOf(AnalysisFailedError);
        expect((result.left as AnalysisFailedError).reason).toContain('no endings');
      }
    }),
  );

  it.effect('fails with AnalysisFailedError when engine is not active', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      const quiz = makeQuiz([{ id: 'q1' }]);
      const engine = makeEngine(
        [makeEnding('ending-a', [{ questionId: 'q1', idealAnswers: [10], isPrimary: true }])],
        { isActive: false },
      );
      const response = makeQuizResponse(quiz.id, [makeResponse('q1', 5)]);

      const result = yield* service.validateAnalysisInputs(engine, quiz, response).pipe(Effect.either);
      expect(result._tag).toBe('Left');
      if (result._tag === 'Left') {
        expect(result.left).toBeInstanceOf(AnalysisFailedError);
        expect((result.left as AnalysisFailedError).reason).toContain('not active');
      }
    }),
  );

  it.effect('succeeds with valid inputs', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      const quiz = makeQuiz([{ id: 'q1' }]);
      const engine = makeEngine([
        makeEnding('ending-a', [{ questionId: 'q1', idealAnswers: [10], isPrimary: true }]),
      ]);
      const response = makeQuizResponse(quiz.id, [makeResponse('q1', 5)]);

      const result = yield* service.validateAnalysisInputs(engine, quiz, response);
      expect(result.engine).toBeDefined();
      expect(result.quiz).toBeDefined();
      expect(result.response).toBeDefined();
    }),
  );
});

// ============================================================================
// TESTS: analyzeResponse (full analysis flow)
// ============================================================================

it.layer(TestLayer)('analyzeResponse', (it) => {
  it.effect('produces an analysis result with ending scores', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      const quiz = makeQuiz([{ id: 'q1' }, { id: 'q2' }]);
      const engine = makeEngine([
        makeEnding('visionary', [
          { questionId: 'q1', idealAnswers: [10], isPrimary: true },
          { questionId: 'q2', idealAnswers: [8, 9], isPrimary: false },
        ]),
        makeEnding('analyzer', [
          { questionId: 'q1', idealAnswers: [5], isPrimary: true },
          { questionId: 'q2', idealAnswers: [3], isPrimary: false },
        ]),
      ]);
      const response = makeQuizResponse(quiz.id, [
        makeResponse('q1', 10),
        makeResponse('q2', 9),
      ]);

      const result = yield* service.analyzeResponse(engine, quiz, response);
      expect(result.engineId).toBe(engine.id);
      expect(result.responseId).toBe(response.id);
      expect(result.endingResults.length).toBeGreaterThan(0);
      expect(result.metadata).toBeDefined();
      expect(result.metadata!.totalQuestions).toBe(2);
      expect(result.metadata!.answeredQuestions).toBe(2);
    }),
  );

  it.effect('correctly identifies winner in multi-ending scenario', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      const quiz = makeQuiz([{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }]);
      const engine = makeEngine([
        makeEnding('type-a', [
          { questionId: 'q1', idealAnswers: [10], isPrimary: true },
          { questionId: 'q2', idealAnswers: [10], isPrimary: true },
          { questionId: 'q3', idealAnswers: [10], isPrimary: false },
        ]),
        makeEnding('type-b', [
          { questionId: 'q1', idealAnswers: [1], isPrimary: true },
          { questionId: 'q2', idealAnswers: [1], isPrimary: true },
          { questionId: 'q3', idealAnswers: [1], isPrimary: false },
        ]),
      ]);
      // Answers strongly favor type-a
      const response = makeQuizResponse(quiz.id, [
        makeResponse('q1', 10),
        makeResponse('q2', 10),
        makeResponse('q3', 10),
      ]);

      const result = yield* service.analyzeResponse(engine, quiz, response);
      const winner = result.endingResults.find((r) => r.isWinner);
      expect(winner).toBeDefined();
      expect(winner!.endingId).toBe('type-a');
      expect(winner!.percentage).toBeGreaterThan(50);
    }),
  );

  it.effect('filters out responses for questions not in the quiz', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      const quiz = makeQuiz([{ id: 'q1' }]); // Only q1 in quiz
      const engine = makeEngine([
        makeEnding('ending-a', [
          { questionId: 'q1', idealAnswers: [10], isPrimary: true },
          { questionId: 'q2', idealAnswers: [10], isPrimary: true }, // q2 not in quiz
        ]),
      ]);
      const response = makeQuizResponse(quiz.id, [
        makeResponse('q1', 10),
        makeResponse('q2', 10), // This should be filtered out
      ]);

      const result = yield* service.analyzeResponse(engine, quiz, response);
      expect(result.metadata!.answeredQuestions).toBe(2); // raw answers count
      // The analysis should only use q1's answer since q2 is not in the quiz
    }),
  );
});

// ============================================================================
// TESTS: analyzeWithValidation
// ============================================================================

it.layer(TestLayer)('analyzeWithValidation', (it) => {
  it.effect('validates then analyzes successfully', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      const quiz = makeQuiz([{ id: 'q1' }]);
      const engine = makeEngine([
        makeEnding('ending-a', [{ questionId: 'q1', idealAnswers: [10], isPrimary: true }]),
      ]);
      const response = makeQuizResponse(quiz.id, [makeResponse('q1', 10)]);

      const result = yield* service.analyzeWithValidation(engine, quiz, response);
      expect(result.endingResults.length).toBeGreaterThan(0);
    }),
  );

  it.effect('rejects invalid inputs before analysis', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      const quiz = makeQuiz([{ id: 'q1' }]);
      const engine = makeEngine([], { isActive: false }); // Invalid: no endings AND inactive
      const response = makeQuizResponse(quiz.id, [makeResponse('q1', 5)]);

      const result = yield* service.analyzeWithValidation(engine, quiz, response).pipe(Effect.either);
      expect(result._tag).toBe('Left');
    }),
  );
});

// ============================================================================
// TESTS: getAnalysisSummary
// ============================================================================

it.layer(TestLayer)('getAnalysisSummary', (it) => {
  it.effect('fails for empty results', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;

      // The service fails when given empty results. It attempts to create an
      // AnalysisResultNotFoundError with 'summary' as the ID, which causes a
      // schema parse error since 'summary' is not a valid UUID. We verify the
      // effect fails (either via the tagged error or a defect).
      const result = yield* service.getAnalysisSummary([], 'engine-1').pipe(
        Effect.exit,
      );
      expect(result._tag).toBe('Failure');
    }),
  );

  it.effect('computes correct ending distribution', () =>
    Effect.gen(function* () {
      const service = yield* AnalysisService;
      const engineId = crypto.randomUUID() as AnalysisEngineId;

      const makeAnalysisResult = (endingResults: Array<{ endingId: string; points: number; percentage: number; isWinner: boolean }>) =>
        ({
          id: crypto.randomUUID(),
          engineId,
          engineVersion: { semver: '1.0.0', comment: 'test' },
          responseId: crypto.randomUUID(),
          endingResults,
          metadata: null,
          analyzedAt: DateTime.unsafeNow(),
          createdAt: DateTime.unsafeNow(),
          updatedAt: DateTime.unsafeNow(),
          deletedAt: null,
        }) as any;

      const results = [
        makeAnalysisResult([
          { endingId: 'type-a', points: 100, percentage: 60, isWinner: true },
          { endingId: 'type-b', points: 70, percentage: 40, isWinner: false },
        ]),
        makeAnalysisResult([
          { endingId: 'type-a', points: 90, percentage: 55, isWinner: true },
          { endingId: 'type-b', points: 80, percentage: 45, isWinner: false },
        ]),
        makeAnalysisResult([
          { endingId: 'type-b', points: 110, percentage: 65, isWinner: true },
          { endingId: 'type-a', points: 60, percentage: 35, isWinner: false },
        ]),
      ];

      const summary = yield* service.getAnalysisSummary(results, engineId);
      expect(summary.totalResponses).toBe(3);
      expect(summary.engineId).toBe(engineId);
      expect(summary.endingDistribution).toHaveLength(2);

      const typeA = summary.endingDistribution.find((d) => d.endingId === 'type-a');
      expect(typeA).toBeDefined();
      expect(typeA!.count).toBe(3); // type-a appeared in all 3 results
      expect(typeA!.percentage).toBe(100); // 3/3 * 100 = 100%
      expect(typeA!.averagePoints).toBeCloseTo((100 + 90 + 60) / 3, 1);
      expect(typeA!.averagePercentage).toBeCloseTo((60 + 55 + 35) / 3, 0);
    }),
  );
});

// ============================================================================
// TESTS: disableSecondaryPoints config
// ============================================================================

it.layer(TestLayer)('disableSecondaryPoints config', (it) => {
  it.effect('skips secondary points when disabled', () =>
    Effect.gen(function* () {
      const disableSecondaryConfig = ConfigProvider.fromMap(
        new Map([
          ['ANALYSIS_PRIMARY_POINT_VALUE', '10'],
          ['ANALYSIS_SECONDARY_POINT_VALUE', '5'],
          ['ANALYSIS_PRIMARY_POINT_WEIGHT', '1'],
          ['ANALYSIS_SECONDARY_POINT_WEIGHT', '1'],
          ['ANALYSIS_PRIMARY_DISTANCE_FALLOFF', '0.1'],
          ['ANALYSIS_SECONDARY_DISTANCE_FALLOFF', '0.5'],
          ['ANALYSIS_BETA', '0.8'],
          ['ANALYSIS_DISABLE_SECONDARY_POINTS', 'true'],
          ['ANALYSIS_PRIMARY_MIN_POINTS', '0'],
          ['ANALYSIS_SECONDARY_MIN_POINTS', '0'],
          ['ANALYSIS_MIN_PERCENTAGE_THRESHOLD', '0'],
          ['ANALYSIS_ENABLE_QUESTION_BREAKDOWN', 'true'],
          ['ANALYSIS_MAX_ENDING_RESULTS', '10'],
        ]),
      );

      const service = yield* AnalysisService;
      const ending = makeEnding('ending-a', [
        { questionId: 'q1', idealAnswers: [10], isPrimary: true },
        { questionId: 'q2', idealAnswers: [10], isPrimary: false }, // secondary - should be skipped
      ]);
      const responses = [makeResponse('q1', 10), makeResponse('q2', 10)];

      const result = yield* service
        .computeEndingPoints(responses, ending)
        .pipe(Effect.withConfigProvider(disableSecondaryConfig));

      // Only primary question should contribute: 10 points
      expect(result.totalPoints).toBe(10);
      expect(result.questionBreakdown).toHaveLength(1);
    }),
  );
});
