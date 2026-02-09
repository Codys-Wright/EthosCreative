/**
 * Course Dashboard
 *
 * A modern, visually stunning dashboard for tracking course progress.
 * Features a hero section with progress ring, section pillars with visual progress,
 * and messaging integration for announcements and chat.
 */

import * as React from "react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import {
  Badge,
  Button,
  Card,
  Collapsible,
  ScrollArea,
  Sidebar,
  SidebarProvider,
} from "@shadcn";
import {
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  PlayCircle,
  BookOpen,
  Trophy,
  Target,
  Zap,
  Sparkles,
  Megaphone,
  MessageSquare,
  Mail,
  ArrowRight,
  Users,
  FileText,
  Video,
  HelpCircle,
  Download,
} from "lucide-react";
import { CourseSidebar } from "../../components/course-sidebar.js";
import { useCourse } from "../../features/course/client/course-context.js";
import {
  progressAtom,
  expandedSectionsAtom,
  ExpandedSectionsUpdate,
} from "../../features/course/client/course-atoms.js";
import { checkEnrollmentAtom } from "@course/features/enrollment/client";
import type { CourseId } from "@course";
import { cn } from "@shadcn/lib/utils";
import {
  fakeAnnouncementsAtom,
  fakeChatMessagesAtom,
  fakeDirectMessagesAtom,
  fakeMessagingInitializedAtom,
  generateInitialAnnouncements,
  generateInitialChatMessages,
  generateInitialDirectMessages,
  generateFakeAnnouncement,
  generateFakeChatMessage,
  generateFakeDirectMessage,
  getNextEventInterval,
  getNextEventType,
} from "../../features/messaging/client/fake-messaging-atoms.js";

export const Route = createFileRoute("/$courseSlug/dashboard")({
  component: DashboardPageWrapper,
});

// =============================================================================
// Section Colors - Define colors for each section
// =============================================================================

const SECTION_COLORS: Record<
  string,
  { bg: string; text: string; gradient: string }
> = {
  // Introduction - Sky blue
  "10000000-0000-0000-0000-000000000000": {
    bg: "bg-sky-500",
    text: "text-sky-500",
    gradient: "from-sky-500 to-sky-600",
  },
  // Songmaking - Violet
  "10000000-0000-0000-0000-000000000001": {
    bg: "bg-violet-500",
    text: "text-violet-500",
    gradient: "from-violet-500 to-violet-600",
  },
  // Artistry - Amber
  "10000000-0000-0000-0000-000000000002": {
    bg: "bg-amber-500",
    text: "text-amber-500",
    gradient: "from-amber-500 to-amber-600",
  },
  // Business - Emerald
  "10000000-0000-0000-0000-000000000003": {
    bg: "bg-emerald-500",
    text: "text-emerald-500",
    gradient: "from-emerald-500 to-emerald-600",
  },
};

const DEFAULT_SECTION_COLOR = {
  bg: "bg-primary",
  text: "text-primary",
  gradient: "from-primary to-primary/80",
};

function getSectionColor(sectionId: string) {
  return SECTION_COLORS[sectionId] || DEFAULT_SECTION_COLOR;
}

// =============================================================================
// Progress Ring Component
// =============================================================================

function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  className,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
    >
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient
            id="progressGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.6)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{Math.round(progress)}%</span>
        <span className="text-xs text-muted-foreground">Complete</span>
      </div>
    </div>
  );
}

// =============================================================================
// Section Progress Pillars - Visual representation of 4 sections
// =============================================================================

function SectionProgressPillars() {
  const { sections, getSectionLessons, routes } = useCourse();
  const progressMap = useAtomValue(progressAtom);

  return (
    <div className="flex items-end gap-2 h-28">
      {sections.map((section) => {
        const lessons = getSectionLessons(section.id);
        const total = lessons.length;
        const completed = lessons.filter(
          (l) => progressMap.get(l.id)?.status === "completed"
        ).length;
        const percentage =
          total > 0 ? Math.round((completed / total) * 100) : 0;
        const color = getSectionColor(section.id);
        const isComplete = percentage === 100;

        // Find next lesson in this section
        const nextLesson = lessons.find(
          (l) => progressMap.get(l.id)?.status !== "completed"
        );

        return (
          <Link
            key={section.id}
            to={nextLesson ? routes.lesson(nextLesson.id) : routes.home}
            className="flex-1 group relative"
            title={`${section.title} - ${completed}/${total} (${percentage}%)`}
          >
            {/* Pillar container */}
            <div className="relative w-full h-24 bg-muted/50 rounded-lg overflow-hidden">
              {/* Fill */}
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out rounded-b-lg bg-gradient-to-t",
                  color.gradient,
                  "group-hover:opacity-80"
                )}
                style={{ height: `${percentage}%` }}
              />
              {/* Percentage label */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={cn(
                    "text-xs font-bold",
                    percentage > 50 ? "text-white" : "text-muted-foreground"
                  )}
                >
                  {percentage}%
                </span>
              </div>
              {/* Complete checkmark */}
              {isComplete && (
                <div className="absolute top-1 right-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>
            {/* Small color indicator dot below */}
            <div className="flex justify-center mt-1.5">
              <div
                className={cn("w-2 h-2 rounded-full", color.bg)}
                title={section.title}
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// =============================================================================
// Hero Section with Progress
// =============================================================================

function HeroSection() {
  const { course, lessons, sections, routes, isExample } = useCourse();
  const progressMap = useAtomValue(progressAtom);

  const total = lessons.length;
  const completed = lessons.filter(
    (l) => progressMap.get(l.id)?.status === "completed"
  ).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const remaining = total - completed;

  // Find next lesson
  const nextLesson = lessons.find(
    (l) => progressMap.get(l.id)?.status !== "completed"
  );
  const nextSection = nextLesson
    ? sections.find((s) => s.id === nextLesson.sectionId)
    : null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border",
        isExample
          ? "bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-background"
          : "bg-gradient-to-br from-primary/5 via-primary/3 to-background"
      )}
    >
      {/* Decorative elements */}
      <div
        className={cn(
          "absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20",
          isExample ? "bg-amber-500" : "bg-primary"
        )}
      />

      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          {/* Left: Progress Ring */}
          <div className="flex-shrink-0">
            <ProgressRing progress={percentage} size={140} strokeWidth={10} />
          </div>

          {/* Middle: Stats & Info */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {percentage === 100 ? (
                <span className="flex items-center justify-center lg:justify-start gap-2">
                  <Trophy className="w-7 h-7 text-amber-500" />
                  Course Complete!
                </span>
              ) : percentage > 0 ? (
                "Keep Going!"
              ) : (
                "Start Your Journey"
              )}
            </h1>
            <p className="text-muted-foreground mb-6 max-w-md">
              {percentage === 100
                ? "Congratulations! You've mastered all the lessons in this course."
                : percentage > 0
                ? `You're making great progress. ${remaining} lesson${
                    remaining !== 1 ? "s" : ""
                  } remaining.`
                : "Begin your learning adventure and track your progress here."}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-1.5 text-muted-foreground mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide">
                    Completed
                  </span>
                </div>
                <p className="text-2xl font-bold">{completed}</p>
              </div>
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-1.5 text-muted-foreground mb-1">
                  <Target className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide">
                    Remaining
                  </span>
                </div>
                <p className="text-2xl font-bold">{remaining}</p>
              </div>
            </div>

            {/* CTA */}
            {nextLesson && (
              <Link to={routes.lesson(nextLesson.id)}>
                <Button
                  size="lg"
                  className={cn(
                    "gap-2 shadow-lg",
                    isExample
                      ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/25"
                      : "shadow-primary/25"
                  )}
                >
                  <PlayCircle className="w-5 h-5" />
                  {completed > 0 ? "Continue Learning" : "Start First Lesson"}
                </Button>
              </Link>
            )}
          </div>

          {/* Right: Section Pillars */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-3 text-center lg:text-left">
              Section Progress
            </div>
            <SectionProgressPillars />
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Section Progress Card
// =============================================================================

function SectionProgressCard({
  section,
  sectionIndex,
}: {
  section: { id: string; title: string; description?: string | null };
  sectionIndex: number;
}) {
  const { getSectionLessons, routes } = useCourse();
  const progressMap = useAtomValue(progressAtom);
  const lessons = getSectionLessons(section.id);

  const total = lessons.length;
  const completed = lessons.filter(
    (l) => progressMap.get(l.id)?.status === "completed"
  ).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = percentage === 100;
  const color = getSectionColor(section.id);

  // Find next incomplete lesson in this section
  const nextLesson = lessons.find(
    (l) => progressMap.get(l.id)?.status !== "completed"
  );

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-md",
        isComplete && "border-emerald-500/30 bg-emerald-500/5"
      )}
    >
      {/* Progress bar at top */}
      <div className="h-1 bg-muted">
        <div
          className={cn(
            "h-full transition-all duration-500 bg-gradient-to-r",
            isComplete ? "from-emerald-500 to-emerald-400" : color.gradient
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="p-3">
        <div className="flex items-center gap-3">
          {/* Section Number */}
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors",
              isComplete
                ? "bg-emerald-500 text-white"
                : `${color.bg}/10 ${color.text}`
            )}
          >
            {isComplete ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              sectionIndex + 1
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-medium text-sm truncate">{section.title}</h3>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {completed}/{total}
              </span>
            </div>
          </div>

          {/* Action */}
          {nextLesson ? (
            <Link to={routes.lesson(nextLesson.id)}>
              <Button
                variant="ghost"
                size="sm"
                className={cn("gap-1 h-7 px-2", color.text)}
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span className="text-xs">Continue</span>
              </Button>
            </Link>
          ) : isComplete ? (
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

// =============================================================================
// Quick Stats Cards
// =============================================================================

function QuickStatsCard({
  icon: Icon,
  label,
  value,
  color = "primary",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color?: "primary" | "emerald" | "amber" | "blue";
}) {
  const colors = {
    primary: "bg-primary/10 text-primary",
    emerald: "bg-emerald-500/10 text-emerald-600",
    amber: "bg-amber-500/10 text-amber-600",
    blue: "bg-blue-500/10 text-blue-600",
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            colors[color]
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
}

// =============================================================================
// Lesson Type Icon Helper
// =============================================================================

function LessonTypeIcon({
  type,
  className,
}: {
  type: string;
  className?: string;
}) {
  switch (type) {
    case "video":
      return <Video className={className} />;
    case "text":
      return <FileText className={className} />;
    case "quiz":
      return <HelpCircle className={className} />;
    case "download":
    case "assignment":
      return <Download className={className} />;
    default:
      return <FileText className={className} />;
  }
}

// =============================================================================
// Section Content Browser - Full expandable course content
// =============================================================================

function SectionContentBrowser() {
  const { sections, getSectionLessons, routes } = useCourse();
  const progressMap = useAtomValue(progressAtom);
  const expandedSections = useAtomValue(expandedSectionsAtom);
  const setExpandedSections = useAtomSet(expandedSectionsAtom);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Course Content
        </h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={() =>
              setExpandedSections(ExpandedSectionsUpdate.ExpandAll())
            }
          >
            Expand All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={() =>
              setExpandedSections(ExpandedSectionsUpdate.CollapseAll())
            }
          >
            Collapse All
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {sections.map((section, index) => {
          const lessons = getSectionLessons(section.id);
          const isExpanded = expandedSections.has(section.id);
          const completedCount = lessons.filter(
            (l) => progressMap.get(l.id)?.status === "completed"
          ).length;
          const color = getSectionColor(section.id);
          const isComplete = completedCount === lessons.length;

          return (
            <Card key={section.id} className="overflow-hidden">
              <Collapsible
                open={isExpanded}
                onOpenChange={() =>
                  setExpandedSections(
                    ExpandedSectionsUpdate.Toggle({ sectionId: section.id })
                  )
                }
              >
                <Collapsible.Trigger asChild>
                  <button className="w-full text-left">
                    <div className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                      {/* Section color indicator */}
                      <div
                        className={cn(
                          "w-1 h-12 rounded-full flex-shrink-0",
                          color.bg
                        )}
                      />

                      {/* Section info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs text-muted-foreground">
                            Section {index + 1}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-4"
                          >
                            {lessons.length} lessons
                          </Badge>
                        </div>
                        <h3 className="font-semibold">{section.title}</h3>
                        {section.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                            {section.description}
                          </p>
                        )}
                      </div>

                      {/* Progress */}
                      <div className="text-right flex-shrink-0">
                        <div
                          className={cn(
                            "text-sm font-medium",
                            isComplete && "text-emerald-600"
                          )}
                        >
                          {completedCount}/{lessons.length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          complete
                        </div>
                      </div>

                      <ChevronDown
                        className={cn(
                          "h-5 w-5 transition-transform text-muted-foreground flex-shrink-0",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </div>
                  </button>
                </Collapsible.Trigger>

                <Collapsible.Content>
                  <div className="border-t">
                    {lessons.map((lesson, lessonIndex) => {
                      const progress = progressMap.get(lesson.id);
                      const isLessonComplete = progress?.status === "completed";

                      return (
                        <Link
                          key={lesson.id}
                          to={routes.lesson(lesson.id)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b last:border-b-0"
                        >
                          {/* Lesson number or check */}
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0",
                              isLessonComplete
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {isLessonComplete ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              lessonIndex + 1
                            )}
                          </div>

                          {/* Lesson info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">
                              {lesson.title}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="capitalize">{lesson.type}</span>
                              {lesson.isFree && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] h-4"
                                >
                                  Free
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Type icon */}
                          <LessonTypeIcon
                            type={lesson.type}
                            className="w-4 h-4 text-muted-foreground flex-shrink-0"
                          />

                          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </Collapsible.Content>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// Time Formatting Helper
// =============================================================================

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
}

// =============================================================================
// Announcements Card
// =============================================================================

function AnnouncementsCard() {
  const { routes, isExample } = useCourse();
  const fakeAnnouncements = useAtomValue(fakeAnnouncementsAtom);

  // Use fake data for example course
  const announcements = isExample
    ? fakeAnnouncements
        .slice(-3)
        .reverse()
        .map((a) => ({
          id: a.id,
          content: a.content,
          author: a.author.name,
          time: formatRelativeTime(a.timestamp),
        }))
    : [];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Megaphone className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="font-semibold">Announcements</h3>
        </div>
        <Link to="/messages" search={{ room: "announcements" }}>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs text-muted-foreground"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-6">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No announcements yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Check back for instructor updates
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="border-l-2 border-amber-500/50 pl-3">
              <p className="text-sm line-clamp-2">{a.content}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {a.author} · {a.time}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// =============================================================================
// Course Chat Card
// =============================================================================

function CourseChatCard() {
  const { isExample } = useCourse();
  const fakeChatMessages = useAtomValue(fakeChatMessagesAtom);

  // Use fake data for example course
  const messages = isExample
    ? fakeChatMessages
        .slice(-3)
        .reverse()
        .map((m) => ({
          id: m.id,
          content: m.content,
          author: m.author.name,
          avatarUrl: m.author.avatarUrl,
          time: formatRelativeTime(m.timestamp),
        }))
    : [];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="font-semibold">Course Chat</h3>
        </div>
        <Link to="/messages" search={{ room: "general" }}>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs text-muted-foreground"
          >
            Open Chat
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-6">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
            <Users className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Join the conversation</p>
          <p className="text-xs text-muted-foreground mt-1">
            Connect with other students
          </p>
          <Link to="/messages" search={{ room: "general" }}>
            <Button variant="outline" size="sm" className="mt-3 gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Open Chat
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="flex gap-2">
              <img
                src={m.avatarUrl}
                alt={m.author}
                className="w-6 h-6 rounded-full bg-muted flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm line-clamp-1">{m.content}</p>
                <p className="text-xs text-muted-foreground">
                  {m.author} · {m.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// =============================================================================
// Direct Messages Card
// =============================================================================

function DirectMessagesCard() {
  const { isExample } = useCourse();
  const fakeDirectMessages = useAtomValue(fakeDirectMessagesAtom);

  // Use fake data for example course
  const directMessages = isExample
    ? fakeDirectMessages
        .slice(-3)
        .reverse()
        .map((dm) => ({
          id: dm.id,
          from: dm.from.name,
          avatarUrl: dm.from.avatarUrl,
          preview: dm.preview,
          unread: dm.unread,
          time: formatRelativeTime(dm.timestamp),
        }))
    : [];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <Mail className="w-4 h-4 text-violet-600" />
          </div>
          <h3 className="font-semibold">Direct Messages</h3>
        </div>
        <Link to="/messages" search={{ room: "direct" }}>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs text-muted-foreground"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {directMessages.length === 0 ? (
        <div className="text-center py-6">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
            <Mail className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No messages</p>
          <p className="text-xs text-muted-foreground mt-1">
            Direct messages will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {directMessages.map((dm) => (
            <Link
              key={dm.id}
              to="/messages"
              search={{ room: "direct", user: dm.from }}
              className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <img
                src={dm.avatarUrl}
                alt={dm.from}
                className="w-8 h-8 rounded-full bg-muted flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      dm.unread && "text-foreground"
                    )}
                  >
                    {dm.from}
                  </span>
                  {dm.unread && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {dm.preview}
                </p>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {dm.time}
              </span>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}

// =============================================================================
// Main Component
// =============================================================================

function DashboardPageWrapper() {
  const { course, routes, isExample } = useCourse();
  const checkEnrollment = useAtomSet(checkEnrollmentAtom);
  const [isEnrolled, setIsEnrolled] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (isExample) {
      setIsEnrolled(true);
      return;
    }
    checkEnrollment({ courseId: course.id as CourseId })
      .then((result) => {
        if (result._tag === "Right") {
          setIsEnrolled(result.right);
        } else {
          setIsEnrolled(false);
        }
      })
      .catch(() => setIsEnrolled(false));
  }, [course.id, isExample, checkEnrollment]);

  // Redirect non-enrolled users to course overview
  if (isEnrolled === false) {
    return <Navigate to={routes.home} />;
  }

  // Loading state
  if (isEnrolled === null) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <CourseSidebar />
      <Sidebar.Inset>
        <DashboardPage />
      </Sidebar.Inset>
    </SidebarProvider>
  );
}

function DashboardPage() {
  const { sections, lessons, isExample } = useCourse();
  const progressMap = useAtomValue(progressAtom);

  // Fake messaging state for example course
  const isInitialized = useAtomValue(fakeMessagingInitializedAtom);
  const setInitialized = useAtomSet(fakeMessagingInitializedAtom);
  const setAnnouncements = useAtomSet(fakeAnnouncementsAtom);
  const setChatMessages = useAtomSet(fakeChatMessagesAtom);
  const setDirectMessages = useAtomSet(fakeDirectMessagesAtom);

  const total = lessons.length;
  const completed = lessons.filter(
    (l) => progressMap.get(l.id)?.status === "completed"
  ).length;

  // Initialize fake messages client-side only (after hydration)
  React.useEffect(() => {
    if (!isExample || isInitialized) return;

    // Populate initial data
    setAnnouncements(generateInitialAnnouncements());
    setChatMessages(generateInitialChatMessages());
    setDirectMessages(generateInitialDirectMessages());
    setInitialized(true);
  }, [
    isExample,
    isInitialized,
    setAnnouncements,
    setChatMessages,
    setDirectMessages,
    setInitialized,
  ]);

  // Generate fake messages periodically for example course
  React.useEffect(() => {
    if (!isExample || !isInitialized) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNextEvent = () => {
      const interval = getNextEventInterval();
      timeoutId = setTimeout(() => {
        const eventType = getNextEventType();

        if (eventType === "announcement") {
          const newAnnouncement = generateFakeAnnouncement();
          setAnnouncements((prev) => [...prev.slice(-9), newAnnouncement]);
        } else if (eventType === "chat") {
          const newMessage = generateFakeChatMessage();
          setChatMessages((prev) => [...prev.slice(-19), newMessage]);
        } else {
          const newDM = generateFakeDirectMessage();
          setDirectMessages((prev) => [...prev.slice(-9), newDM]);
        }

        scheduleNextEvent();
      }, interval);
    };

    scheduleNextEvent();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [
    isExample,
    isInitialized,
    setAnnouncements,
    setChatMessages,
    setDirectMessages,
  ]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-muted/30">
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            {/* Hero Section */}
            <HeroSection />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickStatsCard
                icon={BookOpen}
                label="Total Lessons"
                value={total}
                color="primary"
              />
              <QuickStatsCard
                icon={CheckCircle2}
                label="Completed"
                value={completed}
                color="emerald"
              />
              <QuickStatsCard
                icon={Zap}
                label="Sections"
                value={sections.length}
                color="amber"
              />
              <QuickStatsCard
                icon={Target}
                label="Remaining"
                value={total - completed}
                color="blue"
              />
            </div>

            {/* Main Content Grid - Equal columns */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Full Course Content Browser */}
              <SectionContentBrowser />

              {/* Messaging & Community */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Community
                </h2>
                <AnnouncementsCard />
                <CourseChatCard />
                <DirectMessagesCard />
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
