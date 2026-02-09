/**
 * Course Context
 *
 * Lightweight context that sets the course slug atom.
 * All course data is accessed via atoms, not context.
 *
 * The context exists only to:
 * 1. Set the courseSlugAtom when entering a course route
 * 2. Provide a convenient hook that reads common atoms together
 */

import { createContext, useContext, type ReactNode } from "react";
import { useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import { useProgressSync } from "./use-progress-sync.js";
import {
  courseSlugAtom,
  courseAtom,
  sectionsAtom,
  lessonsAtom,
  lessonPartsAtom,
  pathsAtom,
  isExampleAtom,
  requiresAdminAtom,
  courseRoutesAtom,
  sectionLessonsAtom,
  lessonByIdAtom,
  sectionByIdAtom,
  lessonPartsForLessonAtom,
  nextLessonForAtom,
  previousLessonForAtom,
  pathByIdAtom,
  pathLessonsAtom,
  weeksAtom,
  courseOrderAtom,
  hasCourseOrderAtom,
  orderedLessonsAtom,
  type CourseRoutes,
} from "./course-atoms.js";
import type { Course, Section, Lesson, LessonPart, Path } from "@course";
import type { Week, CourseOrder } from "../../../data/course-registry.js";

// =============================================================================
// Context (minimal - just tracks if we're in a course route)
// =============================================================================

const CourseContext = createContext<{ slug: string } | null>(null);

// =============================================================================
// Provider - Sets the course slug atom
// =============================================================================

interface CourseProviderProps {
  courseSlug: string;
  children: ReactNode;
}

export function CourseProvider({ courseSlug, children }: CourseProviderProps) {
  const setSlug = useAtomSet(courseSlugAtom);
  const currentSlug = useAtomValue(courseSlugAtom);

  // Set the course slug synchronously if it doesn't match
  // This ensures atoms have correct data before first render
  if (currentSlug !== courseSlug) {
    setSlug(courseSlug);
  }

  // Sync progress with server for authenticated users
  useProgressSync();

  return (
    <CourseContext.Provider value={{ slug: courseSlug }}>
      {children}
    </CourseContext.Provider>
  );
}

// =============================================================================
// Hook - Convenience hook that reads common course atoms
// =============================================================================

export interface UseCourseResult {
  slug: string;
  routes: CourseRoutes;
  course: Course;
  sections: ReadonlyArray<Section>;
  lessons: ReadonlyArray<Lesson>;
  lessonParts: ReadonlyArray<LessonPart>;
  paths: ReadonlyArray<Path>;
  isExample: boolean;
  requiresAdmin: boolean;

  // Week-based course order
  weeks: ReadonlyArray<Week>;
  courseOrder: CourseOrder | undefined;
  hasCourseOrder: boolean;
  orderedLessons: ReadonlyArray<Lesson>;

  // Helper functions (create atoms on demand)
  getSectionLessons: (sectionId: string) => ReadonlyArray<Lesson>;
  getLessonById: (lessonId: string) => Lesson | undefined;
  getSectionById: (sectionId: string) => Section | undefined;
  getLessonParts: (lessonId: string) => ReadonlyArray<LessonPart>;
  getNextLesson: (lessonId: string) => Lesson | undefined;
  getPreviousLesson: (lessonId: string) => Lesson | undefined;
  getPathById: (pathId: string) => Path | undefined;
  getPathLessons: (pathId: string) => ReadonlyArray<Lesson>;

  // Week helpers
  getWeekById: (weekId: string) => Week | undefined;
  getWeekLessons: (weekId: string) => ReadonlyArray<Lesson>;
  getWeekForLesson: (lessonId: string) => Week | undefined;
}

/**
 * Hook to access course data from atoms.
 * Must be used within a CourseProvider.
 *
 * For better performance, prefer using individual atoms directly
 * (e.g., useAtomValue(courseAtom)) when you only need specific data.
 */
export function useCourse(): UseCourseResult {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error("useCourse must be used within a CourseProvider");
  }

  const slug = useAtomValue(courseSlugAtom);
  const routes = useAtomValue(courseRoutesAtom);
  const course = useAtomValue(courseAtom);
  const sections = useAtomValue(sectionsAtom);
  const lessons = useAtomValue(lessonsAtom);
  const lessonParts = useAtomValue(lessonPartsAtom);
  const paths = useAtomValue(pathsAtom);
  const isExample = useAtomValue(isExampleAtom);
  const requiresAdmin = useAtomValue(requiresAdminAtom);

  // Week-based course order
  const weeks = useAtomValue(weeksAtom);
  const courseOrder = useAtomValue(courseOrderAtom);
  const hasCourseOrder = useAtomValue(hasCourseOrderAtom);
  const orderedLessons = useAtomValue(orderedLessonsAtom);

  // These create atoms dynamically - components should prefer using the atom factories directly
  // for better memoization, but these are convenient for simple cases
  const getSectionLessons = (sectionId: string) => {
    const sectionLessons = lessons.filter((l) => l.sectionId === sectionId);
    return sectionLessons.sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const getLessonById = (lessonId: string) => {
    return lessons.find((l) => l.id === lessonId);
  };

  const getSectionById = (sectionId: string) => {
    return sections.find((s) => s.id === sectionId);
  };

  const getLessonParts = (lessonId: string) => {
    return lessonParts.filter((p) => p.lessonId === lessonId);
  };

  const getNextLesson = (lessonId: string) => {
    const sortedLessons = [...lessons].sort((a, b) => {
      const sectionA = sections.find((s) => s.id === a.sectionId);
      const sectionB = sections.find((s) => s.id === b.sectionId);
      if (!sectionA || !sectionB) return 0;
      if (sectionA.sortOrder !== sectionB.sortOrder) {
        return sectionA.sortOrder - sectionB.sortOrder;
      }
      return a.sortOrder - b.sortOrder;
    });
    const currentIndex = sortedLessons.findIndex((l) => l.id === lessonId);
    return currentIndex >= 0 ? sortedLessons[currentIndex + 1] : undefined;
  };

  const getPreviousLesson = (lessonId: string) => {
    const sortedLessons = [...lessons].sort((a, b) => {
      const sectionA = sections.find((s) => s.id === a.sectionId);
      const sectionB = sections.find((s) => s.id === b.sectionId);
      if (!sectionA || !sectionB) return 0;
      if (sectionA.sortOrder !== sectionB.sortOrder) {
        return sectionA.sortOrder - sectionB.sortOrder;
      }
      return a.sortOrder - b.sortOrder;
    });
    const currentIndex = sortedLessons.findIndex((l) => l.id === lessonId);
    return currentIndex > 0 ? sortedLessons[currentIndex - 1] : undefined;
  };

  const getPathById = (pathId: string) => {
    return paths.find((p) => p.id === pathId);
  };

  const getPathLessons = (pathId: string) => {
    return lessons.filter((l) => l.pathId === pathId);
  };

  // Week helpers
  const getWeekById = (weekId: string) => {
    return weeks.find((w) => w.id === weekId);
  };

  const getWeekLessons = (weekId: string) => {
    const week = getWeekById(weekId);
    if (!week) return [];
    return week.lessonIds
      .map((id) => getLessonById(id))
      .filter((l): l is Lesson => l !== undefined);
  };

  const getWeekForLesson = (lessonId: string) => {
    return weeks.find((w) => w.lessonIds.includes(lessonId as any));
  };

  return {
    slug,
    routes,
    course,
    sections,
    lessons,
    lessonParts,
    paths,
    isExample,
    requiresAdmin,
    // Week-based course order
    weeks,
    courseOrder,
    hasCourseOrder,
    orderedLessons,
    // Helper functions
    getSectionLessons,
    getLessonById,
    getSectionById,
    getLessonParts,
    getNextLesson,
    getPreviousLesson,
    getPathById,
    getPathLessons,
    // Week helpers
    getWeekById,
    getWeekLessons,
    getWeekForLesson,
  };
}

/**
 * Hook to check if we're in a course context
 */
export function useIsInCourse(): boolean {
  const context = useContext(CourseContext);
  return context !== null;
}
