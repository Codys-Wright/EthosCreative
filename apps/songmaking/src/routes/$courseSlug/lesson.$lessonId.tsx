/**
 * Lesson Page for Course
 *
 * Dynamic lesson viewer that works with any course based on $courseSlug param.
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import * as Option from "effect/Option";
import {
  Badge,
  Button,
  Card,
  ScrollArea,
  Sidebar,
  SidebarProvider,
  useSidebar,
} from "@shadcn";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  PlayCircle,
  FileText,
  HelpCircle,
  ClipboardList,
  FileDown,
  BookOpen,
  ArrowLeft,
  Menu,
  Home,
  Music,
  Sparkles,
  Pencil,
  FlaskConical,
} from "lucide-react";
import { CourseSidebar } from "../../components/course-sidebar";
import type { Lesson, LessonPart } from "@course";
import { Editor } from "@components/markdown-editor/editor";
import {
  currentLessonIdAtom,
  currentLessonAtom,
  currentSectionAtom,
  nextLessonAtom,
  previousLessonAtom,
  progressAtom,
  ProgressUpdate,
} from "../../features/course/client/course-atoms";
import { useCourse } from "../../features/course/client/course-context";
import { cn } from "@shadcn/lib/utils";
import * as React from "react";

export const Route = createFileRoute("/$courseSlug/lesson/$lessonId")({
  component: LessonPageWrapper,
});

// =============================================================================
// Helper Components
// =============================================================================

function PartTypeIcon({
  type,
  className,
}: {
  type: LessonPart["type"];
  className?: string;
}) {
  const iconClass = cn("w-5 h-5", className);
  switch (type) {
    case "video":
      return <PlayCircle className={iconClass} />;
    case "text":
      return <FileText className={iconClass} />;
    case "quiz":
      return <HelpCircle className={iconClass} />;
    case "assignment":
      return <ClipboardList className={iconClass} />;
    case "download":
      return <FileDown className={iconClass} />;
    default:
      return <BookOpen className={iconClass} />;
  }
}

function PartTypeBadge({ type }: { type: LessonPart["type"] }) {
  const variants: Record<
    LessonPart["type"],
    { label: string; className: string }
  > = {
    video: {
      label: "Video",
      className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    text: {
      label: "Reading",
      className: "bg-green-500/10 text-green-600 dark:text-green-400",
    },
    quiz: {
      label: "Quiz",
      className: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    assignment: {
      label: "Assignment",
      className: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    },
    download: {
      label: "Download",
      className: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
    },
  };

  const variant = variants[type];
  return (
    <Badge variant="secondary" className={cn("text-xs", variant.className)}>
      {variant.label}
    </Badge>
  );
}

// =============================================================================
// Video Player Component
// =============================================================================

function VideoPlayer({
  videoContent,
}: {
  videoContent: Lesson["videoContent"];
}) {
  if (!videoContent) return null;

  return (
    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-xl">
      <iframe
        src={`https://www.youtube.com/embed/${videoContent.videoId}?rel=0`}
        title="Lesson Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}

// =============================================================================
// Lesson Part Content Renderer
// =============================================================================

function LessonPartContent({ part }: { part: LessonPart }) {
  const { isExample } = useCourse();

  return (
    <div className="space-y-4">
      {/* Part Header */}
      <div className="flex items-center gap-3 pb-2 border-b">
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            isExample ? "bg-amber-500/10" : "bg-primary/10"
          )}
        >
          <PartTypeIcon
            type={part.type}
            className={cn(
              "w-4 h-4",
              isExample ? "text-amber-600" : "text-primary"
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold">{part.title}</h3>
        </div>
        <PartTypeBadge type={part.type} />
      </div>

      {/* Part Content */}
      <div className="pt-2">
        {part.type === "video" && part.videoContent && (
          <VideoPlayer videoContent={part.videoContent} />
        )}

        {part.type === "text" && part.mdxContent && (
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <Editor
              editorSerializedState={
                typeof part.mdxContent === "string"
                  ? JSON.parse(part.mdxContent)
                  : undefined
              }
              readOnly
            />
          </div>
        )}

        {part.type === "quiz" && (
          <Card className="p-6 bg-purple-500/5 border-purple-500/20">
            <div className="text-center">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 text-purple-500" />
              <h4 className="font-semibold mb-2">Quiz Coming Soon</h4>
              <p className="text-sm text-muted-foreground">
                Interactive quizzes will be available in a future update.
              </p>
            </div>
          </Card>
        )}

        {part.type === "assignment" && (
          <Card className="p-6 bg-orange-500/5 border-orange-500/20">
            <div className="text-center">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 text-orange-500" />
              <h4 className="font-semibold mb-2">Assignment</h4>
              <p className="text-sm text-muted-foreground">
                Complete this assignment to reinforce your learning.
              </p>
            </div>
          </Card>
        )}

        {part.type === "download" && (
          <Card className="p-6">
            <div className="text-center">
              <FileDown className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="font-semibold mb-2">Downloadable Resources</h4>
              <p className="text-sm text-muted-foreground">
                Download files will be available here.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Table of Contents Sidebar
// =============================================================================

function TableOfContentsSidebar({
  parts,
  activePartId,
}: {
  parts: ReadonlyArray<LessonPart>;
  activePartId: string | null;
}) {
  const { isExample } = useCourse();

  if (parts.length <= 1) return null;

  return (
    <div className="hidden lg:block w-64 border-r flex-shrink-0">
      <div className="sticky top-0 p-4">
        <h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">
          In This Lesson
        </h3>
        <nav className="space-y-1">
          {parts.map((part, index) => (
            <a
              key={part.id}
              href={`#part-${part.id}`}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                activePartId === part.id
                  ? isExample
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium"
                    : "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <span
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0",
                  activePartId === part.id
                    ? isExample
                      ? "bg-amber-500 text-white"
                      : "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {index + 1}
              </span>
              <span className="truncate">{part.title}</span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}

// =============================================================================
// Lesson Navigation
// =============================================================================

function LessonNavigation({
  prevLesson,
  nextLesson,
}: {
  prevLesson: Option.Option<Lesson>;
  nextLesson: Option.Option<Lesson>;
}) {
  const { routes } = useCourse();

  return (
    <div className="flex items-stretch gap-4 border-t pt-8 mt-8">
      {/* Previous Lesson */}
      {Option.isSome(prevLesson) ? (
        <Link to={routes.lesson(prevLesson.value.id)} className="flex-1">
          <Card className="h-full p-4 hover:bg-muted/50 hover:border-primary/30 transition-all duration-200 group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs text-muted-foreground mb-0.5">
                  Previous Lesson
                </div>
                <div className="text-sm font-medium truncate">
                  {prevLesson.value.title}
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {/* Next Lesson */}
      {Option.isSome(nextLesson) ? (
        <Link to={routes.lesson(nextLesson.value.id)} className="flex-1">
          <Card className="h-full p-4 hover:bg-muted/50 hover:border-primary/30 transition-all duration-200 group">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0 text-right">
                <div className="text-xs text-muted-foreground mb-0.5">
                  Next Lesson
                </div>
                <div className="text-sm font-medium truncate">
                  {nextLesson.value.title}
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
              </div>
            </div>
          </Card>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

function LessonPageWrapper() {
  const { lessonId } = Route.useParams();

  return (
    <SidebarProvider defaultOpen>
      <CourseSidebar currentLessonId={lessonId} />
      <Sidebar.Inset>
        <LessonPage lessonId={lessonId} />
      </Sidebar.Inset>
    </SidebarProvider>
  );
}

function LessonPage({ lessonId }: { lessonId: string }) {
  const { course, routes, getLessonParts, isExample } = useCourse();
  const progressMap = useAtomValue(progressAtom);
  const setCurrentLessonId = useAtomSet(currentLessonIdAtom);
  const currentLesson = useAtomValue(currentLessonAtom);
  const currentSection = useAtomValue(currentSectionAtom);
  const nextLesson = useAtomValue(nextLessonAtom);
  const prevLesson = useAtomValue(previousLessonAtom);
  const setProgress = useAtomSet(progressAtom);

  // Get lesson parts
  const lesson = Option.isSome(currentLesson) ? currentLesson.value : null;
  const parts = lesson ? getLessonParts(lesson.id) : [];

  // Track which part is currently visible (for TOC highlighting)
  const [activePartId, setActivePartId] = React.useState<string | null>(
    parts[0]?.id ?? null
  );

  // Set current lesson ID when component mounts or lessonId changes
  React.useEffect(() => {
    setCurrentLessonId(lessonId);
    // Reset active part when lesson changes
    if (parts.length > 0) {
      setActivePartId(parts[0]?.id ?? null);
    }
  }, [lessonId, setCurrentLessonId, parts]);

  // Track scroll position to highlight active part in TOC
  React.useEffect(() => {
    if (parts.length <= 1) return;

    const handleScroll = () => {
      const scrollContainer = document.getElementById(
        "lesson-scroll-container"
      );
      if (!scrollContainer) return;

      const scrollTop = scrollContainer.scrollTop;
      const containerRect = scrollContainer.getBoundingClientRect();

      for (let i = parts.length - 1; i >= 0; i--) {
        const partElement = document.getElementById(`part-${parts[i].id}`);
        if (partElement) {
          const partRect = partElement.getBoundingClientRect();
          const relativeTop = partRect.top - containerRect.top;

          if (relativeTop <= 100) {
            setActivePartId(parts[i].id);
            break;
          }
        }
      }
    };

    const scrollContainer = document.getElementById("lesson-scroll-container");
    scrollContainer?.addEventListener("scroll", handleScroll);
    return () => scrollContainer?.removeEventListener("scroll", handleScroll);
  }, [parts]);

  // Handle mark as complete
  const handleMarkComplete = () => {
    if (!lesson) return;
    const isLocked = !lesson.isFree && !progressMap.get(lesson.id);
    if (isLocked) return;

    setProgress(ProgressUpdate.MarkComplete({ lessonId: lesson.id }));
  };

  const progress = lesson ? progressMap.get(lesson.id) : undefined;
  const isCompleted = progress?.status === "completed";
  const isLocked = lesson ? !lesson.isFree && !progress : false;
  const { isMobile, setOpenMobile } = useSidebar();

  if (!lesson) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="p-8 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Lesson Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The lesson you're looking for doesn't exist.
          </p>
          <Link to={routes.home}>
            <Button>Back to Course</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-svh flex flex-col">
      {/* Header */}
      <div
        className={cn(
          "flex-shrink-0 border-b",
          isExample ? "bg-amber-500/5" : "bg-background"
        )}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpenMobile(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Back to course */}
            <Link to={routes.home} className="hidden sm:block">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>

            {/* Lesson info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-0.5">
                {isExample && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  >
                    <FlaskConical className="w-3 h-3 mr-1" />
                    Example
                  </Badge>
                )}
                {Option.isSome(currentSection) && (
                  <span className="truncate">{currentSection.value.title}</span>
                )}
              </div>
              <h1 className="font-semibold truncate">{lesson.title}</h1>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Mark complete button */}
              {!isCompleted && !isLocked && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkComplete}
                  className="hidden sm:flex gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Complete
                </Button>
              )}
              {isCompleted && (
                <Badge className="gap-1 bg-emerald-500">
                  <CheckCircle2 className="w-3 h-3" />
                  Completed
                </Badge>
              )}

              {/* Quick Navigation */}
              {Option.isSome(prevLesson) && (
                <Link to={routes.lesson(prevLesson.value.id)}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </Link>
              )}
              {Option.isSome(nextLesson) && (
                <Link to={routes.lesson(nextLesson.value.id)}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area with TOC Sidebar */}
      <div className="flex-1 min-h-0 flex">
        {/* Table of Contents Sidebar (desktop) */}
        <TableOfContentsSidebar parts={parts} activePartId={activePartId} />

        {/* Scrollable Content - All parts rendered vertically */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full" id="lesson-scroll-container">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {/* Render all parts sequentially as a single continuous flow */}
              {parts.length > 0 ? (
                <div className="space-y-8">
                  {parts.map((part) => (
                    <div
                      key={part.id}
                      id={`part-${part.id}`}
                      className="scroll-mt-6"
                    >
                      <LessonPartContent part={part} />
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No Content Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    This lesson doesn't have any content parts yet.
                  </p>
                </Card>
              )}

              {/* Navigation Cards */}
              <LessonNavigation
                prevLesson={prevLesson}
                nextLesson={nextLesson}
              />
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
