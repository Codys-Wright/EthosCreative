/**
 * Course State Atoms
 *
 * Effect Atom-based state management for course data,
 * lesson progress, and UI state.
 *
 * Uses a course slug atom to support multiple courses.
 * All derived atoms read from the registry based on current slug.
 */

import { Atom } from "@effect-atom/atom-react";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import type {
  Course,
  Section,
  Lesson,
  LessonPart,
  LessonId,
  SectionId,
  Path,
  PathId,
} from "@course";
import { ProgressClient } from "@course/features/progress/client/client.js";

/**
 * Client-side lesson progress type (simplified from server schema)
 */
export interface ClientLessonProgress {
  lessonId: string;
  status: "not_started" | "in_progress" | "completed";
  progressPercent: number;
  completedAt?: string;
}
import {
  getCourseBySlug,
  type CourseData,
} from "../../../data/course-registry.js";

// =============================================================================
// Server Sync - Module-level flag controlled by useProgressSync hook
// =============================================================================

let _serverSyncEnabled = false;

/** Called by useProgressSync to enable/disable server persistence */
export function setServerSyncEnabled(enabled: boolean) {
  _serverSyncEnabled = enabled;
}

/** Fire-and-forget: persist a mark-complete action to the server */
function persistMarkComplete(lessonId: string) {
  if (!_serverSyncEnabled) return;

  const effect = Effect.gen(function* () {
    const client = yield* ProgressClient;
    return yield* client("progress_markLessonComplete", {
      lessonId: lessonId as LessonId,
    });
  }).pipe(Effect.provide(ProgressClient.Default));

  Effect.runPromise(effect).catch(() => {
    // Silently fail - local state already updated optimistically
  });
}

// =============================================================================
// Course Slug Atom - The root of all course-specific state
// =============================================================================

/**
 * Current course slug atom - set by the route layout
 * This drives all other course-related atoms
 */
export const courseSlugAtom = Atom.make<string>("songmaking").pipe(
  Atom.keepAlive
);

// =============================================================================
// Course Data Atoms (Derived from slug + registry)
// =============================================================================

/**
 * Current course data atom - derived from slug
 * Returns the full CourseData object from the registry
 */
export const courseDataAtom = Atom.make((get): CourseData | undefined => {
  const slug = get(courseSlugAtom);
  return getCourseBySlug(slug);
}).pipe(Atom.keepAlive);

/**
 * Course atom - returns the Course object
 */
export const courseAtom = Atom.make((get): Course => {
  const data = get(courseDataAtom);
  if (!data) throw new Error("Course not found");
  return data.course;
});

/**
 * Sections atom - returns all sections for current course
 */
export const sectionsAtom = Atom.make((get): ReadonlyArray<Section> => {
  const data = get(courseDataAtom);
  return data?.sections ?? [];
});

/**
 * Lessons atom - returns all lessons for current course
 */
export const lessonsAtom = Atom.make((get): ReadonlyArray<Lesson> => {
  const data = get(courseDataAtom);
  return data?.lessons ?? [];
});

/**
 * Lesson parts atom - returns all lesson parts for current course
 */
export const lessonPartsAtom = Atom.make((get): ReadonlyArray<LessonPart> => {
  const data = get(courseDataAtom);
  return data?.lessonParts ?? [];
});

/**
 * Paths atom - returns all paths for current course (may be empty)
 */
export const pathsAtom = Atom.make((get): ReadonlyArray<Path> => {
  const data = get(courseDataAtom);
  return data?.paths ?? [];
});

/**
 * Is example course atom
 */
export const isExampleAtom = Atom.make((get): boolean => {
  const data = get(courseDataAtom);
  return data?.isExample ?? false;
});

/**
 * Requires admin atom
 */
export const requiresAdminAtom = Atom.make((get): boolean => {
  const data = get(courseDataAtom);
  return data?.requiresAdmin ?? false;
});

// =============================================================================
// Course Helper Functions (accessed via atoms)
// =============================================================================

/**
 * Get section lessons atom factory
 */
export const sectionLessonsAtom = (sectionId: string) =>
  Atom.make((get): ReadonlyArray<Lesson> => {
    const data = get(courseDataAtom);
    if (!data) return [];
    return data.getSectionLessons(sectionId as SectionId);
  });

/**
 * Get lesson by ID atom factory
 */
export const lessonByIdAtom = (lessonId: string) =>
  Atom.make((get): Lesson | undefined => {
    const data = get(courseDataAtom);
    if (!data) return undefined;
    return data.getLessonById(lessonId as LessonId);
  });

/**
 * Get section by ID atom factory
 */
export const sectionByIdAtom = (sectionId: string) =>
  Atom.make((get): Section | undefined => {
    const data = get(courseDataAtom);
    if (!data) return undefined;
    return data.getSectionById(sectionId as SectionId);
  });

/**
 * Get lesson parts atom factory
 */
export const lessonPartsForLessonAtom = (lessonId: string) =>
  Atom.make((get): ReadonlyArray<LessonPart> => {
    const data = get(courseDataAtom);
    if (!data) return [];
    return data.getLessonParts(lessonId as LessonId);
  });

/**
 * Get next lesson atom factory
 */
export const nextLessonForAtom = (lessonId: string) =>
  Atom.make((get): Lesson | undefined => {
    const data = get(courseDataAtom);
    if (!data) return undefined;
    return data.getNextLesson(lessonId as LessonId);
  });

/**
 * Get previous lesson atom factory
 */
export const previousLessonForAtom = (lessonId: string) =>
  Atom.make((get): Lesson | undefined => {
    const data = get(courseDataAtom);
    if (!data) return undefined;
    return data.getPreviousLesson(lessonId as LessonId);
  });

/**
 * Get path by ID atom factory
 */
export const pathByIdAtom = (pathId: string) =>
  Atom.make((get): Path | undefined => {
    const data = get(courseDataAtom);
    if (!data || !data.getPathById) return undefined;
    return data.getPathById(pathId as PathId);
  });

/**
 * Get path lessons atom factory
 */
export const pathLessonsAtom = (pathId: string) =>
  Atom.make((get): ReadonlyArray<Lesson> => {
    const data = get(courseDataAtom);
    if (!data || !data.getPathLessons) return [];
    return data.getPathLessons(pathId as PathId);
  });

// =============================================================================
// Progress Atoms
// =============================================================================

/**
 * Progress update action type
 */
export type ProgressUpdate = Data.TaggedEnum<{
  MarkComplete: { lessonId: string };
  MarkInProgress: { lessonId: string; progressPercent: number };
  Reset: { lessonId: string };
}>;

export const ProgressUpdate = Data.taggedEnum<ProgressUpdate>();

type ProgressMap = Map<string, ClientLessonProgress>;

/**
 * Internal store for progress - keyed by lessonId.
 * Hydrated from server on load for authenticated users,
 * falls back to local-only for unauthenticated users.
 */
export const progressStoreAtom = Atom.make<ProgressMap>(new Map()).pipe(
  Atom.keepAlive
);

/**
 * Progress atom - writable atom for lesson progress.
 *
 * Optimistic UI: updates local state immediately, then persists
 * to server in the background for authenticated users.
 */
export const progressAtom: Atom.Writable<ProgressMap, ProgressUpdate> =
  Atom.writable(
    (get) => get(progressStoreAtom),
    (ctx, update: ProgressUpdate) => {
      const current = ctx.get(progressStoreAtom);
      const newMap = new Map(current);

      switch (update._tag) {
        case "MarkComplete":
          newMap.set(update.lessonId, {
            lessonId: update.lessonId,
            status: "completed",
            progressPercent: 100,
            completedAt: new Date().toISOString(),
          });
          // Persist to server (fire-and-forget)
          persistMarkComplete(update.lessonId);
          break;
        case "MarkInProgress":
          newMap.set(update.lessonId, {
            lessonId: update.lessonId,
            status: "in_progress",
            progressPercent: update.progressPercent,
          });
          break;
        case "Reset":
          newMap.delete(update.lessonId);
          break;
      }

      ctx.set(progressStoreAtom, newMap);
    }
  );

/**
 * Get progress for a specific lesson
 */
export const lessonProgressAtom = (lessonId: string) =>
  Atom.make((get) => {
    const progress = get(progressAtom);
    return Option.fromNullable(progress.get(lessonId));
  });

/**
 * Overall course progress (percentage)
 */
export const courseProgressAtom = Atom.make((get) => {
  const progress = get(progressAtom);
  const lessons = get(lessonsAtom);

  const completedCount = Array.from(progress.values()).filter(
    (p) => p.status === "completed"
  ).length;

  return {
    completed: completedCount,
    total: lessons.length,
    percent: lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0,
  };
});

// =============================================================================
// Section Progress Atoms
// =============================================================================

/**
 * Get progress for a specific section
 */
export const sectionProgressAtom = (sectionId: string) =>
  Atom.make((get) => {
    const progress = get(progressAtom);
    const lessons = get(sectionLessonsAtom(sectionId));

    const completedCount = lessons.filter(
      (l) => progress.get(l.id)?.status === "completed"
    ).length;

    return {
      completed: completedCount,
      total: lessons.length,
      percent: lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0,
    };
  });

// =============================================================================
// Week / Course Order Atoms
// =============================================================================

import type {
  Week,
  WeekId,
  CourseOrder,
} from "../../../data/course-registry.js";

/**
 * Weeks atom - returns all weeks for current course (if course order exists)
 */
export const weeksAtom = Atom.make((get): ReadonlyArray<Week> => {
  const data = get(courseDataAtom);
  return data?.weeks ?? [];
});

/**
 * Course order atom - returns the CourseOrder if available
 */
export const courseOrderAtom = Atom.make((get): CourseOrder | undefined => {
  const data = get(courseDataAtom);
  return data?.courseOrder;
});

/**
 * Has course order atom - check if course uses week-based ordering
 */
export const hasCourseOrderAtom = Atom.make((get): boolean => {
  const courseOrder = get(courseOrderAtom);
  return courseOrder !== undefined;
});

/**
 * Week by ID atom factory
 */
export const weekByIdAtom = (weekId: string) =>
  Atom.make((get): Week | undefined => {
    const data = get(courseDataAtom);
    if (!data?.getWeekById) return undefined;
    return data.getWeekById(weekId as WeekId);
  });

/**
 * Week lessons atom factory - get lessons for a specific week
 */
export const weekLessonsAtom = (weekId: string) =>
  Atom.make((get): ReadonlyArray<Lesson> => {
    const data = get(courseDataAtom);
    if (!data?.getWeekLessons) return [];
    return data.getWeekLessons(weekId as WeekId);
  });

/**
 * Ordered lessons atom - all lessons in course order
 */
export const orderedLessonsAtom = Atom.make((get): ReadonlyArray<Lesson> => {
  const data = get(courseDataAtom);
  if (!data?.getOrderedLessons) {
    // Fallback to section-based order
    return get(lessonsAtom);
  }
  return data.getOrderedLessons();
});

/**
 * Get week for a specific lesson
 */
export const weekForLessonAtom = (lessonId: string) =>
  Atom.make((get): Week | undefined => {
    const data = get(courseDataAtom);
    if (!data?.getWeekForLesson) return undefined;
    return data.getWeekForLesson(lessonId as LessonId);
  });

/**
 * Week progress atom factory
 */
export const weekProgressAtom = (weekId: string) =>
  Atom.make((get) => {
    const data = get(courseDataAtom);
    const progress = get(progressAtom);

    if (!data?.getWeekLessons) {
      return { completed: 0, total: 0, percent: 0 };
    }

    const lessons = data.getWeekLessons(weekId as WeekId);
    const completedCount = lessons.filter(
      (l) => progress.get(l.id)?.status === "completed"
    ).length;

    return {
      completed: completedCount,
      total: lessons.length,
      percent: lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0,
    };
  });

/**
 * Expanded weeks update action type
 */
export type ExpandedWeeksUpdate = Data.TaggedEnum<{
  Toggle: { weekId: string };
  Expand: { weekId: string };
  Collapse: { weekId: string };
  ExpandAll: {};
  CollapseAll: {};
}>;

export const ExpandedWeeksUpdate = Data.taggedEnum<ExpandedWeeksUpdate>();

/**
 * Internal store for expanded weeks
 */
const expandedWeeksStoreAtom = Atom.make<Set<string>>(new Set<string>()).pipe(
  Atom.keepAlive
);

/**
 * Expanded weeks atom (for sidebar week navigation)
 */
export const expandedWeeksAtom: Atom.Writable<
  Set<string>,
  ExpandedWeeksUpdate
> = Atom.writable(
  (get) => get(expandedWeeksStoreAtom),
  (ctx, update: ExpandedWeeksUpdate) => {
    const current = ctx.get(expandedWeeksStoreAtom);
    const weeks = ctx.get(weeksAtom);
    const newSet = new Set(current);

    switch (update._tag) {
      case "Toggle":
        if (newSet.has(update.weekId)) {
          newSet.delete(update.weekId);
        } else {
          newSet.add(update.weekId);
        }
        break;
      case "Expand":
        newSet.add(update.weekId);
        break;
      case "Collapse":
        newSet.delete(update.weekId);
        break;
      case "ExpandAll":
        weeks.forEach((w) => newSet.add(w.id));
        break;
      case "CollapseAll":
        newSet.clear();
        break;
    }

    ctx.set(expandedWeeksStoreAtom, newSet);
  }
);

// =============================================================================
// UI State Atoms
// =============================================================================

/**
 * Current lesson ID atom
 */
export const currentLessonIdAtom = Atom.make<string | null>(null).pipe(
  Atom.keepAlive
);

/**
 * Expanded sections update action type
 */
export type ExpandedSectionsUpdate = Data.TaggedEnum<{
  Toggle: { sectionId: string };
  Expand: { sectionId: string };
  Collapse: { sectionId: string };
  ExpandAll: {};
  CollapseAll: {};
}>;

export const ExpandedSectionsUpdate = Data.taggedEnum<ExpandedSectionsUpdate>();

/**
 * Internal store for expanded sections
 */
const expandedSectionsStoreAtom = Atom.make<Set<string>>(
  new Set<string>()
).pipe(Atom.keepAlive);

/**
 * Expanded sections atom (for sidebar)
 */
export const expandedSectionsAtom: Atom.Writable<
  Set<string>,
  ExpandedSectionsUpdate
> = Atom.writable(
  (get) => get(expandedSectionsStoreAtom),
  (ctx, update: ExpandedSectionsUpdate) => {
    const current = ctx.get(expandedSectionsStoreAtom);
    const sections = ctx.get(sectionsAtom);
    const newSet = new Set(current);

    switch (update._tag) {
      case "Toggle":
        if (newSet.has(update.sectionId)) {
          newSet.delete(update.sectionId);
        } else {
          newSet.add(update.sectionId);
        }
        break;
      case "Expand":
        newSet.add(update.sectionId);
        break;
      case "Collapse":
        newSet.delete(update.sectionId);
        break;
      case "ExpandAll":
        sections.forEach((s) => newSet.add(s.id));
        break;
      case "CollapseAll":
        newSet.clear();
        break;
    }

    ctx.set(expandedSectionsStoreAtom, newSet);
  }
);

/**
 * Mobile sidebar open state
 */
export const sidebarOpenAtom = Atom.make(false).pipe(Atom.keepAlive);

// =============================================================================
// Derived Navigation Atoms
// =============================================================================

/**
 * Current lesson data (derived from currentLessonId)
 */
export const currentLessonAtom = Atom.make((get) => {
  const lessonId = get(currentLessonIdAtom);
  if (!lessonId) return Option.none<Lesson>();
  const lesson = get(lessonByIdAtom(lessonId));
  return Option.fromNullable(lesson);
});

/**
 * Current section data (derived from current lesson)
 */
export const currentSectionAtom = Atom.make((get) => {
  const lesson = get(currentLessonAtom);
  if (Option.isNone(lesson)) return Option.none<Section>();
  const section = get(sectionByIdAtom(lesson.value.sectionId));
  return Option.fromNullable(section);
});

/**
 * Next lesson (derived from current lesson)
 */
export const nextLessonAtom = Atom.make((get) => {
  const lessonId = get(currentLessonIdAtom);
  if (!lessonId) return Option.none<Lesson>();
  const lesson = get(nextLessonForAtom(lessonId));
  return Option.fromNullable(lesson);
});

/**
 * Previous lesson (derived from current lesson)
 */
export const previousLessonAtom = Atom.make((get) => {
  const lessonId = get(currentLessonIdAtom);
  if (!lessonId) return Option.none<Lesson>();
  const lesson = get(previousLessonForAtom(lessonId));
  return Option.fromNullable(lesson);
});

/**
 * First incomplete lesson (for "Continue" button)
 */
export const firstIncompleteLessonAtom = Atom.make((get) => {
  const progress = get(progressAtom);
  const lessons = get(lessonsAtom);

  const firstIncomplete = lessons.find((l) => {
    const p = progress.get(l.id);
    return !p || p.status !== "completed";
  });

  return Option.fromNullable(firstIncomplete);
});

// =============================================================================
// Route Helpers Atom
// =============================================================================

export interface CourseRoutes {
  home: string;
  dashboard: string;
  lesson: (lessonId: string) => string;
  admin: string;
  messages: string;
}

/**
 * Course routes atom - generates route paths based on current slug
 */
export const courseRoutesAtom = Atom.make((get): CourseRoutes => {
  const slug = get(courseSlugAtom);
  return {
    home: `/${slug}`,
    dashboard: `/${slug}/dashboard`,
    lesson: (lessonId: string) => `/${slug}/lesson/${lessonId}`,
    admin: `/${slug}/admin`,
    messages: `/${slug}/messages`,
  };
});

// =============================================================================
// Re-exports for convenience
// =============================================================================

export type { LessonPart };
