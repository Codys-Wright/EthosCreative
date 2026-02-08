import { serializable } from '@core/client/atom-utils';
import { Result } from '@effect-atom/atom-react';
import * as RpcClientError from '@effect/rpc/RpcClientError';
import * as Effect from 'effect/Effect';
import * as S from 'effect/Schema';
import { LessonId } from '../../lesson/domain/schema.js';
import {
  CreateLessonPartInput,
  LessonPart,
  LessonPartId,
  UpdateLessonPartInput,
} from '../domain/index.js';
import { LessonPartClient } from './client.js';

const LessonPartsSchema = S.Array(LessonPart);

// ============================================================================
// Query Atoms
// ============================================================================

/**
 * Lesson parts for a specific lesson (parameterized atom family)
 */
export const lessonPartsByLessonAtomFamily = (lessonId: LessonId) =>
  LessonPartClient.runtime
    .atom(
      Effect.gen(function* () {
        const client = yield* LessonPartClient;
        return yield* client('lessonPart_listByLesson', { lessonId });
      }),
    )
    .pipe(
      serializable({
        key: `@course/lesson-parts/lesson/${lessonId}`,
        schema: Result.Schema({
          success: LessonPartsSchema,
          error: RpcClientError.RpcClientError,
        }),
      }),
    );

// ============================================================================
// Mutation Atoms
// ============================================================================

/**
 * Create a new lesson part
 */
export const createLessonPartAtom = LessonPartClient.runtime.fn<CreateLessonPartInput>()(
  Effect.fnUntraced(function* (input) {
    const client = yield* LessonPartClient;
    return yield* client('lessonPart_create', { input });
  }),
);

/**
 * Update an existing lesson part
 */
export const updateLessonPartAtom = LessonPartClient.runtime.fn<{
  readonly id: LessonPartId;
  readonly input: UpdateLessonPartInput;
}>()(
  Effect.fnUntraced(function* ({ id, input }) {
    const client = yield* LessonPartClient;
    return yield* client('lessonPart_update', { id, input });
  }),
);

/**
 * Reorder lesson parts within a lesson
 */
export const reorderLessonPartsAtom = LessonPartClient.runtime.fn<{
  readonly lessonId: LessonId;
  readonly partIds: ReadonlyArray<LessonPartId>;
}>()(
  Effect.fnUntraced(function* ({ lessonId, partIds }) {
    const client = yield* LessonPartClient;
    yield* client('lessonPart_reorder', { lessonId, partIds });
  }),
);

/**
 * Delete a lesson part
 */
export const deleteLessonPartAtom = LessonPartClient.runtime.fn<LessonPartId>()(
  Effect.fnUntraced(function* (id) {
    const client = yield* LessonPartClient;
    yield* client('lessonPart_delete', { id });
  }),
);
