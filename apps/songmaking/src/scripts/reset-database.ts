/**
 * Database Reset Script for Songmaking
 *
 * Drops all tables from the database.
 * Use with caution - this will delete all data!
 *
 * Usage:
 *   bun run db:reset
 */

import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Logger from 'effect/Logger';
import * as BunContext from '@effect/platform-bun/BunContext';
import * as SqlClient from '@effect/sql/SqlClient';
import { PgLive } from '../../../../packages/core/src/database/pg-live.js';

const resetDatabase = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  yield* Effect.log('[ResetDatabase] Dropping all tables...');

  // Drop course tables (children first)
  yield* sql`DROP TABLE IF EXISTS public.course_lesson_parts CASCADE`;
  yield* sql`DROP TABLE IF EXISTS public.course_lessons CASCADE`;
  yield* sql`DROP TABLE IF EXISTS public.course_paths CASCADE`;
  yield* sql`DROP TABLE IF EXISTS public.course_sections CASCADE`;
  yield* sql`DROP TABLE IF EXISTS public.course_enrollments CASCADE`;
  yield* sql`DROP TABLE IF EXISTS public.course_progress CASCADE`;
  yield* sql`DROP TABLE IF EXISTS public.course_reviews CASCADE`;
  yield* sql`DROP TABLE IF EXISTS public.course_certificates CASCADE`;
  yield* sql`DROP TABLE IF EXISTS public.course_instructors CASCADE`;
  yield* sql`DROP TABLE IF EXISTS public.instructor_profiles CASCADE`;
  yield* sql`DROP TABLE IF EXISTS public.courses CASCADE`;
  yield* sql`DROP TABLE IF EXISTS public.course_categories CASCADE`;

  // Drop Effect SQL migrations table
  yield* sql`DROP TABLE IF EXISTS public.effect_sql_migrations CASCADE`;

  // Drop Better Auth tables
  yield* sql`DROP TABLE IF EXISTS public.passkey CASCADE`;
  yield* sql`DROP TABLE IF EXISTS public.two_factor CASCADE`;
  yield* sql`DROP TABLE IF EXISTS public.invitation CASCADE`;
  yield* sql`DROP TABLE IF EXISTS public.member CASCADE`;
  yield* sql`DROP TABLE IF EXISTS public.organization CASCADE`;
  yield* sql`DROP TABLE IF EXISTS public.verification CASCADE`;
  yield* sql`DROP TABLE IF EXISTS public.session CASCADE`;
  yield* sql`DROP TABLE IF EXISTS public.account CASCADE`;
  yield* sql`DROP TABLE IF EXISTS public.user CASCADE`;

  yield* Effect.log('[ResetDatabase] All tables dropped.');
  yield* Effect.log('[ResetDatabase] Run `bun run db:migrate` to recreate tables.');
});

const ResetLive = Layer.mergeAll(PgLive, BunContext.layer, Logger.pretty);

await Effect.runPromise(
  resetDatabase.pipe(
    Effect.provide(ResetLive),
    Effect.tapError((error) => Effect.logError(`[ResetDatabase] Failed: ${error}`)),
    Effect.orDie,
  ),
);
