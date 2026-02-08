import * as Effect from 'effect/Effect';
import { LessonPartRepository } from '../database/repo.js';
import type { LessonId } from '../../lesson/domain/schema.js';
import type {
  CreateLessonPartInput,
  LessonPartId,
  UpdateLessonPartInput,
} from '../domain/index.js';

export class LessonPartService extends Effect.Service<LessonPartService>()(
  '@course/LessonPartService',
  {
    dependencies: [LessonPartRepository.Default],
    effect: Effect.gen(function* () {
      const repo = yield* LessonPartRepository;

      return {
        getById: (id: LessonPartId) => repo.findById(id),
        listByLesson: (lessonId: LessonId) => repo.findByLesson(lessonId),
        create: (input: CreateLessonPartInput) => repo.create(input),
        update: (id: LessonPartId, input: UpdateLessonPartInput) => repo.update(id, input),
        reorder: (partIds: readonly LessonPartId[]) => repo.reorder([...partIds]),
        delete: (id: LessonPartId) => repo.delete(id),
      } as const;
    }),
  },
) {}
