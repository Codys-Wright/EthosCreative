/**
 * Progress Sync Hook
 *
 * Bridges local progress atoms with the server-side RPC persistence layer.
 *
 * For authenticated users:
 * - Fetches progress from server on mount and hydrates the local store
 * - Progress mutations are automatically persisted via the atom writer
 *
 * For unauthenticated users:
 * - Progress remains local-only (in-memory, lost on refresh)
 * - The sidebar prompts the user to sign in for persistence
 */

import { useEffect, useRef } from "react";
import { useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import { sessionAtom } from "@auth";
import { ProgressClient } from "@course/features/progress/client/client.js";
import type { CourseId } from "@course";
import * as Effect from "effect/Effect";
import {
  progressStoreAtom,
  courseAtom,
  setServerSyncEnabled,
  type ClientLessonProgress,
} from "./course-atoms.js";

/**
 * Hook that syncs lesson progress with the server.
 * Call this once at the course layout level (inside CourseProvider).
 */
export function useProgressSync() {
  const sessionResult = useAtomValue(sessionAtom);
  const session =
    sessionResult._tag === "Success" ? sessionResult.value : null;
  const userId = session?.user?.id;
  const isAuthenticated = Boolean(userId) && userId !== "anonymous";

  const course = useAtomValue(courseAtom);
  const setProgressStore = useAtomSet(progressStoreAtom);
  const hasFetchedRef = useRef<string | null>(null);

  // Enable/disable server sync based on auth status
  useEffect(() => {
    setServerSyncEnabled(isAuthenticated);
    return () => setServerSyncEnabled(false);
  }, [isAuthenticated]);

  // Fetch progress from server and hydrate local store
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!course?.id) return;

    // Avoid re-fetching for same user+course combo
    const key = `${userId}:${course.id}`;
    if (hasFetchedRef.current === key) return;
    hasFetchedRef.current = key;

    const effect = Effect.gen(function* () {
      const client = yield* ProgressClient;
      return yield* client("progress_listByCourse", {
        courseId: course.id as CourseId,
      });
    }).pipe(Effect.provide(ProgressClient.Default));

    Effect.runPromise(effect).then(
      (serverProgress) => {
        const newMap = new Map<string, ClientLessonProgress>();
        for (const p of serverProgress) {
          newMap.set(p.lessonId, {
            lessonId: p.lessonId,
            status: p.status,
            progressPercent: p.status === "completed" ? 100 : 0,
            completedAt: p.completedAt
              ? String(p.completedAt)
              : undefined,
          });
        }
        setProgressStore(newMap);
      },
      () => {
        // Silently fail - local progress still works
      }
    );
  }, [isAuthenticated, userId, course?.id, setProgressStore]);
}
