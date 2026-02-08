/**
 * Course Data Seed Script for Songmaking
 *
 * Seeds the database with the songmaking course content.
 * This inserts the actual course data (not fake/test data) including:
 * - Instructor profile for the course creator
 * - The songmaking course
 * - All sections, lessons, lesson parts, and paths
 *
 * This is idempotent - safe to run multiple times.
 *
 * Usage:
 *   bun run db:seed:courses
 */

import * as SqlClient from '@effect/sql/SqlClient';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Logger from 'effect/Logger';
import * as BunContext from '@effect/platform-bun/BunContext';
import { PgLive } from '@core/database';

import {
  SONGMAKING_COURSE,
  SONGMAKING_SECTIONS,
  SONGMAKING_LESSONS,
  SONGMAKING_LESSON_PARTS,
  SONGMAKING_PATHS,
} from '../data/course.js';

const seedCourses = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  yield* Effect.log('[SeedCourses] Starting course data seed...');

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Ensure an instructor profile exists for the course
  // ─────────────────────────────────────────────────────────────────────────

  // Check if we have any user to link as instructor
  const users = yield* sql<{ id: string }>`SELECT id FROM "user" LIMIT 1`;
  const userId = users.length > 0 ? users[0].id : null;

  if (!userId) {
    yield* Effect.log('[SeedCourses] No users found. Run db:seed first to create a dev admin user.');
    return;
  }

  // Upsert instructor profile
  const course = SONGMAKING_COURSE;
  yield* sql`
    INSERT INTO instructor_profiles (id, user_id, display_name, bio, headline, status, total_students, total_courses, total_reviews, created_at, updated_at)
    VALUES (${course.instructorId}, ${userId}, 'Course Instructor', 'Songmaking course instructor', 'Music Educator', 'approved', 0, 1, 0, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      status = 'approved',
      updated_at = NOW()
  `;
  yield* Effect.log('[SeedCourses] Instructor profile created/updated.');

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Upsert the course
  // ─────────────────────────────────────────────────────────────────────────

  yield* sql`
    INSERT INTO courses (
      id, instructor_id, title, slug, subtitle, description,
      thumbnail_url, level, language, status, published_at,
      total_duration_minutes, lesson_count, section_count,
      enrollment_count, review_count,
      tags,
      created_at, updated_at
    )
    VALUES (
      ${course.id}, ${course.instructorId}, ${course.title}, ${course.slug},
      ${course.subtitle ?? null}, ${course.description ?? null},
      ${course.thumbnailUrl ?? null}, ${course.level}, ${course.language},
      ${course.status}, NOW(),
      ${course.totalDurationMinutes}, ${course.lessonCount}, ${course.sectionCount},
      ${course.enrollmentCount}, ${course.reviewCount},
      ${JSON.stringify(course.tags ?? [])}::jsonb,
      NOW(), NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      subtitle = EXCLUDED.subtitle,
      description = EXCLUDED.description,
      total_duration_minutes = EXCLUDED.total_duration_minutes,
      lesson_count = EXCLUDED.lesson_count,
      section_count = EXCLUDED.section_count,
      updated_at = NOW()
  `;
  yield* Effect.log(`[SeedCourses] Course "${course.title}" created/updated.`);

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Upsert paths
  // ─────────────────────────────────────────────────────────────────────────

  for (const path of SONGMAKING_PATHS) {
    yield* sql`
      INSERT INTO course_paths (
        id, course_id, name, slug, description, color, icon, sort_order,
        created_at, updated_at
      )
      VALUES (
        ${path.id}, ${path.courseId}, ${path.name}, ${path.slug},
        ${path.description ?? null}, ${path.color}, ${path.icon ?? null},
        ${path.sortOrder}, NOW(), NOW()
      )
      ON CONFLICT (course_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        color = EXCLUDED.color,
        icon = EXCLUDED.icon,
        sort_order = EXCLUDED.sort_order,
        updated_at = NOW()
    `;
  }
  yield* Effect.log(`[SeedCourses] ${SONGMAKING_PATHS.length} paths created/updated.`);

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Upsert sections
  // ─────────────────────────────────────────────────────────────────────────

  for (const section of SONGMAKING_SECTIONS) {
    yield* sql`
      INSERT INTO course_sections (
        id, course_id, title, description, sort_order,
        lesson_count, total_duration_minutes,
        created_at, updated_at
      )
      VALUES (
        ${section.id}, ${section.courseId}, ${section.title},
        ${section.description ?? null}, ${section.sortOrder},
        ${section.lessonCount}, ${section.totalDurationMinutes},
        NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        sort_order = EXCLUDED.sort_order,
        lesson_count = EXCLUDED.lesson_count,
        total_duration_minutes = EXCLUDED.total_duration_minutes,
        updated_at = NOW()
    `;
  }
  yield* Effect.log(`[SeedCourses] ${SONGMAKING_SECTIONS.length} sections created/updated.`);

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Upsert lessons
  // ─────────────────────────────────────────────────────────────────────────

  for (const lesson of SONGMAKING_LESSONS) {
    yield* sql`
      INSERT INTO course_lessons (
        id, section_id, course_id, path_id, title, description, type,
        mdx_content, video_content,
        quiz_id, quiz_passing_score, quiz_is_required,
        download_files, sort_order, duration_minutes,
        is_free, is_preview, is_published,
        created_at, updated_at
      )
      VALUES (
        ${lesson.id}, ${lesson.sectionId}, ${lesson.courseId},
        ${lesson.pathId ?? null}, ${lesson.title}, ${lesson.description ?? null},
        ${lesson.type}, ${lesson.mdxContent ?? null},
        ${lesson.videoContent ? JSON.stringify(lesson.videoContent) : null}::jsonb,
        ${lesson.quizId ?? null}, ${lesson.quizPassingScore ?? null},
        ${lesson.quizIsRequired ?? false},
        ${lesson.downloadFiles ? JSON.stringify(lesson.downloadFiles) : '[]'}::jsonb,
        ${lesson.sortOrder}, ${lesson.durationMinutes},
        ${lesson.isFree}, ${lesson.isPreview}, ${lesson.isPublished},
        NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        type = EXCLUDED.type,
        mdx_content = EXCLUDED.mdx_content,
        video_content = EXCLUDED.video_content,
        path_id = EXCLUDED.path_id,
        sort_order = EXCLUDED.sort_order,
        duration_minutes = EXCLUDED.duration_minutes,
        is_free = EXCLUDED.is_free,
        is_preview = EXCLUDED.is_preview,
        is_published = EXCLUDED.is_published,
        updated_at = NOW()
    `;
  }
  yield* Effect.log(`[SeedCourses] ${SONGMAKING_LESSONS.length} lessons created/updated.`);

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Upsert lesson parts
  // ─────────────────────────────────────────────────────────────────────────

  for (const part of SONGMAKING_LESSON_PARTS) {
    yield* sql`
      INSERT INTO course_lesson_parts (
        id, lesson_id, title, type, sort_order, duration_minutes,
        mdx_content, video_content,
        quiz_id, quiz_passing_score, quiz_is_required,
        download_files,
        created_at, updated_at
      )
      VALUES (
        ${part.id}, ${part.lessonId}, ${part.title}, ${part.type},
        ${part.sortOrder}, ${part.durationMinutes},
        ${part.mdxContent ?? null},
        ${part.videoContent ? JSON.stringify(part.videoContent) : null}::jsonb,
        ${part.quizId ?? null}, ${part.quizPassingScore ?? null},
        ${part.quizIsRequired ?? false},
        ${part.downloadFiles ? JSON.stringify(part.downloadFiles) : '[]'}::jsonb,
        NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        type = EXCLUDED.type,
        sort_order = EXCLUDED.sort_order,
        duration_minutes = EXCLUDED.duration_minutes,
        mdx_content = EXCLUDED.mdx_content,
        video_content = EXCLUDED.video_content,
        updated_at = NOW()
    `;
  }
  yield* Effect.log(`[SeedCourses] ${SONGMAKING_LESSON_PARTS.length} lesson parts created/updated.`);

  yield* Effect.log('[SeedCourses] Course data seed complete!');
});

const SeedLive = Layer.mergeAll(PgLive, BunContext.layer, Logger.pretty);

await Effect.runPromise(
  seedCourses.pipe(
    Effect.provide(SeedLive),
    Effect.tapError((error) => Effect.logError(`[SeedCourses] Failed: ${error}`)),
    Effect.orDie,
  ),
);
