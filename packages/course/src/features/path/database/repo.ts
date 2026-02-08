import { PgLive } from '@core/database';
import * as SqlClient from '@effect/sql/SqlClient';
import * as SqlSchema from '@effect/sql/SqlSchema';
import * as Effect from 'effect/Effect';
import * as S from 'effect/Schema';

import { CourseId } from '../../course/domain/schema.js';
import { Path, PathId, PathNotFoundError } from '../domain/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// Column list for SELECT queries
// ─────────────────────────────────────────────────────────────────────────────

const PATH_COLUMNS = `
  id,
  course_id AS "courseId",
  name,
  slug,
  description,
  color,
  icon,
  sort_order AS "sortOrder",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

// ─────────────────────────────────────────────────────────────────────────────
// Repository
// ─────────────────────────────────────────────────────────────────────────────

export class PathRepository extends Effect.Service<PathRepository>()(
  '@course/PathRepository',
  {
    dependencies: [PgLive],
    effect: Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;

      const findById = SqlSchema.single({
        Result: Path,
        Request: S.Struct({ id: PathId }),
        execute: ({ id }) => sql`
          SELECT ${sql.literal(PATH_COLUMNS)}
          FROM course_paths
          WHERE id = ${id}
        `,
      });

      const findByCourse = SqlSchema.findAll({
        Result: Path,
        Request: S.Struct({ courseId: CourseId }),
        execute: ({ courseId }) => sql`
          SELECT ${sql.literal(PATH_COLUMNS)}
          FROM course_paths
          WHERE course_id = ${courseId}
          ORDER BY sort_order ASC
        `,
      });

      return {
        findById: (id: PathId) =>
          findById({ id }).pipe(
            Effect.catchTags({
              NoSuchElementException: () => new PathNotFoundError({ id }),
              ParseError: Effect.die,
              SqlError: Effect.die,
            }),
          ),

        findByCourse: (courseId: CourseId) => findByCourse({ courseId }).pipe(Effect.orDie),
      } as const;
    }),
  },
) {}
