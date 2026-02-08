/**
 * Mock Course Data for Songmaking
 *
 * Uses Effect Schema types from @course package.
 * In production, this data will come from the database via RPC.
 */

import {
  Course,
  CourseId,
  Section,
  SectionId,
  InstructorId,
  Lesson,
  LessonId,
  LessonPart,
  LessonPartId,
  VideoContent,
  LessonProgress,
  Path,
  PathId,
} from "@course";
import * as DateTime from "effect/DateTime";

// =============================================================================
// Helper to create video content
// =============================================================================

function makeVideoContent(
  videoId: string,
  durationSeconds: number
): VideoContent {
  return VideoContent.make({
    provider: "youtube",
    videoId,
    durationSeconds,
    thumbnailUrl: null,
  });
}

// =============================================================================
// Mock IDs
// =============================================================================

const COURSE_ID = CourseId.make("00000000-0000-0000-0000-000000000001");
const INSTRUCTOR_ID = InstructorId.make("00000000-0000-0000-0000-000000000002");

const SECTION_IDS = {
  introduction: SectionId.make("10000000-0000-0000-0000-000000000000"),
  songmaking: SectionId.make("10000000-0000-0000-0000-000000000001"),
  artistry: SectionId.make("10000000-0000-0000-0000-000000000002"),
  business: SectionId.make("10000000-0000-0000-0000-000000000003"),
} as const;

const LESSON_IDS = {
  // Section 0: Introduction
  welcome: LessonId.make("20000000-0000-0000-0000-000000000000"),
  courseOverview: LessonId.make("20000000-0000-0000-0000-000000000017"),
  // Section 1: Songmaking (technical craft)
  scales: LessonId.make("20000000-0000-0000-0000-000000000001"),
  chordProgressions: LessonId.make("20000000-0000-0000-0000-000000000002"),
  melodyWriting: LessonId.make("20000000-0000-0000-0000-000000000003"),
  lyricsBasics: LessonId.make("20000000-0000-0000-0000-000000000004"),
  rhymeSchemes: LessonId.make("20000000-0000-0000-0000-000000000005"),
  verseChorus: LessonId.make("20000000-0000-0000-0000-000000000006"),
  // Section 2: Artistry (creative development)
  creativeSpace: LessonId.make("20000000-0000-0000-0000-000000000007"),
  mindset: LessonId.make("20000000-0000-0000-0000-000000000008"),
  hookCreation: LessonId.make("20000000-0000-0000-0000-000000000009"),
  storytelling: LessonId.make("20000000-0000-0000-0000-000000000010"),
  emotionalConnection: LessonId.make("20000000-0000-0000-0000-000000000011"),
  dynamicArrangement: LessonId.make("20000000-0000-0000-0000-000000000012"),
  // Section 3: Business
  demoRecording: LessonId.make("20000000-0000-0000-0000-000000000013"),
  workingWithProducers: LessonId.make("20000000-0000-0000-0000-000000000014"),
  releasingMusic: LessonId.make("20000000-0000-0000-0000-000000000015"),
  buildingFanbase: LessonId.make("20000000-0000-0000-0000-000000000016"),
} as const;

const PART_IDS = {
  creativeSpace_intro: LessonPartId.make(
    "30000000-0000-0000-0000-000000000001"
  ),
  creativeSpace_essentials: LessonPartId.make(
    "30000000-0000-0000-0000-000000000002"
  ),
  creativeSpace_quiz: LessonPartId.make("30000000-0000-0000-0000-000000000003"),
  creativeSpace_advanced: LessonPartId.make(
    "30000000-0000-0000-0000-000000000004"
  ),
  mindset_video: LessonPartId.make("30000000-0000-0000-0000-000000000010"),
  scales_video: LessonPartId.make("30000000-0000-0000-0000-000000000020"),
  chordProgressions_text: LessonPartId.make(
    "30000000-0000-0000-0000-000000000030"
  ),
} as const;

const PATH_IDS = {
  songwriting: PathId.make("50000000-0000-0000-0000-000000000001"),
  artistry: PathId.make("50000000-0000-0000-0000-000000000002"),
  business: PathId.make("50000000-0000-0000-0000-000000000003"),
} as const;

// =============================================================================
// Mock Timestamps
// =============================================================================

const now = DateTime.unsafeNow();

// =============================================================================
// Mock Course
// =============================================================================

export const SONGMAKING_COURSE = Course.make({
  id: COURSE_ID,
  instructorId: INSTRUCTOR_ID,
  title: "Songmaking",
  slug: "songmaking",
  subtitle: "Learn to write and produce your own songs from scratch",
  description: `This comprehensive course takes you from complete beginner to confident songwriter.`,
  thumbnailUrl: "/images/songmaking-cover.jpg",
  categoryId: null,
  tags: ["music", "songwriting", "production"],
  level: "all-levels",
  language: "en",
  totalDurationMinutes: 245,
  lessonCount: 18,
  sectionCount: 5,
  enrollmentCount: 0,
  averageRating: null,
  reviewCount: 0,
  status: "published",
  publishedAt: now,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
});

// =============================================================================
// Mock Paths
// =============================================================================

export const SONGMAKING_PATHS: ReadonlyArray<Path> = [
  Path.make({
    id: PATH_IDS.songwriting,
    courseId: COURSE_ID,
    name: "Songwriting",
    slug: "songwriting",
    description:
      "Learn the craft of writing memorable melodies, harmonies, and lyrics",
    color: "#3B82F6", // blue
    icon: "music",
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  }),
  Path.make({
    id: PATH_IDS.artistry,
    courseId: COURSE_ID,
    name: "Artistry",
    slug: "artistry",
    description: "Develop your creative mindset and unique artistic voice",
    color: "#8B5CF6", // purple
    icon: "palette",
    sortOrder: 1,
    createdAt: now,
    updatedAt: now,
  }),
  Path.make({
    id: PATH_IDS.business,
    courseId: COURSE_ID,
    name: "Music Business",
    slug: "business",
    description: "Understand how to monetize and market your music",
    color: "#10B981", // green
    icon: "dollar-sign",
    sortOrder: 2,
    createdAt: now,
    updatedAt: now,
  }),
];

// =============================================================================
// Mock Sections
// =============================================================================

export const SONGMAKING_SECTIONS: ReadonlyArray<Section> = [
  Section.make({
    id: SECTION_IDS.introduction,
    courseId: COURSE_ID,
    title: "Introduction",
    description:
      "Welcome to the course and get started on your songwriting journey",
    sortOrder: 0,
    lessonCount: 2,
    totalDurationMinutes: 15,
    createdAt: now,
    updatedAt: now,
  }),
  Section.make({
    id: SECTION_IDS.songmaking,
    courseId: COURSE_ID,
    title: "Songmaking",
    description:
      "Learn the technical craft of writing melodies, chords, lyrics, and song structures",
    sortOrder: 1,
    lessonCount: 6,
    totalDurationMinutes: 90,
    createdAt: now,
    updatedAt: now,
  }),
  Section.make({
    id: SECTION_IDS.artistry,
    courseId: COURSE_ID,
    title: "Artistry",
    description: "Develop your creative mindset and unique artistic voice",
    sortOrder: 2,
    lessonCount: 6,
    totalDurationMinutes: 85,
    createdAt: now,
    updatedAt: now,
  }),
  Section.make({
    id: SECTION_IDS.business,
    courseId: COURSE_ID,
    title: "Business",
    description: "Record, release, and market your music to the world",
    sortOrder: 3,
    lessonCount: 4,
    totalDurationMinutes: 75,
    createdAt: now,
    updatedAt: now,
  }),
];

// =============================================================================
// Mock Lessons
// =============================================================================

export const SONGMAKING_LESSONS: ReadonlyArray<Lesson> = [
  // =============================================================================
  // Section 0: Introduction
  // =============================================================================
  Lesson.make({
    id: LESSON_IDS.welcome,
    sectionId: SECTION_IDS.introduction,
    courseId: COURSE_ID,
    pathId: null,
    title: "Welcome to Songmaking",
    description: "An introduction to the course and what you will learn",
    type: "video",
    mdxContent: null,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    sortOrder: 0,
    durationMinutes: 5,
    isFree: true,
    isPreview: true,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }),
  Lesson.make({
    id: LESSON_IDS.courseOverview,
    sectionId: SECTION_IDS.introduction,
    courseId: COURSE_ID,
    pathId: null,
    title: "Course Overview & Structure",
    description:
      "How the course is organized and how to get the most out of it",
    type: "text",
    mdxContent: null,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    sortOrder: 1,
    durationMinutes: 10,
    isFree: true,
    isPreview: false,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }),

  // =============================================================================
  // Section 1: Songmaking (technical craft)
  // =============================================================================
  Lesson.make({
    id: LESSON_IDS.scales,
    sectionId: SECTION_IDS.songmaking,
    courseId: COURSE_ID,
    pathId: PATH_IDS.songwriting,
    title: "Understanding Scales",
    description: "The foundation of melody - major and minor scales",
    type: "video",
    mdxContent: null,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    sortOrder: 0,
    durationMinutes: 14,
    isFree: true,
    isPreview: true,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }),
  Lesson.make({
    id: LESSON_IDS.chordProgressions,
    sectionId: SECTION_IDS.songmaking,
    courseId: COURSE_ID,
    pathId: PATH_IDS.songwriting,
    title: "Building Chord Progressions",
    description: "Learn the most common chord progressions in popular music",
    type: "text",
    mdxContent: null,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    sortOrder: 1,
    durationMinutes: 18,
    isFree: true,
    isPreview: false,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }),
  Lesson.make({
    id: LESSON_IDS.melodyWriting,
    sectionId: SECTION_IDS.songmaking,
    courseId: COURSE_ID,
    pathId: PATH_IDS.songwriting,
    title: "Writing Memorable Melodies",
    description: "Techniques for crafting melodies that stick",
    type: "video",
    mdxContent: null,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    sortOrder: 2,
    durationMinutes: 20,
    isFree: false,
    isPreview: false,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }),
  Lesson.make({
    id: LESSON_IDS.lyricsBasics,
    sectionId: SECTION_IDS.songmaking,
    courseId: COURSE_ID,
    pathId: PATH_IDS.songwriting,
    title: "Lyrics Fundamentals",
    description: "The building blocks of great lyrics",
    type: "text",
    mdxContent: null,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    sortOrder: 3,
    durationMinutes: 12,
    isFree: false,
    isPreview: false,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }),
  Lesson.make({
    id: LESSON_IDS.rhymeSchemes,
    sectionId: SECTION_IDS.songmaking,
    courseId: COURSE_ID,
    pathId: PATH_IDS.songwriting,
    title: "Rhyme Schemes & Patterns",
    description: "Master different rhyming techniques",
    type: "text",
    mdxContent: null,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    sortOrder: 4,
    durationMinutes: 14,
    isFree: false,
    isPreview: false,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }),
  Lesson.make({
    id: LESSON_IDS.verseChorus,
    sectionId: SECTION_IDS.songmaking,
    courseId: COURSE_ID,
    pathId: PATH_IDS.songwriting,
    title: "Verse-Chorus Dynamics",
    description: "Understanding the relationship between verses and choruses",
    type: "video",
    mdxContent: null,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    sortOrder: 5,
    durationMinutes: 15,
    isFree: false,
    isPreview: false,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }),

  // =============================================================================
  // Section 2: Artistry (creative development)
  // =============================================================================
  Lesson.make({
    id: LESSON_IDS.creativeSpace,
    sectionId: SECTION_IDS.artistry,
    courseId: COURSE_ID,
    pathId: PATH_IDS.artistry,
    title: "Setting Up Your Creative Space",
    description: "Create an environment that inspires creativity",
    type: "text",
    mdxContent: null,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    sortOrder: 0,
    durationMinutes: 15,
    isFree: true,
    isPreview: false,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }),
  Lesson.make({
    id: LESSON_IDS.mindset,
    sectionId: SECTION_IDS.artistry,
    courseId: COURSE_ID,
    pathId: PATH_IDS.artistry,
    title: "The Songwriting Mindset",
    description: "Develop habits and attitudes that support creativity",
    type: "video",
    mdxContent: null,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    sortOrder: 1,
    durationMinutes: 15,
    isFree: false,
    isPreview: false,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }),
  Lesson.make({
    id: LESSON_IDS.hookCreation,
    sectionId: SECTION_IDS.artistry,
    courseId: COURSE_ID,
    pathId: PATH_IDS.artistry,
    title: "Creating Irresistible Hooks",
    description: "The art of writing hooks that captivate listeners",
    type: "text",
    mdxContent: null,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    sortOrder: 2,
    durationMinutes: 15,
    isFree: false,
    isPreview: false,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }),
  Lesson.make({
    id: LESSON_IDS.storytelling,
    sectionId: SECTION_IDS.artistry,
    courseId: COURSE_ID,
    pathId: PATH_IDS.artistry,
    title: "Storytelling Through Song",
    description: "How to tell compelling stories in your lyrics",
    type: "video",
    mdxContent: null,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    sortOrder: 3,
    durationMinutes: 18,
    isFree: false,
    isPreview: false,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }),
  Lesson.make({
    id: LESSON_IDS.emotionalConnection,
    sectionId: SECTION_IDS.artistry,
    courseId: COURSE_ID,
    pathId: PATH_IDS.artistry,
    title: "Creating Emotional Connection",
    description: "Write lyrics that resonate with listeners",
    type: "video",
    mdxContent: null,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    sortOrder: 4,
    durationMinutes: 16,
    isFree: false,
    isPreview: false,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }),
  Lesson.make({
    id: LESSON_IDS.dynamicArrangement,
    sectionId: SECTION_IDS.artistry,
    courseId: COURSE_ID,
    pathId: PATH_IDS.artistry,
    title: "Dynamic Arrangement",
    description: "Create energy and flow in your song structure",
    type: "video",
    mdxContent: null,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    sortOrder: 5,
    durationMinutes: 18,
    isFree: false,
    isPreview: false,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }),

  // =============================================================================
  // Section 3: Business
  // =============================================================================
  Lesson.make({
    id: LESSON_IDS.demoRecording,
    sectionId: SECTION_IDS.business,
    courseId: COURSE_ID,
    pathId: PATH_IDS.business,
    title: "Recording Your Demos",
    description: "Capture your ideas with simple recording techniques",
    type: "video",
    mdxContent: null,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    sortOrder: 0,
    durationMinutes: 20,
    isFree: false,
    isPreview: false,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }),
  Lesson.make({
    id: LESSON_IDS.workingWithProducers,
    sectionId: SECTION_IDS.business,
    courseId: COURSE_ID,
    pathId: PATH_IDS.business,
    title: "Working with Producers",
    description: "How to collaborate effectively with music producers",
    type: "text",
    mdxContent: null,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    sortOrder: 1,
    durationMinutes: 15,
    isFree: false,
    isPreview: false,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }),
  Lesson.make({
    id: LESSON_IDS.releasingMusic,
    sectionId: SECTION_IDS.business,
    courseId: COURSE_ID,
    pathId: PATH_IDS.business,
    title: "Releasing Your Music",
    description: "Distribution, streaming platforms, and release strategies",
    type: "video",
    mdxContent: null,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    sortOrder: 2,
    durationMinutes: 22,
    isFree: false,
    isPreview: false,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }),
  Lesson.make({
    id: LESSON_IDS.buildingFanbase,
    sectionId: SECTION_IDS.business,
    courseId: COURSE_ID,
    pathId: PATH_IDS.business,
    title: "Building Your Fanbase",
    description: "Marketing strategies for independent songwriters",
    type: "text",
    mdxContent: null,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    sortOrder: 3,
    durationMinutes: 18,
    isFree: false,
    isPreview: false,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }),
];

// =============================================================================
// Mock Lesson Parts
// =============================================================================

export const SONGMAKING_LESSON_PARTS: ReadonlyArray<LessonPart> = [
  // Lesson: Setting Up Your Creative Space - has multiple parts
  LessonPart.make({
    id: PART_IDS.creativeSpace_intro,
    lessonId: LESSON_IDS.creativeSpace,
    title: "Introduction",
    type: "text",
    sortOrder: 0,
    durationMinutes: 3,
    mdxContent: `# Setting Up Your Creative Space

Your environment plays a huge role in your creative output. Let's set up a space that inspires you.

In this lesson, you'll learn:
- The essential equipment you need
- How to set up your digital workspace
- Creating the right mindset for creativity

Let's dive in!`,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    createdAt: now,
    updatedAt: now,
  }),
  LessonPart.make({
    id: PART_IDS.creativeSpace_essentials,
    lessonId: LESSON_IDS.creativeSpace,
    title: "The Essentials",
    type: "text",
    sortOrder: 1,
    durationMinutes: 5,
    mdxContent: `## The Essentials

1. **A comfortable seat** - You'll be here for hours, make it count
2. **Good lighting** - Natural light is best, but warm artificial light works too
3. **Minimal distractions** - Turn off notifications, close unnecessary tabs
4. **Your instrument of choice** - Guitar, keyboard, or even just your voice

## Digital Setup

You'll need some basic software:

- A **DAW** (Digital Audio Workstation) - We recommend starting with GarageBand (free) or Reaper (affordable)
- A simple **audio interface** if you want to record real instruments
- **Headphones** - Closed-back for recording, open-back for mixing

## Creating the Right Mindset

Before we dive into techniques, remember:

> "There are no wrong notes, only unresolved tensions." - Jazz wisdom

Give yourself permission to experiment. Your first songs don't need to be masterpieces.`,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    createdAt: now,
    updatedAt: now,
  }),
  LessonPart.make({
    id: PART_IDS.creativeSpace_quiz,
    lessonId: LESSON_IDS.creativeSpace,
    title: "Knowledge Check",
    type: "quiz",
    sortOrder: 2,
    durationMinutes: 2,
    mdxContent: null,
    videoContent: null,
    quizId: "40000000-0000-0000-0000-000000000001",
    quizPassingScore: 70,
    quizIsRequired: false,
    quizQuestions: JSON.stringify([
      {
        id: "q1",
        type: "multiple-choice",
        question: "What is the most important factor when setting up a creative space?",
        options: [
          { id: "q1-a", text: "Having the most expensive equipment", isCorrect: false },
          { id: "q1-b", text: "A comfortable environment that inspires creativity", isCorrect: true },
          { id: "q1-c", text: "A large room with high ceilings", isCorrect: false },
          { id: "q1-d", text: "Professional acoustic treatment", isCorrect: false },
        ],
        explanation: "While equipment and acoustics matter, the most important factor is creating a space where you feel comfortable and inspired to create.",
      },
      {
        id: "q2",
        type: "true-false",
        question: "You need a professional recording studio to write great songs.",
        options: [
          { id: "q2-a", text: "True", isCorrect: false },
          { id: "q2-b", text: "False", isCorrect: true },
        ],
        explanation: "Many hit songs have been written in bedrooms, on tour buses, and in coffee shops. Inspiration can strike anywhere!",
      },
      {
        id: "q3",
        type: "multiple-choice",
        question: "Which of the following is essential for your creative space?",
        options: [
          { id: "q3-a", text: "A comfortable seat", isCorrect: true },
          { id: "q3-b", text: "A grand piano", isCorrect: false },
          { id: "q3-c", text: "Soundproofing", isCorrect: false },
          { id: "q3-d", text: "A mixing console", isCorrect: false },
        ],
        explanation: "A comfortable seat is an essential basic item. You'll spend long hours writing, so comfort matters!",
      },
    ]),
    downloadFiles: null,
    createdAt: now,
    updatedAt: now,
  }),
  LessonPart.make({
    id: PART_IDS.creativeSpace_advanced,
    lessonId: LESSON_IDS.creativeSpace,
    title: "Advanced Setup Tips",
    type: "text",
    sortOrder: 3,
    durationMinutes: 5,
    mdxContent: `## Acoustic Treatment Basics

The room you work in affects how you hear music. Here are some tips:

### Common Problems

1. **Flutter echo** - Sound bouncing between parallel walls
2. **Standing waves** - Bass frequencies building up in corners
3. **Early reflections** - Sound bouncing off nearby surfaces

### Budget-Friendly Solutions

- **Bookshelves** - Filled bookshelves act as excellent diffusers
- **Thick curtains** - Help absorb high frequencies
- **Rugs and carpets** - Reduce floor reflections
- **DIY panels** - Rockwool in wooden frames covered with fabric

## Summary

Your creative space should:

- [ ] Be physically comfortable for long sessions
- [ ] Have decent acoustics (or at least treated problems)
- [ ] Minimize distractions
- [ ] Inspire you visually
- [ ] Be ready for immediate creativity

Now go set up your space, and we'll see you in the next lesson!`,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    createdAt: now,
    updatedAt: now,
  }),

  // Lesson: Mindset (single video part)
  LessonPart.make({
    id: PART_IDS.mindset_video,
    lessonId: LESSON_IDS.mindset,
    title: "The Songwriting Mindset",
    type: "video",
    sortOrder: 0,
    durationMinutes: 15,
    mdxContent: null,
    videoContent: makeVideoContent("dQw4w9WgXcQ", 900),
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    createdAt: now,
    updatedAt: now,
  }),

  // Lesson: Scales (single video part)
  LessonPart.make({
    id: PART_IDS.scales_video,
    lessonId: LESSON_IDS.scales,
    title: "Understanding Scales",
    type: "video",
    sortOrder: 0,
    durationMinutes: 14,
    mdxContent: null,
    videoContent: makeVideoContent("dQw4w9WgXcQ", 840),
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    createdAt: now,
    updatedAt: now,
  }),

  // Lesson: Chord Progressions (single text part)
  LessonPart.make({
    id: PART_IDS.chordProgressions_text,
    lessonId: LESSON_IDS.chordProgressions,
    title: "Building Chord Progressions",
    type: "text",
    sortOrder: 0,
    durationMinutes: 18,
    mdxContent: `# Building Chord Progressions

Chord progressions are the harmonic backbone of your song. Let's learn the most powerful ones.

## The Four-Chord Wonder

The I-V-vi-IV progression appears in hundreds of hit songs:

- **I** - Home base, feels resolved
- **V** - Creates tension, wants to resolve
- **vi** - The relative minor, adds emotion
- **IV** - The subdominant, creates movement

In the key of C, this is: **C - G - Am - F**

## Try These Progressions

| Name | Chords (in C) | Mood |
|------|---------------|------|
| Pop Classic | C - G - Am - F | Uplifting |
| Sad but Beautiful | Am - F - C - G | Melancholic |
| 50s Progression | C - Am - F - G | Nostalgic |

## Exercise

Pick one progression and loop it for 5 minutes. Hum melodies over it.
Don't judge, just explore.`,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    createdAt: now,
    updatedAt: now,
  }),
];

// =============================================================================
// Helper Functions
// =============================================================================

export function getSectionLessons(
  sectionId: SectionId,
  includeUnpublished = false
): ReadonlyArray<Lesson> {
  return SONGMAKING_LESSONS.filter(
    (l) => l.sectionId === sectionId && (includeUnpublished || l.isPublished)
  ).toSorted((a, b) => a.sortOrder - b.sortOrder);
}

export function getLessonById(lessonId: LessonId): Lesson | undefined {
  return SONGMAKING_LESSONS.find((l) => l.id === lessonId);
}

export function getSectionById(sectionId: SectionId): Section | undefined {
  return SONGMAKING_SECTIONS.find((s) => s.id === sectionId);
}

export function getLessonParts(lessonId: LessonId): ReadonlyArray<LessonPart> {
  return SONGMAKING_LESSON_PARTS.filter(
    (p) => p.lessonId === lessonId
  ).toSorted((a, b) => a.sortOrder - b.sortOrder);
}

export function getLessonPartById(
  partId: LessonPartId
): LessonPart | undefined {
  return SONGMAKING_LESSON_PARTS.find((p) => p.id === partId);
}

export function getNextLesson(currentLessonId: LessonId): Lesson | undefined {
  const currentLesson = getLessonById(currentLessonId);
  if (!currentLesson) return undefined;

  const sectionLessons = getSectionLessons(currentLesson.sectionId);
  const currentIndex = sectionLessons.findIndex(
    (l) => l.id === currentLessonId
  );
  if (currentIndex < sectionLessons.length - 1) {
    return sectionLessons[currentIndex + 1];
  }

  const currentSection = getSectionById(currentLesson.sectionId);
  if (!currentSection) return undefined;

  const nextSection = SONGMAKING_SECTIONS.find(
    (s) => s.sortOrder === currentSection.sortOrder + 1
  );
  if (!nextSection) return undefined;

  const nextSectionLessons = getSectionLessons(nextSection.id);
  return nextSectionLessons[0];
}

export function getPreviousLesson(
  currentLessonId: LessonId
): Lesson | undefined {
  const currentLesson = getLessonById(currentLessonId);
  if (!currentLesson) return undefined;

  const sectionLessons = getSectionLessons(currentLesson.sectionId);
  const currentIndex = sectionLessons.findIndex(
    (l) => l.id === currentLessonId
  );
  if (currentIndex > 0) {
    return sectionLessons[currentIndex - 1];
  }

  const currentSection = getSectionById(currentLesson.sectionId);
  if (!currentSection) return undefined;

  const prevSection = SONGMAKING_SECTIONS.find(
    (s) => s.sortOrder === currentSection.sortOrder - 1
  );
  if (!prevSection) return undefined;

  const prevSectionLessons = getSectionLessons(prevSection.id);
  return prevSectionLessons[prevSectionLessons.length - 1];
}

// =============================================================================
// Path Helper Functions
// =============================================================================

export function getPathById(pathId: PathId): Path | undefined {
  return SONGMAKING_PATHS.find((p) => p.id === pathId);
}

export function getPathLessons(pathId: PathId): ReadonlyArray<Lesson> {
  return SONGMAKING_LESSONS.filter((l) => l.pathId === pathId).toSorted(
    (a, b) => a.sortOrder - b.sortOrder
  );
}

export function getAllPaths(): ReadonlyArray<Path> {
  return SONGMAKING_PATHS.toSorted((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get progress stats for a specific path
 */
export function getPathProgress(
  pathId: PathId,
  progressMap: Map<LessonId, LessonProgress>
): { completed: number; total: number; percent: number } {
  const pathLessons = getPathLessons(pathId);
  const total = pathLessons.length;
  const completed = pathLessons.filter(
    (l) => progressMap.get(l.id)?.status === "completed"
  ).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percent };
}

/**
 * Get overall course progress
 */
export function getCourseProgress(progressMap: Map<LessonId, LessonProgress>): {
  completed: number;
  total: number;
  percent: number;
} {
  const total = SONGMAKING_LESSONS.length;
  const completed = SONGMAKING_LESSONS.filter(
    (l) => progressMap.get(l.id)?.status === "completed"
  ).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percent };
}

// =============================================================================
// Mock Progress Data
// =============================================================================

export const MOCK_PROGRESS: Map<LessonId, LessonProgress> = new Map();

// =============================================================================
// Course Order Types (Week-based lesson ordering)
// =============================================================================

export type WeekId = string & { readonly _brand: "WeekId" };
export type CourseOrderId = string & { readonly _brand: "CourseOrderId" };

export interface Week {
  id: WeekId;
  courseId: CourseId;
  title: string;
  description: string | null;
  sortOrder: number;
  lessonIds: LessonId[];
}

export interface CourseOrder {
  id: CourseOrderId;
  courseId: CourseId;
  name: string;
  isDefault: boolean;
  weeks: Week[];
}

// =============================================================================
// Mock Week IDs
// =============================================================================

const WEEK_IDS = {
  week1: "60000000-0000-0000-0000-000000000001" as WeekId,
  week2: "60000000-0000-0000-0000-000000000002" as WeekId,
  week3: "60000000-0000-0000-0000-000000000003" as WeekId,
  week4: "60000000-0000-0000-0000-000000000004" as WeekId,
  week5: "60000000-0000-0000-0000-000000000005" as WeekId,
  week6: "60000000-0000-0000-0000-000000000006" as WeekId,
  week7: "60000000-0000-0000-0000-000000000007" as WeekId,
  week8: "60000000-0000-0000-0000-000000000008" as WeekId,
} as const;

const COURSE_ORDER_ID = "70000000-0000-0000-0000-000000000001" as CourseOrderId;

// =============================================================================
// Mock Weeks (Ordered lesson groupings across sections)
// =============================================================================

export const SONGMAKING_WEEKS: ReadonlyArray<Week> = [
  {
    id: WEEK_IDS.week1,
    courseId: COURSE_ID,
    title: "Week 1: Getting Started",
    description: "Introduction to the course and setting up your foundation",
    sortOrder: 0,
    lessonIds: [
      LESSON_IDS.welcome, // Introduction
      LESSON_IDS.courseOverview, // Introduction
    ],
  },
  {
    id: WEEK_IDS.week2,
    courseId: COURSE_ID,
    title: "Week 2: Creative Foundation",
    description: "Setting up your creative space and mindset",
    sortOrder: 1,
    lessonIds: [
      LESSON_IDS.creativeSpace, // Artistry
      LESSON_IDS.mindset, // Artistry
    ],
  },
  {
    id: WEEK_IDS.week3,
    courseId: COURSE_ID,
    title: "Week 3: Music Theory Basics",
    description: "Core music theory for songwriters",
    sortOrder: 2,
    lessonIds: [
      LESSON_IDS.scales, // Songmaking
      LESSON_IDS.chordProgressions, // Songmaking
    ],
  },
  {
    id: WEEK_IDS.week4,
    courseId: COURSE_ID,
    title: "Week 4: Melody & Hooks",
    description: "Writing memorable melodies and hooks",
    sortOrder: 3,
    lessonIds: [
      LESSON_IDS.melodyWriting, // Songmaking
      LESSON_IDS.hookCreation, // Artistry
    ],
  },
  {
    id: WEEK_IDS.week5,
    courseId: COURSE_ID,
    title: "Week 5: Lyrics & Storytelling",
    description: "Crafting lyrics that connect",
    sortOrder: 4,
    lessonIds: [
      LESSON_IDS.lyricsBasics, // Songmaking
      LESSON_IDS.storytelling, // Artistry
      LESSON_IDS.rhymeSchemes, // Songmaking
    ],
  },
  {
    id: WEEK_IDS.week6,
    courseId: COURSE_ID,
    title: "Week 6: Song Structure",
    description: "Building complete songs with dynamics",
    sortOrder: 5,
    lessonIds: [
      LESSON_IDS.verseChorus, // Songmaking
      LESSON_IDS.emotionalConnection, // Artistry
      LESSON_IDS.dynamicArrangement, // Artistry
    ],
  },
  {
    id: WEEK_IDS.week7,
    courseId: COURSE_ID,
    title: "Week 7: Recording & Production",
    description: "From demo to professional recording",
    sortOrder: 6,
    lessonIds: [
      LESSON_IDS.demoRecording, // Business
      LESSON_IDS.workingWithProducers, // Business
    ],
  },
  {
    id: WEEK_IDS.week8,
    courseId: COURSE_ID,
    title: "Week 8: Release & Marketing",
    description: "Getting your music out to the world",
    sortOrder: 7,
    lessonIds: [
      LESSON_IDS.releasingMusic, // Business
      LESSON_IDS.buildingFanbase, // Business
    ],
  },
];

// =============================================================================
// Mock Course Order
// =============================================================================

export const SONGMAKING_COURSE_ORDER: CourseOrder = {
  id: COURSE_ORDER_ID,
  courseId: COURSE_ID,
  name: "Default Order",
  isDefault: true,
  weeks: [...SONGMAKING_WEEKS],
};

// =============================================================================
// Week Helper Functions
// =============================================================================

export function getWeeks(): ReadonlyArray<Week> {
  return SONGMAKING_WEEKS.toSorted((a, b) => a.sortOrder - b.sortOrder);
}

export function getWeekById(weekId: WeekId): Week | undefined {
  return SONGMAKING_WEEKS.find((w) => w.id === weekId);
}

export function getWeekLessons(weekId: WeekId): ReadonlyArray<Lesson> {
  const week = getWeekById(weekId);
  if (!week) return [];

  return week.lessonIds
    .map((id) => getLessonById(id))
    .filter((l): l is Lesson => l !== undefined);
}

export function getOrderedLessons(): ReadonlyArray<Lesson> {
  return getWeeks().flatMap((week) => getWeekLessons(week.id));
}

export function getNextLessonInOrder(
  currentLessonId: LessonId
): Lesson | undefined {
  const ordered = getOrderedLessons();
  const currentIndex = ordered.findIndex((l) => l.id === currentLessonId);
  return currentIndex >= 0 && currentIndex < ordered.length - 1
    ? ordered[currentIndex + 1]
    : undefined;
}

export function getPreviousLessonInOrder(
  currentLessonId: LessonId
): Lesson | undefined {
  const ordered = getOrderedLessons();
  const currentIndex = ordered.findIndex((l) => l.id === currentLessonId);
  return currentIndex > 0 ? ordered[currentIndex - 1] : undefined;
}

export function getWeekForLesson(lessonId: LessonId): Week | undefined {
  return SONGMAKING_WEEKS.find((w) => w.lessonIds.includes(lessonId));
}

export function getWeekProgress(
  weekId: WeekId,
  progressMap: Map<LessonId, LessonProgress>
): { completed: number; total: number; percent: number } {
  const lessons = getWeekLessons(weekId);
  const total = lessons.length;
  const completed = lessons.filter(
    (l) => progressMap.get(l.id)?.status === "completed"
  ).length;
  return {
    completed,
    total,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

// =============================================================================
// Re-export types for convenience
// =============================================================================

export type {
  Course,
  CourseId,
  Section,
  SectionId,
  Lesson,
  LessonId,
  LessonPart,
  LessonPartId,
  LessonProgress,
  VideoContent,
  Path,
  PathId,
};
