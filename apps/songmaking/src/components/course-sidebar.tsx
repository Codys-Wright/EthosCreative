/**
 * Course Sidebar Component
 *
 * Uses the shadcn Sidebar component with Effect Atom for state management.
 * Features collapsible sections, progress tracking, path indicators, and responsive design.
 *
 * Now supports multiple courses via CourseContext.
 */

import { Link } from "@tanstack/react-router";
import { useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import { Sidebar, useSidebar, Collapsible, Badge, ScrollArea } from "@shadcn";
import {
  ChevronDown,
  CheckCircle2,
  Lock,
  Music,
  Home,
  LayoutDashboard,
  Settings,
  FlaskConical,
  MessageCircle,
} from "lucide-react";
import { UserButton, SignedIn, SignedOut, sessionAtom } from "@auth";
import type { Section, Lesson } from "@course";
import type { ClientLessonProgress } from "../features/course/client/course-atoms.js";
import {
  progressAtom,
  expandedSectionsAtom,
  sectionProgressAtom,
  expandedWeeksAtom,
  ExpandedWeeksUpdate,
  weekProgressAtom,
} from "../features/course/client/course-atoms.js";
import type { Week } from "../data/course-registry.js";
import { useCourse } from "../features/course/client/course-context.js";
import { cn } from "@shadcn/lib/utils";
import * as React from "react";

// =============================================================================
// Sidebar Width Override - wider for better readability
// =============================================================================

const SIDEBAR_STYLES = {
  "--sidebar-width": "20rem",
  "--sidebar-width-mobile": "22rem",
} as React.CSSProperties;

// =============================================================================
// Helper Components
// =============================================================================

function LessonProgressIcon({
  progress,
  isActive,
}: {
  progress?: ClientLessonProgress;
  isActive?: boolean;
}) {
  if (!progress || progress.status === "not_started") {
    return (
      <div
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
          isActive
            ? "border-primary-foreground/50"
            : "border-muted-foreground/30"
        )}
      >
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full transition-all duration-200",
            isActive ? "bg-primary-foreground/50" : "bg-transparent"
          )}
        />
      </div>
    );
  }
  if (progress.status === "completed") {
    return (
      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
      </div>
    );
  }
  // in_progress
  return (
    <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
    </div>
  );
}

// =============================================================================
// Lesson Item Component
// =============================================================================

function LessonItem({
  lesson,
  progress,
  isActive,
  isMobile,
  setOpenMobile,
}: {
  lesson: Lesson;
  progress?: ClientLessonProgress;
  isActive: boolean;
  isMobile: boolean;
  setOpenMobile: (open: boolean) => void;
}) {
  const { routes, getPathById } = useCourse();
  const isLocked = !lesson.isFree && !progress;
  const path = lesson.pathId && getPathById ? getPathById(lesson.pathId) : null;

  const handleClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
      return;
    }
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Link
      to={routes.lesson(lesson.id)}
      onClick={handleClick}
      className={cn(
        "group flex items-center gap-2.5 p-2.5 rounded-lg transition-all duration-200",
        isLocked
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-sidebar-accent/60",
        isActive &&
          !isLocked &&
          "bg-primary text-primary-foreground hover:bg-primary/90"
      )}
    >
      {/* Path Color Indicator */}
      <div
        className="w-1 self-stretch rounded-full flex-shrink-0"
        style={{ backgroundColor: path?.color ?? "transparent" }}
        title={path?.name}
      />

      {/* Progress Indicator */}
      <div className="flex-shrink-0">
        <LessonProgressIcon progress={progress} isActive={isActive} />
      </div>

      {/* Lesson Title */}
      <span
        className={cn(
          "flex-1 text-sm font-medium leading-snug break-words min-w-0",
          isActive ? "text-primary-foreground" : "text-foreground"
        )}
      >
        {lesson.title}
      </span>

      {/* Right side indicators */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {lesson.isFree && (
          <Badge
            variant="secondary"
            className={cn(
              "text-[10px] px-1.5 py-0 h-4 font-medium",
              isActive && "bg-primary-foreground/20 text-primary-foreground"
            )}
          >
            Free
          </Badge>
        )}
        {isLocked && (
          <Lock
            className={cn(
              "w-3.5 h-3.5",
              isActive ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          />
        )}
      </div>
    </Link>
  );
}

// =============================================================================
// Section Item Component
// =============================================================================

function SectionItem({
  section,
  sectionIndex,
  currentLessonId,
}: {
  section: Section;
  sectionIndex: number;
  currentLessonId?: string;
}) {
  const { getSectionLessons } = useCourse();
  const lessons = getSectionLessons(section.id);
  const progressMap = useAtomValue(progressAtom);
  const expandedSections = useAtomValue(expandedSectionsAtom);
  const setExpandedSections = useAtomSet(expandedSectionsAtom);
  const { isMobile, setOpenMobile } = useSidebar();

  const sectionProgress = useAtomValue(sectionProgressAtom(section.id));
  const isExpanded = expandedSections.has(section.id);
  const isCurrentSection = lessons.some((l) => l.id === currentLessonId);

  const toggleSection = () => {
    setExpandedSections({ _tag: "Toggle", sectionId: section.id });
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={toggleSection}>
      <Sidebar.MenuItem>
        {/* Section Header */}
        <Collapsible.Trigger asChild>
          <Sidebar.MenuButton
            className={cn(
              "h-auto py-3.5 px-3",
              isCurrentSection && !isExpanded && "bg-sidebar-accent/50"
            )}
          >
            {/* Section Number Badge */}
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors flex-shrink-0",
                sectionProgress.percent === 100
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : isCurrentSection
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {sectionProgress.percent === 100 ? (
                <CheckCircle2 className="w-4.5 h-4.5" />
              ) : (
                sectionIndex + 1
              )}
            </div>

            {/* Section Info */}
            <div className="flex-1 min-w-0 text-left">
              <div className="font-semibold text-sm leading-tight mb-1">
                {section.title}
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">
                  {sectionProgress.completed}/{sectionProgress.total} lessons
                </span>
              </div>
            </div>

            {/* Expand Icon */}
            <div
              className={cn(
                "w-6 h-6 rounded-md flex items-center justify-center transition-colors",
                "hover:bg-sidebar-accent"
              )}
            >
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}
              />
            </div>
          </Sidebar.MenuButton>
        </Collapsible.Trigger>

        {/* Section Progress Bar */}
        {sectionProgress.percent > 0 && sectionProgress.percent < 100 && (
          <div className="px-3 pb-2">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${sectionProgress.percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Lessons List */}
        <Collapsible.Content>
          <div className="px-2 pb-3 pt-1 space-y-1">
            {lessons.map((lesson) => {
              const progress = progressMap.get(lesson.id);
              const isActive = lesson.id === currentLessonId;

              return (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  progress={progress}
                  isActive={isActive}
                  isMobile={isMobile}
                  setOpenMobile={setOpenMobile}
                />
              );
            })}
          </div>
        </Collapsible.Content>
      </Sidebar.MenuItem>
    </Collapsible>
  );
}

// =============================================================================
// Section Badge Colors - for week-based navigation
// =============================================================================

const SECTION_BADGE_COLORS: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  "10000000-0000-0000-0000-000000000000": {
    bg: "bg-sky-100 dark:bg-sky-900/30",
    text: "text-sky-700 dark:text-sky-300",
    label: "Intro",
  },
  "10000000-0000-0000-0000-000000000001": {
    bg: "bg-violet-100 dark:bg-violet-900/30",
    text: "text-violet-700 dark:text-violet-300",
    label: "Song",
  },
  "10000000-0000-0000-0000-000000000002": {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
    label: "Art",
  },
  "10000000-0000-0000-0000-000000000003": {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-300",
    label: "Biz",
  },
};

function SectionBadge({ sectionId }: { sectionId: string }) {
  const colors = SECTION_BADGE_COLORS[sectionId] ?? {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
    label: "?",
  };

  return (
    <span
      className={cn(
        "text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0",
        colors.bg,
        colors.text
      )}
    >
      {colors.label}
    </span>
  );
}

// =============================================================================
// Week Lesson Item - Lesson with section badge for week navigation
// =============================================================================

function WeekLessonItem({
  lesson,
  progress,
  isActive,
  isMobile,
  setOpenMobile,
}: {
  lesson: Lesson;
  progress?: ClientLessonProgress;
  isActive: boolean;
  isMobile: boolean;
  setOpenMobile: (open: boolean) => void;
}) {
  const { routes } = useCourse();
  const isLocked = !lesson.isFree && !progress;

  const handleClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
      return;
    }
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Link
      to={routes.lesson(lesson.id)}
      onClick={handleClick}
      className={cn(
        "group flex items-center gap-2.5 p-2.5 rounded-lg transition-all duration-200",
        isLocked
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-sidebar-accent/60",
        isActive &&
          !isLocked &&
          "bg-primary text-primary-foreground hover:bg-primary/90"
      )}
    >
      {/* Progress Indicator */}
      <div className="flex-shrink-0">
        <LessonProgressIcon progress={progress} isActive={isActive} />
      </div>

      {/* Lesson Title */}
      <span
        className={cn(
          "flex-1 text-sm font-medium leading-snug break-words min-w-0",
          isActive ? "text-primary-foreground" : "text-foreground"
        )}
      >
        {lesson.title}
      </span>

      {/* Section Badge */}
      {!isActive && <SectionBadge sectionId={lesson.sectionId} />}

      {/* Lock icon if needed */}
      {isLocked && (
        <Lock
          className={cn(
            "w-3.5 h-3.5 flex-shrink-0",
            isActive ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        />
      )}
    </Link>
  );
}

// =============================================================================
// Week Item Component - Collapsible week with lessons
// =============================================================================

function WeekItem({
  week,
  weekIndex,
  currentLessonId,
}: {
  week: Week;
  weekIndex: number;
  currentLessonId?: string;
}) {
  const { getWeekLessons } = useCourse();
  const progressMap = useAtomValue(progressAtom);
  const expandedWeeks = useAtomValue(expandedWeeksAtom);
  const setExpandedWeeks = useAtomSet(expandedWeeksAtom);
  const { isMobile, setOpenMobile } = useSidebar();

  const lessons = getWeekLessons(week.id);
  const weekProgress = useAtomValue(weekProgressAtom(week.id));
  const isExpanded = expandedWeeks.has(week.id);
  const isCurrentWeek = lessons.some((l) => l.id === currentLessonId);
  const isComplete = weekProgress.percent === 100;

  const toggleWeek = () => {
    setExpandedWeeks(ExpandedWeeksUpdate.Toggle({ weekId: week.id }));
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={toggleWeek}>
      <Sidebar.MenuItem>
        {/* Week Header */}
        <Collapsible.Trigger asChild>
          <Sidebar.MenuButton
            className={cn(
              "h-auto py-3.5 px-3",
              isCurrentWeek && !isExpanded && "bg-sidebar-accent/50"
            )}
          >
            {/* Week Number Badge */}
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors flex-shrink-0",
                isComplete
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : isCurrentWeek
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isComplete ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                weekIndex + 1
              )}
            </div>

            {/* Week Info */}
            <div className="flex-1 min-w-0 text-left">
              <div className="font-semibold text-sm leading-tight mb-0.5">
                {week.title}
              </div>
              <div className="text-xs text-muted-foreground">
                {weekProgress.completed}/{weekProgress.total} lessons
              </div>
            </div>

            {/* Progress Ring */}
            <div className="w-7 h-7 relative flex-shrink-0">
              <svg className="w-7 h-7 -rotate-90" viewBox="0 0 28 28">
                <circle
                  cx="14"
                  cy="14"
                  r="10"
                  fill="none"
                  strokeWidth="3"
                  className="stroke-muted"
                />
                <circle
                  cx="14"
                  cy="14"
                  r="10"
                  fill="none"
                  strokeWidth="3"
                  strokeDasharray={`${
                    (weekProgress.percent / 100) * 62.8
                  } 62.8`}
                  className="stroke-primary transition-all duration-300"
                />
              </svg>
            </div>

            {/* Expand Icon */}
            <div
              className={cn(
                "w-6 h-6 rounded-md flex items-center justify-center transition-colors",
                "hover:bg-sidebar-accent"
              )}
            >
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}
              />
            </div>
          </Sidebar.MenuButton>
        </Collapsible.Trigger>

        {/* Lessons List */}
        <Collapsible.Content>
          <div className="px-2 pb-3 pt-1 space-y-1">
            {lessons.map((lesson) => {
              const progress = progressMap.get(lesson.id);
              const isActive = lesson.id === currentLessonId;

              return (
                <WeekLessonItem
                  key={lesson.id}
                  lesson={lesson}
                  progress={progress}
                  isActive={isActive}
                  isMobile={isMobile}
                  setOpenMobile={setOpenMobile}
                />
              );
            })}
          </div>
        </Collapsible.Content>
      </Sidebar.MenuItem>
    </Collapsible>
  );
}

// =============================================================================
// Admin Menu Item (shown only for instructors/admins)
// =============================================================================

function AdminMenuItem({
  routes,
  isMobile,
  setOpenMobile,
}: {
  routes: { admin: string };
  isMobile: boolean;
  setOpenMobile: (open: boolean) => void;
}) {
  const sessionResult = useAtomValue(sessionAtom);
  const session = sessionResult._tag === "Success" ? sessionResult.value : null;
  const isInstructor =
    session?.user?.role === "admin" ||
    session?.user?.role === "superadmin" ||
    session?.user?.role === "instructor";

  if (!isInstructor) return null;

  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton asChild tooltip="Course Admin" className="h-10">
        <Link
          to={routes.admin}
          onClick={() => {
            if (isMobile) {
              setOpenMobile(false);
            }
          }}
        >
          <Settings className="w-4 h-4" />
          <span className="font-medium">Course Admin</span>
        </Link>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );
}

// =============================================================================
// Main Sidebar Component
// =============================================================================

interface CourseSidebarProps {
  currentLessonId?: string;
}

export function CourseSidebar({ currentLessonId }: CourseSidebarProps) {
  const {
    course,
    sections,
    routes,
    isExample,
    getSectionLessons,
    weeks,
    hasCourseOrder,
    getWeekForLesson,
  } = useCourse();
  const setExpandedSections = useAtomSet(expandedSectionsAtom);
  const setExpandedWeeks = useAtomSet(expandedWeeksAtom);
  const { isMobile, setOpenMobile } = useSidebar();

  // Auto-expand section or week containing current lesson
  React.useEffect(() => {
    if (currentLessonId) {
      if (hasCourseOrder) {
        // Expand week containing current lesson
        const currentWeek = getWeekForLesson(currentLessonId);
        if (currentWeek) {
          setExpandedWeeks(
            ExpandedWeeksUpdate.Expand({ weekId: currentWeek.id })
          );
        }
      } else {
        // Fallback: expand section containing current lesson
        const currentSection = sections.find((s) =>
          getSectionLessons(s.id).some((l) => l.id === currentLessonId)
        );
        if (currentSection) {
          setExpandedSections({ _tag: "Expand", sectionId: currentSection.id });
        }
      }
    }
  }, [
    currentLessonId,
    sections,
    setExpandedSections,
    getSectionLessons,
    hasCourseOrder,
    getWeekForLesson,
    setExpandedWeeks,
  ]);

  return (
    <Sidebar
      collapsible="none"
      className="border-r overflow-hidden h-svh sticky top-0"
      style={SIDEBAR_STYLES}
    >
      {/* Course Header */}
      <Sidebar.Header className="border-b bg-gradient-to-b from-primary/5 to-transparent">
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton
              size="lg"
              asChild
              tooltip={course.title}
              className="h-auto py-4"
            >
              <Link
                to={routes.home}
                onClick={() => {
                  if (isMobile) {
                    setOpenMobile(false);
                  }
                }}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0",
                    isExample
                      ? "bg-gradient-to-br from-amber-500 to-orange-600"
                      : "bg-gradient-to-br from-primary to-primary/80"
                  )}
                >
                  {isExample ? (
                    <FlaskConical className="w-5 h-5 text-white" />
                  ) : (
                    <Music className="w-5 h-5 text-primary-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="font-bold text-base leading-tight truncate">
                    {course.title}
                  </h1>
                  <p className="text-xs text-muted-foreground truncate">
                    {isExample
                      ? "Demo course for admins"
                      : "Master the art of song creation"}
                  </p>
                </div>
              </Link>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.Header>

      {/* Quick Navigation */}
      <Sidebar.Group className="py-3">
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                asChild
                tooltip="My Dashboard"
                className="h-10"
              >
                <Link
                  to={routes.dashboard}
                  onClick={() => {
                    if (isMobile) {
                      setOpenMobile(false);
                    }
                  }}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="font-medium">My Dashboard</span>
                </Link>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                asChild
                tooltip="Course Chat"
                className="h-10"
              >
                <Link
                  to={routes.dashboard}
                  onClick={() => {
                    if (isMobile) {
                      setOpenMobile(false);
                    }
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="font-medium">Course Chat</span>
                </Link>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>

      <Sidebar.Separator />

      {/* Course Content - Scrollable */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <Sidebar.Group className="py-3">
            <Sidebar.GroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 px-2 mb-1">
              {hasCourseOrder ? "Weekly Progress" : "Course Content"}
            </Sidebar.GroupLabel>
            <Sidebar.GroupContent>
              <Sidebar.Menu>
                {hasCourseOrder
                  ? weeks.map((week, index) => (
                      <WeekItem
                        key={week.id}
                        week={week}
                        weekIndex={index}
                        currentLessonId={currentLessonId}
                      />
                    ))
                  : sections.map((section, index) => (
                      <SectionItem
                        key={section.id}
                        section={section}
                        sectionIndex={index}
                        currentLessonId={currentLessonId}
                      />
                    ))}
              </Sidebar.Menu>
            </Sidebar.GroupContent>
          </Sidebar.Group>
        </ScrollArea>
      </div>

      {/* Footer */}
      <Sidebar.Footer className="border-t py-3 space-y-2">
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton
              asChild
              tooltip="Course Overview"
              className="h-10"
            >
              <Link
                to={routes.home}
                onClick={() => {
                  if (isMobile) {
                    setOpenMobile(false);
                  }
                }}
              >
                <Home className="w-4 h-4" />
                <span className="font-medium">Course Overview</span>
              </Link>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
          <AdminMenuItem
            routes={routes}
            isMobile={isMobile}
            setOpenMobile={setOpenMobile}
          />
        </Sidebar.Menu>

        {/* User Account Card */}
        <div className="px-2">
          <SignedIn>
            <div className="rounded-lg border bg-card p-1">
              <UserButton
                size="default"
                className="w-full justify-start hover:bg-accent"
              />
            </div>
          </SignedIn>
          <SignedOut>
            <div className="rounded-lg border bg-card p-3">
              <p className="text-sm text-muted-foreground mb-3">
                Sign in to track your progress and save your work.
              </p>
              <Link to="/auth/$authView" params={{ authView: "sign-in" }}>
                <Sidebar.MenuButton className="h-10 w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Settings className="w-4 h-4" />
                  <span className="font-medium">Sign In</span>
                </Sidebar.MenuButton>
              </Link>
            </div>
          </SignedOut>
        </div>
      </Sidebar.Footer>
    </Sidebar>
  );
}

// =============================================================================
// App Sidebar Layout - wraps pages that need the sidebar
// =============================================================================

interface AppSidebarLayoutProps {
  children: React.ReactNode;
  currentLessonId?: string;
}

export function AppSidebarLayout({
  children,
  currentLessonId,
}: AppSidebarLayoutProps) {
  return (
    <Sidebar.Provider defaultOpen>
      <CourseSidebar currentLessonId={currentLessonId} />
      <Sidebar.Inset>{children}</Sidebar.Inset>
    </Sidebar.Provider>
  );
}
