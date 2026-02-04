/**
 * Course Registry
 *
 * Provides lookup of course data by slug.
 * Used by route handlers to get the correct course data.
 */

import type {
  Course,
  Section,
  Lesson,
  LessonPart,
  LessonId,
  SectionId,
  Path,
  PathId,
  LessonProgress,
} from "@course";

import {
  SONGMAKING_COURSE,
  SONGMAKING_SECTIONS,
  SONGMAKING_LESSONS,
  SONGMAKING_LESSON_PARTS,
  SONGMAKING_PATHS,
  SONGMAKING_WEEKS,
  SONGMAKING_COURSE_ORDER,
  getSectionLessons as getSongmakingSectionLessons,
  getLessonById as getSongmakingLessonById,
  getSectionById as getSongmakingSectionById,
  getLessonParts as getSongmakingLessonParts,
  getNextLesson as getSongmakingNextLesson,
  getPreviousLesson as getSongmakingPreviousLesson,
  getPathById as getSongmakingPathById,
  getPathLessons as getSongmakingPathLessons,
  getAllPaths as getSongmakingAllPaths,
  getPathProgress as getSongmakingPathProgress,
  getCourseProgress as getSongmakingCourseProgress,
  getWeeks as getSongmakingWeeks,
  getWeekById as getSongmakingWeekById,
  getWeekLessons as getSongmakingWeekLessons,
  getOrderedLessons as getSongmakingOrderedLessons,
  getNextLessonInOrder as getSongmakingNextLessonInOrder,
  getPreviousLessonInOrder as getSongmakingPreviousLessonInOrder,
  getWeekForLesson as getSongmakingWeekForLesson,
  getWeekProgress as getSongmakingWeekProgress,
  type Week,
  type WeekId,
  type CourseOrder,
} from "./course";

// Re-export week types for use in atoms/context
export type { Week, WeekId, CourseOrder };

import {
  EXAMPLE_COURSE,
  EXAMPLE_SECTIONS,
  EXAMPLE_LESSONS,
  EXAMPLE_LESSON_PARTS,
  getExampleSectionLessons,
  getExampleLessonById,
  getExampleSectionById,
  getExampleLessonParts,
  getExampleNextLesson,
  getExamplePreviousLesson,
} from "./example-course";

// =============================================================================
// Types
// =============================================================================

export interface CourseData {
  course: Course;
  sections: ReadonlyArray<Section>;
  lessons: ReadonlyArray<Lesson>;
  lessonParts: ReadonlyArray<LessonPart>;
  paths?: ReadonlyArray<Path>;

  // Helper functions
  getSectionLessons: (
    sectionId: SectionId,
    includeUnpublished?: boolean
  ) => ReadonlyArray<Lesson>;
  getLessonById: (lessonId: LessonId) => Lesson | undefined;
  getSectionById: (sectionId: SectionId) => Section | undefined;
  getLessonParts: (lessonId: LessonId) => ReadonlyArray<LessonPart>;
  getNextLesson: (lessonId: LessonId) => Lesson | undefined;
  getPreviousLesson: (lessonId: LessonId) => Lesson | undefined;

  // Path helpers (optional - only for courses with paths)
  getPathById?: (pathId: PathId) => Path | undefined;
  getPathLessons?: (pathId: PathId) => ReadonlyArray<Lesson>;
  getAllPaths?: () => ReadonlyArray<Path>;
  getPathProgress?: (
    pathId: PathId,
    progressMap: Map<LessonId, LessonProgress>
  ) => { completed: number; total: number; percent: number };
  getCourseProgress?: (progressMap: Map<LessonId, LessonProgress>) => {
    completed: number;
    total: number;
    percent: number;
  };

  // Course Order / Week helpers (optional - for structured week-based progression)
  courseOrder?: CourseOrder;
  weeks?: ReadonlyArray<Week>;
  getWeeks?: () => ReadonlyArray<Week>;
  getWeekById?: (weekId: WeekId) => Week | undefined;
  getWeekLessons?: (weekId: WeekId) => ReadonlyArray<Lesson>;
  getOrderedLessons?: () => ReadonlyArray<Lesson>;
  getNextLessonInOrder?: (lessonId: LessonId) => Lesson | undefined;
  getPreviousLessonInOrder?: (lessonId: LessonId) => Lesson | undefined;
  getWeekForLesson?: (lessonId: LessonId) => Week | undefined;
  getWeekProgress?: (
    weekId: WeekId,
    progressMap: Map<LessonId, LessonProgress>
  ) => { completed: number; total: number; percent: number };

  // Metadata
  isExample: boolean;
  requiresAdmin: boolean;
}

// =============================================================================
// Course Data Objects
// =============================================================================

const SONGMAKING_DATA: CourseData = {
  course: SONGMAKING_COURSE,
  sections: SONGMAKING_SECTIONS,
  lessons: SONGMAKING_LESSONS,
  lessonParts: SONGMAKING_LESSON_PARTS,
  paths: SONGMAKING_PATHS,
  getSectionLessons: getSongmakingSectionLessons,
  getLessonById: getSongmakingLessonById,
  getSectionById: getSongmakingSectionById,
  getLessonParts: getSongmakingLessonParts,
  getNextLesson: getSongmakingNextLesson,
  getPreviousLesson: getSongmakingPreviousLesson,
  getPathById: getSongmakingPathById,
  getPathLessons: getSongmakingPathLessons,
  getAllPaths: getSongmakingAllPaths,
  getPathProgress: getSongmakingPathProgress,
  getCourseProgress: getSongmakingCourseProgress,
  // Week-based course order
  courseOrder: SONGMAKING_COURSE_ORDER,
  weeks: SONGMAKING_WEEKS,
  getWeeks: getSongmakingWeeks,
  getWeekById: getSongmakingWeekById,
  getWeekLessons: getSongmakingWeekLessons,
  getOrderedLessons: getSongmakingOrderedLessons,
  getNextLessonInOrder: getSongmakingNextLessonInOrder,
  getPreviousLessonInOrder: getSongmakingPreviousLessonInOrder,
  getWeekForLesson: getSongmakingWeekForLesson,
  getWeekProgress: getSongmakingWeekProgress,
  isExample: false,
  requiresAdmin: false,
};

const EXAMPLE_DATA: CourseData = {
  course: EXAMPLE_COURSE,
  sections: EXAMPLE_SECTIONS,
  lessons: EXAMPLE_LESSONS,
  lessonParts: EXAMPLE_LESSON_PARTS,
  paths: undefined,
  getSectionLessons: getExampleSectionLessons,
  getLessonById: getExampleLessonById,
  getSectionById: getExampleSectionById,
  getLessonParts: getExampleLessonParts,
  getNextLesson: getExampleNextLesson,
  getPreviousLesson: getExamplePreviousLesson,
  getPathById: undefined,
  getPathLessons: undefined,
  getAllPaths: undefined,
  getPathProgress: undefined,
  getCourseProgress: undefined,
  isExample: true,
  requiresAdmin: true,
};

// =============================================================================
// Registry
// =============================================================================

const COURSE_REGISTRY: Record<string, CourseData> = {
  songmaking: SONGMAKING_DATA,
  "example-course": EXAMPLE_DATA,
};

/**
 * Get course data by slug
 */
export function getCourseBySlug(slug: string): CourseData | undefined {
  return COURSE_REGISTRY[slug];
}

/**
 * Get all available course slugs
 */
export function getAllCourseSlugs(): string[] {
  return Object.keys(COURSE_REGISTRY);
}

/**
 * Check if a course exists
 */
export function courseExists(slug: string): boolean {
  return slug in COURSE_REGISTRY;
}

/**
 * Get all public courses (not requiring admin)
 */
export function getPublicCourses(): CourseData[] {
  return Object.values(COURSE_REGISTRY).filter((c) => !c.requiresAdmin);
}

/**
 * Get all admin-only courses
 */
export function getAdminCourses(): CourseData[] {
  return Object.values(COURSE_REGISTRY).filter((c) => c.requiresAdmin);
}
