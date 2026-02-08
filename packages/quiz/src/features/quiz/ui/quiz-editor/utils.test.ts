// Quiz Editor Utils Tests
// Tests for data transformations: version display, change detection, badge colors

import { describe, expect, it } from 'vitest';
import type { Quiz, QuizId } from '@quiz/features/quiz/domain/schema.js';
import * as DateTime from 'effect/DateTime';
import {
  getDisplayVersion,
  hasQuizChanged,
  getTempBadgeColor,
  artistTypes,
  getArtistTypeColorStyle,
  getArtistTypeTextStyle,
} from './utils.js';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const now = DateTime.unsafeNow();

const makeQuiz = (overrides: { id: string; title: string } & Record<string, unknown>): Quiz => {
  const { id, title, ...rest } = overrides;
  return {
    id: id as unknown as QuizId,
    version: { semver: '1.0.0', comment: 'test' },
    subtitle: null,
    description: null,
    questions: [],
    isPublished: false,
    isTemp: false,
    metadata: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...rest,
    title,
  } as any;
};

// ============================================================================
// TESTS: getDisplayVersion
// ============================================================================

describe('getDisplayVersion', () => {
  it('returns semver for non-temp quizzes', () => {
    const quiz = makeQuiz({ id: 'q1', title: 'My Quiz', isTemp: false });
    expect(getDisplayVersion(quiz, [quiz])).toBe('v1.0.0');
  });

  it('returns draft number for temp quizzes', () => {
    const original = makeQuiz({ id: 'q0', title: 'My Quiz', isTemp: false });
    const temp1 = makeQuiz({ id: 'q1', title: 'My Quiz (Editing)', isTemp: true });

    expect(getDisplayVersion(temp1, [original, temp1])).toBe('v1.0.0 (Draft 1)');
  });

  it('assigns sequential draft numbers to multiple temp versions', () => {
    const original = makeQuiz({ id: 'q0', title: 'My Quiz', isTemp: false });
    const temp1 = makeQuiz({ id: 'q1', title: 'My Quiz (Editing)', isTemp: true });
    const temp2 = makeQuiz({ id: 'q2', title: 'My Quiz (Editing)', isTemp: true });

    const allQuizzes = [original, temp1, temp2];

    // Draft numbers are assigned by sorting by ID
    const sorted = [temp1, temp2].sort((a, b) => a.id.localeCompare(b.id));
    expect(getDisplayVersion(sorted[0], allQuizzes)).toBe('v1.0.0 (Draft 1)');
    expect(getDisplayVersion(sorted[1], allQuizzes)).toBe('v1.0.0 (Draft 2)');
  });

  it('handles different version numbers', () => {
    const quiz = makeQuiz({
      id: 'q1',
      title: 'My Quiz',
      isTemp: false,
      version: { semver: '2.3.1', comment: 'updated' },
    });
    expect(getDisplayVersion(quiz, [quiz])).toBe('v2.3.1');
  });
});

// ============================================================================
// TESTS: hasQuizChanged
// ============================================================================

describe('hasQuizChanged', () => {
  it('returns false for non-temp quiz with no temp versions', () => {
    const quiz = makeQuiz({ id: 'q1', title: 'My Quiz', isTemp: false });
    expect(hasQuizChanged(quiz, [quiz])).toBe(false);
  });

  it('returns true when temp quiz has different questions from original', () => {
    const original = makeQuiz({
      id: 'q0',
      title: 'My Quiz',
      isTemp: false,
      questions: [{ id: 'question-1' }] as any,
    });
    const temp = makeQuiz({
      id: 'q1',
      title: 'My Quiz (Editing)',
      isTemp: true,
      questions: [{ id: 'question-1' }, { id: 'question-2' }] as any,
    });

    expect(hasQuizChanged(temp, [original, temp])).toBe(true);
  });

  it('returns false when temp quiz matches original', () => {
    const questions = [{ id: 'question-1', title: 'Q1' }] as any;
    const original = makeQuiz({
      id: 'q0',
      title: 'My Quiz',
      isTemp: false,
      questions,
      description: 'A quiz',
      subtitle: 'Subtitle',
    });
    const temp = makeQuiz({
      id: 'q1',
      title: 'My Quiz (Editing)',
      isTemp: true,
      questions,
      description: 'A quiz',
      subtitle: 'Subtitle',
    });

    expect(hasQuizChanged(temp, [original, temp])).toBe(false);
  });

  it('returns true when temp quiz has different description', () => {
    const original = makeQuiz({
      id: 'q0',
      title: 'My Quiz',
      isTemp: false,
      description: 'Original description',
    });
    const temp = makeQuiz({
      id: 'q1',
      title: 'My Quiz (Editing)',
      isTemp: true,
      description: 'Modified description',
    });

    expect(hasQuizChanged(temp, [original, temp])).toBe(true);
  });

  it('returns true when temp quiz has different subtitle', () => {
    const original = makeQuiz({
      id: 'q0',
      title: 'My Quiz',
      isTemp: false,
      subtitle: 'Original',
    });
    const temp = makeQuiz({
      id: 'q1',
      title: 'My Quiz (Editing)',
      isTemp: true,
      subtitle: 'Changed',
    });

    expect(hasQuizChanged(temp, [original, temp])).toBe(true);
  });

  it('returns true for temp quiz when no original can be found', () => {
    const temp = makeQuiz({
      id: 'q1',
      title: 'My Quiz (Editing)',
      isTemp: true,
    });

    // No matching original quiz in the array
    expect(hasQuizChanged(temp, [temp])).toBe(true);
  });

  it('returns true for non-temp quiz when a changed temp version exists', () => {
    const original = makeQuiz({
      id: 'q0',
      title: 'My Quiz',
      isTemp: false,
      description: 'Original',
    });
    const temp = makeQuiz({
      id: 'q1',
      title: 'My Quiz (Editing)',
      isTemp: true,
      description: 'Changed',
    });

    expect(hasQuizChanged(original, [original, temp])).toBe(true);
  });

  it('returns false for non-temp quiz when an unchanged temp version exists', () => {
    const original = makeQuiz({
      id: 'q0',
      title: 'My Quiz',
      isTemp: false,
      description: 'Same',
      subtitle: 'Same',
    });
    const temp = makeQuiz({
      id: 'q1',
      title: 'My Quiz (Editing)',
      isTemp: true,
      description: 'Same',
      subtitle: 'Same',
    });

    expect(hasQuizChanged(original, [original, temp])).toBe(false);
  });
});

// ============================================================================
// TESTS: getTempBadgeColor
// ============================================================================

describe('getTempBadgeColor', () => {
  it('returns consistent color for same quiz ID', () => {
    const color1 = getTempBadgeColor('quiz-123');
    const color2 = getTempBadgeColor('quiz-123');
    expect(color1).toBe(color2);
  });

  it('returns different colors for different quiz IDs', () => {
    // Not guaranteed to always be different, but with enough different IDs most should differ
    const colors = new Set(
      ['id-1', 'id-2', 'id-3', 'id-4', 'id-5', 'id-6', 'id-7', 'id-8'].map(getTempBadgeColor),
    );
    // Should have at least 2 unique colors from 8 different IDs
    expect(colors.size).toBeGreaterThanOrEqual(2);
  });

  it('returns a valid Tailwind class string', () => {
    const color = getTempBadgeColor('test-id');
    expect(color).toContain('border-');
    expect(color).toContain('text-');
  });
});

// ============================================================================
// TESTS: artistTypes constant
// ============================================================================

describe('artistTypes', () => {
  it('has 10 artist types', () => {
    expect(artistTypes).toHaveLength(10);
  });

  it('includes expected types', () => {
    expect(artistTypes).toContain('visionary');
    expect(artistTypes).toContain('analyzer');
    expect(artistTypes).toContain('entertainer');
    expect(artistTypes).toContain('maverick');
    expect(artistTypes).toContain('dreamer');
    expect(artistTypes).toContain('feeler');
    expect(artistTypes).toContain('tortured');
    expect(artistTypes).toContain('solo');
  });
});

// ============================================================================
// TESTS: getArtistTypeColorStyle / getArtistTypeTextStyle
// ============================================================================

describe('getArtistTypeColorStyle', () => {
  it('returns CSS custom property references', () => {
    const style = getArtistTypeColorStyle('visionary');
    expect(style.backgroundColor).toContain('--artist-visionary');
    expect(style.borderColor).toContain('--artist-visionary');
  });

  it('lowercases the input', () => {
    const style = getArtistTypeColorStyle('VISIONARY');
    expect(style.backgroundColor).toContain('--artist-visionary');
  });
});

describe('getArtistTypeTextStyle', () => {
  it('returns CSS custom property reference for color', () => {
    const style = getArtistTypeTextStyle('analyzer');
    expect(style.color).toBe('var(--artist-analyzer)');
  });
});
