import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import { LessonPartRpc } from '../domain/index.js';
import { LessonPartService } from './service.js';

export const LessonPartRpcLive = LessonPartRpc.toLayer(
  Effect.gen(function* () {
    const parts = yield* LessonPartService;

    return LessonPartRpc.of({
      lessonPart_getById: Effect.fn('LessonPartRpc.getById')(function* ({ id }) {
        yield* Effect.log(`[RPC] Getting lesson part by id: ${id}`);
        return yield* parts.getById(id);
      }),

      lessonPart_listByLesson: Effect.fn('LessonPartRpc.listByLesson')(function* ({ lessonId }) {
        yield* Effect.log(`[RPC] Listing lesson parts for lesson: ${lessonId}`);
        return yield* parts.listByLesson(lessonId);
      }),

      lessonPart_create: Effect.fn('LessonPartRpc.create')(function* ({ input }) {
        yield* Effect.log(`[RPC] Creating lesson part: ${input.title}`);
        return yield* parts.create(input);
      }),

      lessonPart_update: Effect.fn('LessonPartRpc.update')(function* ({ id, input }) {
        yield* Effect.log(`[RPC] Updating lesson part: ${id}`);
        return yield* parts.update(id, input);
      }),

      lessonPart_reorder: Effect.fn('LessonPartRpc.reorder')(function* ({ partIds }) {
        yield* Effect.log(`[RPC] Reordering ${partIds.length} lesson parts`);
        return yield* parts.reorder([...partIds]);
      }),

      lessonPart_delete: Effect.fn('LessonPartRpc.delete')(function* ({ id }) {
        yield* Effect.log(`[RPC] Deleting lesson part: ${id}`);
        return yield* parts.delete(id);
      }),
    });
  }),
).pipe(Layer.provide(LessonPartService.Default));
