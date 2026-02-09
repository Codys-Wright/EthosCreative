import { PgLive } from '@core/database';
import * as SqlClient from '@effect/sql/SqlClient';
import * as SqlSchema from '@effect/sql/SqlSchema';
import * as Effect from 'effect/Effect';
import * as S from 'effect/Schema';

import { LessonId, LessonType } from '../../lesson/domain/schema.js';
import {
  CreateLessonPartInput,
  LessonPart,
  LessonPartId,
  LessonPartNotFoundError,
  UpdateLessonPartInput,
} from '../domain/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// Internal Input Schemas
// ─────────────────────────────────────────────────────────────────────────────

const InsertLessonPart = S.Struct({
  lesson_id: S.UUID,
  title: S.String,
  type: LessonType,
  sort_order: S.Number,
  duration_minutes: S.Number,
  mdx_content: S.NullOr(S.String),
  video_content: S.NullOr(S.String),
  quiz_id: S.NullOr(S.UUID),
  quiz_passing_score: S.NullOr(S.Number),
  quiz_is_required: S.Boolean,
  download_files: S.NullOr(S.String),
});

const UpdateLessonPartDb = S.Struct({
  id: LessonPartId,
  title: S.optional(S.String),
  type: S.optional(LessonType),
  sort_order: S.optional(S.Number),
  duration_minutes: S.optional(S.Number),
  mdx_content: S.optional(S.NullOr(S.String)),
  video_content: S.optional(S.NullOr(S.String)),
  quiz_id: S.optional(S.NullOr(S.UUID)),
  quiz_passing_score: S.optional(S.NullOr(S.Number)),
  quiz_is_required: S.optional(S.Boolean),
  download_files: S.optional(S.NullOr(S.String)),
});
type UpdateLessonPartDb = typeof UpdateLessonPartDb.Type;

// ─────────────────────────────────────────────────────────────────────────────
// Column list for SELECT queries
// ─────────────────────────────────────────────────────────────────────────────

const LESSON_PART_COLUMNS = `
  id,
  lesson_id AS "lessonId",
  title,
  type,
  sort_order AS "sortOrder",
  duration_minutes AS "durationMinutes",
  mdx_content AS "mdxContent",
  video_content AS "videoContent",
  quiz_id AS "quizId",
  quiz_passing_score AS "quizPassingScore",
  quiz_is_required AS "quizIsRequired",
  download_files AS "downloadFiles",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

// ─────────────────────────────────────────────────────────────────────────────
// Repository
// ─────────────────────────────────────────────────────────────────────────────

export class LessonPartRepository extends Effect.Service<LessonPartRepository>()(
  '@course/LessonPartRepository',
  {
    dependencies: [PgLive],
    effect: Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;

      const findById = SqlSchema.single({
        Result: LessonPart,
        Request: S.Struct({ id: LessonPartId }),
        execute: ({ id }) => sql`
          SELECT ${sql.literal(LESSON_PART_COLUMNS)}
          FROM course_lesson_parts
          WHERE id = ${id}
        `,
      });

      const findByLesson = SqlSchema.findAll({
        Result: LessonPart,
        Request: S.Struct({ lessonId: LessonId }),
        execute: ({ lessonId }) => sql`
          SELECT ${sql.literal(LESSON_PART_COLUMNS)}
          FROM course_lesson_parts
          WHERE lesson_id = ${lessonId}
          ORDER BY sort_order ASC
        `,
      });

      const getNextSortOrder = SqlSchema.single({
        Result: S.Struct({ nextOrder: S.Number }),
        Request: S.Struct({ lessonId: LessonId }),
        execute: ({ lessonId }) => sql`
          SELECT COALESCE(MAX(sort_order), 0) + 1 AS "nextOrder"
          FROM course_lesson_parts
          WHERE lesson_id = ${lessonId}
        `,
      });

      const create = SqlSchema.single({
        Result: LessonPart,
        Request: InsertLessonPart,
        execute: (input) => sql`
          INSERT INTO course_lesson_parts ${sql.insert(input)}
          RETURNING ${sql.literal(LESSON_PART_COLUMNS)}
        `,
      });

      const update = SqlSchema.single({
        Result: LessonPart,
        Request: UpdateLessonPartDb,
        execute: (input) => sql`
          UPDATE course_lesson_parts
          SET
            ${sql.update(input, ['id'])},
            updated_at = NOW()
          WHERE id = ${input.id}
          RETURNING ${sql.literal(LESSON_PART_COLUMNS)}
        `,
      });

      const updateSortOrder = SqlSchema.void({
        Request: S.Struct({
          id: LessonPartId,
          sortOrder: S.Number,
        }),
        execute: ({ id, sortOrder }) => sql`
          UPDATE course_lesson_parts
          SET sort_order = ${sortOrder}, updated_at = NOW()
          WHERE id = ${id}
        `,
      });

      const del = SqlSchema.single({
        Result: S.Unknown,
        Request: LessonPartId,
        execute: (id) => sql`
          DELETE FROM course_lesson_parts
          WHERE id = ${id}
          RETURNING id
        `,
      });

      return {
        findById: (id: LessonPartId) =>
          findById({ id }).pipe(
            Effect.catchTags({
              NoSuchElementException: () => new LessonPartNotFoundError({ id }),
              ParseError: Effect.die,
              SqlError: Effect.die,
            }),
          ),

        findByLesson: (lessonId: LessonId) => findByLesson({ lessonId }).pipe(Effect.orDie),

        create: (input: CreateLessonPartInput) =>
          Effect.gen(function* () {
            const sortOrder =
              input.sortOrder ??
              (yield* getNextSortOrder({ lessonId: input.lessonId })).nextOrder;

            return yield* create({
              lesson_id: input.lessonId,
              title: input.title,
              type: input.type,
              sort_order: sortOrder,
              duration_minutes: input.durationMinutes ?? 0,
              mdx_content: input.mdxContent ?? null,
              video_content: input.videoContent ? JSON.stringify(input.videoContent) : null,
              quiz_id: input.quizId ?? null,
              quiz_passing_score: input.quizPassingScore ?? null,
              quiz_is_required: input.quizIsRequired ?? false,
              download_files: input.downloadFiles ? JSON.stringify(input.downloadFiles) : null,
            });
          }).pipe(Effect.orDie),

        update: (id: LessonPartId, input: UpdateLessonPartInput) =>
          update({
            id,
            ...(input.title !== undefined && { title: input.title }),
            ...(input.type !== undefined && { type: input.type }),
            ...(input.sortOrder !== undefined && { sort_order: input.sortOrder }),
            ...(input.durationMinutes !== undefined && { duration_minutes: input.durationMinutes }),
            ...(input.mdxContent !== undefined && { mdx_content: input.mdxContent }),
            ...(input.videoContent !== undefined && {
              video_content: input.videoContent ? JSON.stringify(input.videoContent) : null,
            }),
            ...(input.quizId !== undefined && { quiz_id: input.quizId }),
            ...(input.quizPassingScore !== undefined && {
              quiz_passing_score: input.quizPassingScore,
            }),
            ...(input.quizIsRequired !== undefined && {
              quiz_is_required: input.quizIsRequired,
            }),
            ...(input.downloadFiles !== undefined && {
              download_files: input.downloadFiles ? JSON.stringify(input.downloadFiles) : null,
            }),
          }).pipe(
            Effect.catchTags({
              NoSuchElementException: () => new LessonPartNotFoundError({ id }),
              ParseError: Effect.die,
              SqlError: Effect.die,
            }),
          ),

        reorder: (partIds: LessonPartId[]) =>
          Effect.forEach(partIds, (id, index) =>
            updateSortOrder({ id, sortOrder: index }).pipe(Effect.orDie),
          ).pipe(Effect.asVoid),

        delete: (id: LessonPartId) =>
          del(id).pipe(
            Effect.asVoid,
            Effect.catchTags({
              NoSuchElementException: () => new LessonPartNotFoundError({ id }),
              ParseError: Effect.die,
              SqlError: Effect.die,
            }),
          ),
      } as const;
    }),
  },
) {}
