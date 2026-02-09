/**
 * Database Migration Script for Songmaking
 *
 * Runs all database migrations in order:
 * 1. Better Auth migrations (user, session, account tables)
 * 2. Course migrations (courses, sections, lessons, lesson_parts, paths)
 *
 * Usage:
 *   bun run db:migrate
 */

import * as Effect from 'effect/Effect';
import * as Logger from 'effect/Logger';

import { runBetterAuthMigrations } from '@auth/database';
import { runMigrations } from '@core/database';
import { CourseMigrations } from '@course/database';

await Effect.runPromise(
  Effect.gen(function* () {
    // Better Auth handles its own migrations via Kysely
    yield* runBetterAuthMigrations;
    yield* Effect.log('[Migrate] Better Auth migrations complete.');

    // Run course migrations via Effect SQL
    yield* runMigrations(CourseMigrations);
    yield* Effect.log('[Migrate] Course migrations complete.');
  }).pipe(Effect.provide(Logger.pretty)),
);
