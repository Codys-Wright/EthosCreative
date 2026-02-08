import * as SqlClient from "@effect/sql/SqlClient";
import * as Effect from "effect/Effect";

export default Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  // ===========================================
  // Course Paths - parallel learning paths within a course
  // ===========================================
  yield* sql`
    CREATE TABLE IF NOT EXISTS public.course_paths (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,

      -- Display
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,

      -- Visual styling
      color TEXT NOT NULL DEFAULT '#3B82F6',
      icon TEXT,

      -- Ordering
      sort_order INTEGER NOT NULL DEFAULT 0,

      -- Timestamps
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

      UNIQUE(course_id, slug)
    )
  `;

  yield* sql`CREATE INDEX IF NOT EXISTS idx_course_paths_course ON public.course_paths(course_id)`;
  yield* sql`CREATE INDEX IF NOT EXISTS idx_course_paths_slug ON public.course_paths(course_id, slug)`;

  // ===========================================
  // Add path_id and is_published to course_lessons
  // ===========================================
  yield* sql`
    ALTER TABLE public.course_lessons
    ADD COLUMN IF NOT EXISTS path_id UUID REFERENCES public.course_paths(id) ON DELETE SET NULL
  `;

  yield* sql`
    ALTER TABLE public.course_lessons
    ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true
  `;

  yield* sql`CREATE INDEX IF NOT EXISTS idx_course_lessons_path ON public.course_lessons(path_id)`;

  // ===========================================
  // Lesson Parts - subdivisions within a lesson
  // ===========================================
  yield* sql`
    CREATE TABLE IF NOT EXISTS public.course_lesson_parts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,

      -- Content
      title TEXT NOT NULL,

      -- Part type (same as lesson types)
      type TEXT NOT NULL CHECK (type IN ('video', 'text', 'quiz', 'assignment', 'download')),

      -- Ordering within the lesson
      sort_order INTEGER NOT NULL DEFAULT 0,

      -- Duration in minutes
      duration_minutes INTEGER NOT NULL DEFAULT 0,

      -- MDX content for text/assignment parts
      mdx_content TEXT,

      -- Video content (JSONB for flexibility)
      video_content JSONB,

      -- Quiz reference
      quiz_id UUID,
      quiz_passing_score INTEGER,
      quiz_is_required BOOLEAN DEFAULT false,

      -- Download files
      download_files JSONB DEFAULT '[]',

      -- Timestamps
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  yield* sql`CREATE INDEX IF NOT EXISTS idx_course_lesson_parts_lesson ON public.course_lesson_parts(lesson_id)`;
  yield* sql`CREATE INDEX IF NOT EXISTS idx_course_lesson_parts_order ON public.course_lesson_parts(lesson_id, sort_order)`;
});
