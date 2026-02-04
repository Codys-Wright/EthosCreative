/**
 * Example Course Data
 *
 * A demonstration course for admins to see all platform features in action.
 * Uses the same Effect Schema types as the main course.
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
// Example Course IDs (using EE prefix for easy identification)
// =============================================================================

const EXAMPLE_COURSE_ID = CourseId.make("EEEE0000-0000-0000-0000-000000000001");
const EXAMPLE_INSTRUCTOR_ID = InstructorId.make(
  "EEEE0000-0000-0000-0000-000000000002"
);

const EXAMPLE_SECTION_IDS = {
  introduction: SectionId.make("EE100000-0000-0000-0000-000000000000"),
  section1: SectionId.make("EE100000-0000-0000-0000-000000000001"),
  section2: SectionId.make("EE100000-0000-0000-0000-000000000002"),
  section3: SectionId.make("EE100000-0000-0000-0000-000000000003"),
} as const;

const EXAMPLE_LESSON_IDS = {
  // Introduction (2 lessons)
  welcome: LessonId.make("EE200000-0000-0000-0000-000000000001"),
  howToUse: LessonId.make("EE200000-0000-0000-0000-000000000002"),
  // Section 1: Getting Started (3 lessons)
  firstSteps: LessonId.make("EE200000-0000-0000-0000-000000000003"),
  understandingBasics: LessonId.make("EE200000-0000-0000-0000-000000000004"),
  practiceExercise: LessonId.make("EE200000-0000-0000-0000-000000000005"),
  // Section 2: Core Concepts (3 lessons)
  keyPrinciples: LessonId.make("EE200000-0000-0000-0000-000000000006"),
  applyingLearning: LessonId.make("EE200000-0000-0000-0000-000000000007"),
  coreConcepts: LessonId.make("EE200000-0000-0000-0000-000000000008"),
  // Section 3: Advanced Topics (2 lessons)
  goingDeeper: LessonId.make("EE200000-0000-0000-0000-000000000009"),
  finalProject: LessonId.make("EE200000-0000-0000-0000-000000000010"),
} as const;

const EXAMPLE_PART_IDS = {
  welcome_intro: LessonPartId.make("EE300000-0000-0000-0000-000000000001"),
  welcome_video: LessonPartId.make("EE300000-0000-0000-0000-000000000002"),
  howToUse_text: LessonPartId.make("EE300000-0000-0000-0000-000000000003"),
  firstSteps_video: LessonPartId.make("EE300000-0000-0000-0000-000000000004"),
  firstSteps_quiz: LessonPartId.make("EE300000-0000-0000-0000-000000000005"),
  understandingBasics_text: LessonPartId.make(
    "EE300000-0000-0000-0000-000000000006"
  ),
  keyPrinciples_video: LessonPartId.make(
    "EE300000-0000-0000-0000-000000000007"
  ),
  keyPrinciples_text: LessonPartId.make("EE300000-0000-0000-0000-000000000008"),
  coreConcepts_quiz: LessonPartId.make("EE300000-0000-0000-0000-000000000009"),
  finalProject_text: LessonPartId.make("EE300000-0000-0000-0000-000000000010"),
  finalProject_assignment: LessonPartId.make(
    "EE300000-0000-0000-0000-000000000011"
  ),
} as const;

// =============================================================================
// Mock Timestamps
// =============================================================================

const now = DateTime.unsafeNow();

// =============================================================================
// Example Course
// =============================================================================

export const EXAMPLE_COURSE = Course.make({
  id: EXAMPLE_COURSE_ID,
  instructorId: EXAMPLE_INSTRUCTOR_ID,
  title: "Example Course",
  slug: "example-course",
  subtitle: "A demonstration of all course platform features",
  description: `This example course showcases all the features available on the learning platform.

Watch simulated students interact, complete lessons, and engage in discussions. This demo is only visible to administrators.`,
  thumbnailUrl: "/images/example-course-cover.jpg",
  categoryId: null,
  tags: ["demo", "example", "showcase"],
  level: "all-levels",
  language: "en",

  totalDurationMinutes: 120,
  lessonCount: 10,
  sectionCount: 4,
  enrollmentCount: 5, // Demo students
  averageRating: 4.8,
  reviewCount: 12,
  status: "published",
  publishedAt: now,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
});

// =============================================================================
// Example Sections
// =============================================================================

export const EXAMPLE_SECTIONS: ReadonlyArray<Section> = [
  Section.make({
    id: EXAMPLE_SECTION_IDS.introduction,
    courseId: EXAMPLE_COURSE_ID,
    title: "Introduction",
    description: "Welcome to the course and learn how to navigate the platform",
    sortOrder: 0,
    lessonCount: 2,
    totalDurationMinutes: 15,
    createdAt: now,
    updatedAt: now,
  }),
  Section.make({
    id: EXAMPLE_SECTION_IDS.section1,
    courseId: EXAMPLE_COURSE_ID,
    title: "Section 1: Getting Started",
    description: "Your first steps into the subject matter",
    sortOrder: 1,
    lessonCount: 3,
    totalDurationMinutes: 35,
    createdAt: now,
    updatedAt: now,
  }),
  Section.make({
    id: EXAMPLE_SECTION_IDS.section2,
    courseId: EXAMPLE_COURSE_ID,
    title: "Section 2: Core Concepts",
    description: "Master the fundamental principles",
    sortOrder: 2,
    lessonCount: 3,
    totalDurationMinutes: 40,
    createdAt: now,
    updatedAt: now,
  }),
  Section.make({
    id: EXAMPLE_SECTION_IDS.section3,
    courseId: EXAMPLE_COURSE_ID,
    title: "Section 3: Advanced Topics",
    description: "Take your knowledge to the next level",
    sortOrder: 3,
    lessonCount: 2,
    totalDurationMinutes: 30,
    createdAt: now,
    updatedAt: now,
  }),
];

// =============================================================================
// Example Lessons
// =============================================================================

export const EXAMPLE_LESSONS: ReadonlyArray<Lesson> = [
  // =============================================================================
  // Introduction
  // =============================================================================
  Lesson.make({
    id: EXAMPLE_LESSON_IDS.welcome,
    sectionId: EXAMPLE_SECTION_IDS.introduction,
    courseId: EXAMPLE_COURSE_ID,
    pathId: null,
    title: "Welcome to the Course",
    description: "An introduction to what you'll learn and how to succeed",
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
    id: EXAMPLE_LESSON_IDS.howToUse,
    sectionId: EXAMPLE_SECTION_IDS.introduction,
    courseId: EXAMPLE_COURSE_ID,
    pathId: null,
    title: "How to Use This Platform",
    description: "Navigate the learning platform like a pro",
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
  // Section 1: Getting Started
  // =============================================================================
  Lesson.make({
    id: EXAMPLE_LESSON_IDS.firstSteps,
    sectionId: EXAMPLE_SECTION_IDS.section1,
    courseId: EXAMPLE_COURSE_ID,
    pathId: null,
    title: "Your First Steps",
    description: "Begin your learning journey with these foundational concepts",
    type: "video",
    mdxContent: null,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    sortOrder: 0,
    durationMinutes: 12,
    isFree: true,
    isPreview: true,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }),
  Lesson.make({
    id: EXAMPLE_LESSON_IDS.understandingBasics,
    sectionId: EXAMPLE_SECTION_IDS.section1,
    courseId: EXAMPLE_COURSE_ID,
    pathId: null,
    title: "Understanding the Basics",
    description: "Build a solid foundation with these essential concepts",
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
    id: EXAMPLE_LESSON_IDS.practiceExercise,
    sectionId: EXAMPLE_SECTION_IDS.section1,
    courseId: EXAMPLE_COURSE_ID,
    pathId: null,
    title: "Practice Exercise",
    description: "Put your new knowledge into practice",
    type: "assignment",
    mdxContent: null,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    sortOrder: 2,
    durationMinutes: 8,
    isFree: false,
    isPreview: false,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }),

  // =============================================================================
  // Section 2: Core Concepts
  // =============================================================================
  Lesson.make({
    id: EXAMPLE_LESSON_IDS.keyPrinciples,
    sectionId: EXAMPLE_SECTION_IDS.section2,
    courseId: EXAMPLE_COURSE_ID,
    pathId: null,
    title: "Key Principles",
    description: "The core principles that drive everything",
    type: "video",
    mdxContent: null,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    sortOrder: 0,
    durationMinutes: 18,
    isFree: false,
    isPreview: false,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }),
  Lesson.make({
    id: EXAMPLE_LESSON_IDS.applyingLearning,
    sectionId: EXAMPLE_SECTION_IDS.section2,
    courseId: EXAMPLE_COURSE_ID,
    pathId: null,
    title: "Applying What You've Learned",
    description: "Real-world applications of the concepts",
    type: "text",
    mdxContent: null,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    sortOrder: 1,
    durationMinutes: 12,
    isFree: false,
    isPreview: false,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }),
  Lesson.make({
    id: EXAMPLE_LESSON_IDS.coreConcepts,
    sectionId: EXAMPLE_SECTION_IDS.section2,
    courseId: EXAMPLE_COURSE_ID,
    pathId: null,
    title: "Quiz: Core Concepts",
    description: "Test your understanding of the core concepts",
    type: "quiz",
    mdxContent: null,
    videoContent: null,
    quizId: "EE400000-0000-0000-0000-000000000001",
    quizPassingScore: 70,
    quizIsRequired: true,
    downloadFiles: null,
    sortOrder: 2,
    durationMinutes: 10,
    isFree: false,
    isPreview: false,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }),

  // =============================================================================
  // Section 3: Advanced Topics
  // =============================================================================
  Lesson.make({
    id: EXAMPLE_LESSON_IDS.goingDeeper,
    sectionId: EXAMPLE_SECTION_IDS.section3,
    courseId: EXAMPLE_COURSE_ID,
    pathId: null,
    title: "Going Deeper",
    description: "Advanced techniques and strategies",
    type: "video",
    mdxContent: null,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    sortOrder: 0,
    durationMinutes: 15,
    isFree: false,
    isPreview: false,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }),
  Lesson.make({
    id: EXAMPLE_LESSON_IDS.finalProject,
    sectionId: EXAMPLE_SECTION_IDS.section3,
    courseId: EXAMPLE_COURSE_ID,
    pathId: null,
    title: "Final Project",
    description: "Demonstrate your mastery with a comprehensive project",
    type: "assignment",
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
];

// =============================================================================
// Example Lesson Parts
// =============================================================================

export const EXAMPLE_LESSON_PARTS: ReadonlyArray<LessonPart> = [
  // Welcome lesson parts
  LessonPart.make({
    id: EXAMPLE_PART_IDS.welcome_intro,
    lessonId: EXAMPLE_LESSON_IDS.welcome,
    title: "Course Introduction",
    type: "text",
    sortOrder: 0,
    durationMinutes: 2,
    mdxContent: `# Welcome to the Example Course!

This demonstration course shows you all the features of our learning platform.

## What You'll Experience

- **Video Lessons** - Watch engaging content
- **Text Lessons** - Read detailed explanations
- **Quizzes** - Test your knowledge
- **Assignments** - Practice what you learn
- **Discussion** - Chat with other students
- **Progress Tracking** - See how far you've come

Let's get started!`,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    createdAt: now,
    updatedAt: now,
  }),
  LessonPart.make({
    id: EXAMPLE_PART_IDS.welcome_video,
    lessonId: EXAMPLE_LESSON_IDS.welcome,
    title: "Welcome Video",
    type: "video",
    sortOrder: 1,
    durationMinutes: 3,
    mdxContent: null,
    videoContent: makeVideoContent("dQw4w9WgXcQ", 180),
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    createdAt: now,
    updatedAt: now,
  }),

  // How to Use lesson part
  LessonPart.make({
    id: EXAMPLE_PART_IDS.howToUse_text,
    lessonId: EXAMPLE_LESSON_IDS.howToUse,
    title: "Platform Guide",
    type: "text",
    sortOrder: 0,
    durationMinutes: 10,
    mdxContent: `# How to Use This Platform

## Navigation

The sidebar shows all course sections and lessons. Click any lesson to jump directly to it.

## Progress Tracking

Your progress is automatically saved as you complete lessons. Look for the green checkmarks!

## Discussion

Use the Messages feature to:
- Ask questions in the General channel
- Get announcements from your instructor
- Message other students directly

## Tips for Success

1. **Watch videos at your own pace** - Pause and rewind as needed
2. **Take notes** - Writing helps retention
3. **Complete quizzes** - They reinforce learning
4. **Engage with others** - Discussion deepens understanding

Happy learning!`,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    createdAt: now,
    updatedAt: now,
  }),

  // First Steps lesson parts
  LessonPart.make({
    id: EXAMPLE_PART_IDS.firstSteps_video,
    lessonId: EXAMPLE_LESSON_IDS.firstSteps,
    title: "Getting Started Video",
    type: "video",
    sortOrder: 0,
    durationMinutes: 10,
    mdxContent: null,
    videoContent: makeVideoContent("dQw4w9WgXcQ", 600),
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    createdAt: now,
    updatedAt: now,
  }),
  LessonPart.make({
    id: EXAMPLE_PART_IDS.firstSteps_quiz,
    lessonId: EXAMPLE_LESSON_IDS.firstSteps,
    title: "Quick Check",
    type: "quiz",
    sortOrder: 1,
    durationMinutes: 2,
    mdxContent: null,
    videoContent: null,
    quizId: "EE400000-0000-0000-0000-000000000002",
    quizPassingScore: 80,
    quizIsRequired: false,
    downloadFiles: null,
    createdAt: now,
    updatedAt: now,
  }),

  // Understanding Basics lesson part
  LessonPart.make({
    id: EXAMPLE_PART_IDS.understandingBasics_text,
    lessonId: EXAMPLE_LESSON_IDS.understandingBasics,
    title: "The Fundamentals",
    type: "text",
    sortOrder: 0,
    durationMinutes: 15,
    mdxContent: `# Understanding the Basics

## Core Concepts

Every subject has foundational concepts that everything else builds upon. Here are the key ideas:

### Concept 1: Foundation

The foundation is crucial. Without it, advanced topics won't make sense.

### Concept 2: Building Blocks

Once you have the foundation, you add building blocks one at a time.

### Concept 3: Connections

The real magic happens when you see how concepts connect to each other.

## Practice

Try to identify these three elements in any subject you're learning. You'll find they're universal!`,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    createdAt: now,
    updatedAt: now,
  }),

  // Key Principles lesson parts
  LessonPart.make({
    id: EXAMPLE_PART_IDS.keyPrinciples_video,
    lessonId: EXAMPLE_LESSON_IDS.keyPrinciples,
    title: "Principles Overview",
    type: "video",
    sortOrder: 0,
    durationMinutes: 12,
    mdxContent: null,
    videoContent: makeVideoContent("dQw4w9WgXcQ", 720),
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    createdAt: now,
    updatedAt: now,
  }),
  LessonPart.make({
    id: EXAMPLE_PART_IDS.keyPrinciples_text,
    lessonId: EXAMPLE_LESSON_IDS.keyPrinciples,
    title: "Principles Deep Dive",
    type: "text",
    sortOrder: 1,
    durationMinutes: 6,
    mdxContent: `# Key Principles - Deep Dive

## Principle 1: Start Simple

Always begin with the simplest version of what you're trying to learn or build.

## Principle 2: Iterate

Make small improvements over time. Don't try to be perfect from the start.

## Principle 3: Reflect

Regularly look back at what you've learned and how far you've come.

## Principle 4: Share

Teaching others is one of the best ways to solidify your own understanding.`,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    createdAt: now,
    updatedAt: now,
  }),

  // Core Concepts Quiz lesson part
  LessonPart.make({
    id: EXAMPLE_PART_IDS.coreConcepts_quiz,
    lessonId: EXAMPLE_LESSON_IDS.coreConcepts,
    title: "Core Concepts Assessment",
    type: "quiz",
    sortOrder: 0,
    durationMinutes: 10,
    mdxContent: null,
    videoContent: null,
    quizId: "EE400000-0000-0000-0000-000000000001",
    quizPassingScore: 70,
    quizIsRequired: true,
    downloadFiles: null,
    createdAt: now,
    updatedAt: now,
  }),

  // Final Project lesson parts
  LessonPart.make({
    id: EXAMPLE_PART_IDS.finalProject_text,
    lessonId: EXAMPLE_LESSON_IDS.finalProject,
    title: "Project Guidelines",
    type: "text",
    sortOrder: 0,
    durationMinutes: 5,
    mdxContent: `# Final Project Guidelines

## Overview

Your final project should demonstrate mastery of all the concepts covered in this course.

## Requirements

1. Apply at least 3 key principles
2. Show your work process
3. Include a reflection on what you learned

## Submission

Upload your completed project using the submission form below.

Good luck!`,
    videoContent: null,
    quizId: null,
    quizPassingScore: null,
    quizIsRequired: false,
    downloadFiles: null,
    createdAt: now,
    updatedAt: now,
  }),
  LessonPart.make({
    id: EXAMPLE_PART_IDS.finalProject_assignment,
    lessonId: EXAMPLE_LESSON_IDS.finalProject,
    title: "Submit Your Project",
    type: "assignment",
    sortOrder: 1,
    durationMinutes: 10,
    mdxContent: `# Project Submission

Use this space to submit your final project. Include:

- A brief description of your project
- How you applied the course concepts
- What you learned along the way

Your instructor will review your submission and provide feedback.`,
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

export function getExampleSectionLessons(
  sectionId: SectionId
): ReadonlyArray<Lesson> {
  return EXAMPLE_LESSONS.filter((l) => l.sectionId === sectionId).toSorted(
    (a, b) => a.sortOrder - b.sortOrder
  );
}

export function getExampleLessonById(lessonId: LessonId): Lesson | undefined {
  return EXAMPLE_LESSONS.find((l) => l.id === lessonId);
}

export function getExampleSectionById(
  sectionId: SectionId
): Section | undefined {
  return EXAMPLE_SECTIONS.find((s) => s.id === sectionId);
}

export function getExampleLessonParts(
  lessonId: LessonId
): ReadonlyArray<LessonPart> {
  return EXAMPLE_LESSON_PARTS.filter((p) => p.lessonId === lessonId).toSorted(
    (a, b) => a.sortOrder - b.sortOrder
  );
}

export function getExampleNextLesson(
  currentLessonId: LessonId
): Lesson | undefined {
  const currentLesson = getExampleLessonById(currentLessonId);
  if (!currentLesson) return undefined;

  const sectionLessons = getExampleSectionLessons(currentLesson.sectionId);
  const currentIndex = sectionLessons.findIndex(
    (l) => l.id === currentLessonId
  );
  if (currentIndex < sectionLessons.length - 1) {
    return sectionLessons[currentIndex + 1];
  }

  const currentSection = getExampleSectionById(currentLesson.sectionId);
  if (!currentSection) return undefined;

  const nextSection = EXAMPLE_SECTIONS.find(
    (s) => s.sortOrder === currentSection.sortOrder + 1
  );
  if (!nextSection) return undefined;

  const nextSectionLessons = getExampleSectionLessons(nextSection.id);
  return nextSectionLessons[0];
}

export function getExamplePreviousLesson(
  currentLessonId: LessonId
): Lesson | undefined {
  const currentLesson = getExampleLessonById(currentLessonId);
  if (!currentLesson) return undefined;

  const sectionLessons = getExampleSectionLessons(currentLesson.sectionId);
  const currentIndex = sectionLessons.findIndex(
    (l) => l.id === currentLessonId
  );
  if (currentIndex > 0) {
    return sectionLessons[currentIndex - 1];
  }

  const currentSection = getExampleSectionById(currentLesson.sectionId);
  if (!currentSection) return undefined;

  const prevSection = EXAMPLE_SECTIONS.find(
    (s) => s.sortOrder === currentSection.sortOrder - 1
  );
  if (!prevSection) return undefined;

  const prevSectionLessons = getExampleSectionLessons(prevSection.id);
  return prevSectionLessons[prevSectionLessons.length - 1];
}

// =============================================================================
// Re-export types and IDs for convenience
// =============================================================================

export { EXAMPLE_COURSE_ID, EXAMPLE_SECTION_IDS, EXAMPLE_LESSON_IDS };
export type { Course, Section, Lesson, LessonPart };
