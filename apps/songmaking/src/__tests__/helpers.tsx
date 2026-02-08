/**
 * Shared test helpers for songmaking component tests.
 *
 * Provides mock data factories and common mock implementations
 * for the hooks and modules used across components.
 */

import type { UseCourseResult } from "../features/course/client/course-context";
import type { CourseRoutes } from "../features/course/client/course-atoms";

// =============================================================================
// Mock Data Factories
// =============================================================================

export function makeMockCourse(overrides?: Partial<UseCourseResult["course"]>) {
  return {
    id: "course-1",
    instructorId: "instructor-1",
    title: "Test Course",
    slug: "test-course",
    subtitle: "A test course subtitle",
    description: "A test course for component testing",
    thumbnailUrl: null,
    categoryId: null,
    tags: ["test"],
    level: "all-levels" as const,
    language: "en",
    totalDurationMinutes: 120,
    lessonCount: 10,
    sectionCount: 3,
    enrollmentCount: 100,
    averageRating: 4.5,
    reviewCount: 20,
    status: "published" as const,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    ...overrides,
  } as UseCourseResult["course"];
}

export function makeMockSection(
  id: string,
  title: string,
  sortOrder: number,
  lessonCount = 3
) {
  return {
    id,
    courseId: "course-1",
    title,
    description: `Description for ${title}`,
    sortOrder,
    lessonCount,
    totalDurationMinutes: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as unknown as UseCourseResult["sections"][number];
}

export function makeMockLesson(
  id: string,
  title: string,
  sectionId: string,
  sortOrder: number,
  overrides?: Record<string, unknown>
) {
  return {
    id,
    courseId: "course-1",
    sectionId,
    pathId: null,
    title,
    description: `Description for ${title}`,
    type: "video",
    mdxContent: null,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    sortOrder,
    durationMinutes: 10,
    isFree: true,
    isPreview: false,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  } as unknown as UseCourseResult["lessons"][number];
}

export function makeMockLessonPart(
  id: string,
  lessonId: string,
  title: string,
  type: string,
  sortOrder: number
) {
  return {
    id,
    lessonId,
    title,
    type,
    sortOrder,
    durationMinutes: 5,
    mdxContent: type === "text" ? JSON.stringify({ root: { children: [], direction: null, format: "", indent: 0, type: "root", version: 1 } }) : null,
    videoContent:
      type === "video"
        ? { provider: "youtube", videoId: "test123", durationSeconds: 300, thumbnailUrl: null }
        : null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as unknown as UseCourseResult["lessonParts"][number];
}

// =============================================================================
// Default Mock Data
// =============================================================================

export const MOCK_SECTIONS = [
  makeMockSection("section-1", "Introduction", 0, 2),
  makeMockSection("section-2", "Core Concepts", 1, 3),
  makeMockSection("section-3", "Advanced Topics", 2, 2),
];

export const MOCK_LESSONS = [
  makeMockLesson("lesson-1", "Welcome", "section-1", 0, { isFree: true }),
  makeMockLesson("lesson-2", "Getting Started", "section-1", 1, {
    isFree: true,
  }),
  makeMockLesson("lesson-3", "Key Principles", "section-2", 0),
  makeMockLesson("lesson-4", "Deep Dive", "section-2", 1),
  makeMockLesson("lesson-5", "Practice Exercise", "section-2", 2, {
    type: "assignment",
  }),
  makeMockLesson("lesson-6", "Going Further", "section-3", 0),
  makeMockLesson("lesson-7", "Final Project", "section-3", 1, {
    type: "assignment",
  }),
];

export const MOCK_LESSON_PARTS = [
  makeMockLessonPart("part-1", "lesson-1", "Introduction Video", "video", 0),
  makeMockLessonPart("part-2", "lesson-1", "Welcome Text", "text", 1),
  makeMockLessonPart("part-3", "lesson-3", "Principles Video", "video", 0),
  makeMockLessonPart("part-4", "lesson-3", "Principles Reading", "text", 1),
  makeMockLessonPart("part-5", "lesson-3", "Quick Quiz", "quiz", 2),
];

export const MOCK_ROUTES: CourseRoutes = {
  home: "/test-course",
  dashboard: "/test-course/dashboard",
  lesson: (id: string) => `/test-course/lesson/${id}`,
  admin: "/test-course/admin",
  messages: "/test-course/messages",
};

export function makeMockUseCourse(
  overrides?: Partial<UseCourseResult>
): UseCourseResult {
  const sections = overrides?.sections ?? MOCK_SECTIONS;
  const lessons = overrides?.lessons ?? MOCK_LESSONS;
  const lessonParts = overrides?.lessonParts ?? MOCK_LESSON_PARTS;

  return {
    slug: "test-course",
    routes: MOCK_ROUTES,
    course: makeMockCourse(),
    sections,
    lessons,
    lessonParts,
    paths: [],
    isExample: false,
    requiresAdmin: false,
    weeks: [],
    courseOrder: undefined,
    hasCourseOrder: false,
    orderedLessons: lessons,
    getSectionLessons: (sectionId: string) =>
      lessons
        .filter((l) => l.sectionId === sectionId)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    getLessonById: (lessonId: string) => lessons.find((l) => l.id === lessonId),
    getSectionById: (sectionId: string) =>
      sections.find((s) => s.id === sectionId),
    getLessonParts: (lessonId: string) =>
      lessonParts.filter((p) => p.lessonId === lessonId),
    getNextLesson: (lessonId: string) => {
      const idx = lessons.findIndex((l) => l.id === lessonId);
      return idx >= 0 && idx < lessons.length - 1
        ? lessons[idx + 1]
        : undefined;
    },
    getPreviousLesson: (lessonId: string) => {
      const idx = lessons.findIndex((l) => l.id === lessonId);
      return idx > 0 ? lessons[idx - 1] : undefined;
    },
    getPathById: () => undefined,
    getPathLessons: () => [],
    getWeekById: () => undefined,
    getWeekLessons: () => [],
    getWeekForLesson: () => undefined,
    ...overrides,
  };
}
