/**
 * Course Admin Page
 *
 * Professional admin dashboard with:
 * - Overview tab: Stats, charts, and activity feed
 * - Content tab: Drag-and-drop lesson management
 * - Students tab: Enhanced table with sorting/filtering
 * - Settings tab: Course configuration
 */

import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useAtomSet } from "@effect-atom/atom-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { Label, Pie, PieChart } from "recharts";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Chart,
  type ChartConfig,
  Dialog,
  Input,
  Label as FormLabel,
  ScrollArea,
  Select,
  Switch,
  Table,
  Tabs,
  Textarea,
} from "@shadcn";
import {
  ArrowLeft,
  ArrowUpDown,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  FileDown,
  FileText,
  Filter,
  GripVertical,
  HelpCircle,
  LayoutDashboard,
  Music,
  PlayCircle,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import { useCourse } from "../../features/course/client/course-context.js";
import type {
  Section,
  Lesson,
  LessonPart,
  LessonType,
  LessonPartId,
  LessonId as BrandedLessonId,
  SectionId as BrandedSectionId,
  CourseId as BrandedCourseId,
  CourseQuizQuestion,
} from "@course";
import {
  createLessonPartAtom,
  deleteLessonPartAtom,
  reorderLessonPartsAtom,
} from "@course/features/lesson-part/client/index.js";
import {
  createLessonAtom,
  reorderLessonsAtom,
} from "@course/features/lesson/client/index.js";
import {
  updateCourseAtom,
  publishCourseAtom,
  archiveCourseAtom,
} from "@course/features/course/client/index.js";
import { cn } from "@shadcn/lib/utils";

// =============================================================================
// Types
// =============================================================================

interface SectionProgress {
  sectionId: string;
  completed: number;
  total: number;
}

interface StudentProgress {
  user: { id: string; name: string; email: string; image?: string | null };
  enrollmentId: string;
  enrollmentStatus: string;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
  lastActiveAt: Date | null;
  status: "not_started" | "in_progress" | "completed";
  sectionProgress: SectionProgress[];
}

interface ActivityItem {
  id: string;
  type: "enrolled" | "started" | "completed_lesson" | "completed_course";
  user: { name: string; image?: string | null };
  lessonTitle?: string;
  timestamp: Date;
}

// =============================================================================
// Mock Data
// =============================================================================

// Tailwind safelist (ensures these classes are included in the build):
// bg-sky-500 bg-sky-100 bg-sky-500/10 text-sky-700 text-sky-600 text-sky-300 text-sky-400 border-sky-200 border-sky-800
// bg-violet-500 bg-violet-100 bg-violet-500/10 text-violet-700 text-violet-600 text-violet-300 text-violet-400 border-violet-200 border-violet-800
// bg-amber-500 bg-amber-100 bg-amber-500/10 text-amber-700 text-amber-600 text-amber-300 text-amber-400 border-amber-200 border-amber-800
// bg-emerald-500 bg-emerald-100 bg-emerald-500/10 text-emerald-700 text-emerald-600 text-emerald-300 text-emerald-400 border-emerald-200 border-emerald-800
// dark:bg-sky-900/30 dark:bg-violet-900/30 dark:bg-amber-900/30 dark:bg-emerald-900/30

// Section styling by index (0-3) - works for any course
const SECTION_STYLES = [
  {
    label: "Intro",
    icon: BookOpen,
    color: "sky",
    bg: "bg-sky-500",
    bgLight: "bg-sky-100 dark:bg-sky-900/30",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-200 dark:border-sky-800",
    headerBg: "bg-sky-500/10",
    headerText: "text-sky-600 dark:text-sky-400",
  },
  {
    label: "Song",
    icon: Music,
    color: "violet",
    bg: "bg-violet-500",
    bgLight: "bg-violet-100 dark:bg-violet-900/30",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-200 dark:border-violet-800",
    headerBg: "bg-violet-500/10",
    headerText: "text-violet-600 dark:text-violet-400",
  },
  {
    label: "Art",
    icon: Sparkles,
    color: "amber",
    bg: "bg-amber-500",
    bgLight: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    headerBg: "bg-amber-500/10",
    headerText: "text-amber-600 dark:text-amber-400",
  },
  {
    label: "Biz",
    icon: TrendingUp,
    color: "emerald",
    bg: "bg-emerald-500",
    bgLight: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    headerBg: "bg-emerald-500/10",
    headerText: "text-emerald-600 dark:text-emerald-400",
  },
] as const;

type SectionStyleType = (typeof SECTION_STYLES)[number];


// =============================================================================
// Route
// =============================================================================

export const Route = createFileRoute("/$courseSlug/admin")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab:
      (search.tab as "overview" | "content" | "students" | "settings") ||
      "overview",
  }),
  component: AdminPage,
});

// =============================================================================
// Main Component
// =============================================================================

function AdminPage() {
  const { tab } = useSearch({ from: "/$courseSlug/admin" });
  const { course, sections, routes, isExample } = useCourse();
  const fetchEnrollments = useAtomSet(courseEnrollmentsWithUsersAtom);
  const enrollUser = useAtomSet(enrollInCourseAtom);
  const cancelEnrollment = useAtomSet(cancelEnrollmentAtom);
  const [enrollments, setEnrollments] = useState<EnrollmentWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadEnrollments = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchEnrollments({
        courseId: course.id as CourseId,
      });
      if (result._tag === "Right") {
        setEnrollments(result.right);
      }
    } finally {
      setIsLoading(false);
    }
  }, [course.id, fetchEnrollments]);

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  // Convert enrollments to StudentProgress for the existing overview/student components
  const students: StudentProgress[] = useMemo(
    () =>
      enrollments.map((e) => ({
        user: {
          id: e.userId,
          name: e.userName,
          email: e.userEmail,
          image: e.userImage ?? null,
        },
        enrollmentId: e.id,
        completedLessons: e.completedLessonCount,
        totalLessons: course.lessonCount,
        progressPercent: Number(e.progressPercent),
        lastActiveAt: e.lastAccessedAt
          ? new Date(e.lastAccessedAt as any)
          : null,
        status:
          e.completedAt != null
            ? ("completed" as const)
            : Number(e.progressPercent) > 0
            ? ("in_progress" as const)
            : ("not_started" as const),
        enrollmentStatus: e.status,
        sectionProgress: sections.map((s) => ({
          sectionId: s.id,
          completed: 0,
          total: s.lessonCount ?? 0,
        })),
      })),
    [enrollments, course.lessonCount, sections]
  );

  const handleRemoveStudent = useCallback(
    async (enrollmentId: string) => {
      await cancelEnrollment({ enrollmentId });
      loadEnrollments();
    },
    [cancelEnrollment, loadEnrollments]
  );

  const handleInviteStudent = useCallback(
    async (userId: string) => {
      await enrollUser({
        userId: userId as any,
        courseId: course.id as CourseId,
        source: "free" as any,
      } as any);
      loadEnrollments();
    },
    [enrollUser, course.id, loadEnrollments]
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={routes.dashboard}>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    isExample
                      ? "bg-gradient-to-br from-amber-500 to-orange-600"
                      : "bg-gradient-to-br from-primary to-primary/80"
                  )}
                >
                  <LayoutDashboard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">{course.title}</h1>
                  <p className="text-xs text-muted-foreground">
                    Admin Dashboard
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to={routes.home}>
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Preview Course
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={tab} className="space-y-6">
          <Tabs.List className="bg-background border">
            <Link to={routes.admin} search={{ tab: "overview" }}>
              <Tabs.Trigger value="overview" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </Tabs.Trigger>
            </Link>
            <Link to={routes.admin} search={{ tab: "content" }}>
              <Tabs.Trigger value="content" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Content
              </Tabs.Trigger>
            </Link>
            <Link to={routes.admin} search={{ tab: "students" }}>
              <Tabs.Trigger value="students" className="gap-2">
                <Users className="w-4 h-4" />
                Students
              </Tabs.Trigger>
            </Link>
            <Link to={routes.admin} search={{ tab: "settings" }}>
              <Tabs.Trigger value="settings" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Tabs.Trigger>
            </Link>
          </Tabs.List>

          <Tabs.Content value="overview">
            <OverviewTab students={students} activities={[]} />
          </Tabs.Content>

          <Tabs.Content value="content">
            <ContentTab />
          </Tabs.Content>

          <Tabs.Content value="students">
            <StudentsTab
              students={students}
              isLoading={isLoading}
              onRemoveStudent={handleRemoveStudent}
              onInviteStudent={handleInviteStudent}
            />
          </Tabs.Content>

          <Tabs.Content value="settings">
            <SettingsTab />
          </Tabs.Content>
        </Tabs>
      </main>
    </div>
  );
}

// =============================================================================
// Overview Tab
// =============================================================================

function OverviewTab({
  students,
  activities,
}: {
  students: StudentProgress[];
  activities: ActivityItem[];
}) {
  const stats = useMemo(() => {
    const total = students.length;
    const completed = students.filter((s) => s.status === "completed").length;
    const inProgress = students.filter(
      (s) => s.status === "in_progress"
    ).length;
    const notStarted = students.filter(
      (s) => s.status === "not_started"
    ).length;
    const activeRecently = students.filter((s) => {
      if (!s.lastActiveAt) return false;
      return Date.now() - s.lastActiveAt.getTime() < 7 * 24 * 60 * 60 * 1000;
    }).length;
    const avgProgress =
      total > 0
        ? Math.round(
            students.reduce((sum, s) => sum + s.progressPercent, 0) / total
          )
        : 0;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      activeRecently,
      avgProgress,
    };
  }, [students]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Users}
          label="Total Students"
          value={stats.total}
          color="blue"
        />
        <StatsCard
          icon={Zap}
          label="Active (7 days)"
          value={stats.activeRecently}
          color="emerald"
        />
        <StatsCard
          icon={TrendingUp}
          label="Avg. Progress"
          value={`${stats.avgProgress}%`}
          color="amber"
        />
        <StatsCard
          icon={CheckCircle2}
          label="Completed"
          value={stats.completed}
          color="violet"
        />
      </div>

      {/* Charts & Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <CompletionChart
          completed={stats.completed}
          inProgress={stats.inProgress}
          notStarted={stats.notStarted}
          total={stats.total}
        />
        <ActivityFeed activities={activities} />
      </div>
    </div>
  );
}

// =============================================================================
// Stats Card
// =============================================================================

function StatsCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: "blue" | "emerald" | "amber" | "violet";
}) {
  const colors = {
    blue: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    emerald:
      "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    amber:
      "bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    violet:
      "bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400",
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div
          className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center",
            colors[color]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}

// =============================================================================
// Completion Chart
// =============================================================================

const chartConfig = {
  students: { label: "Students" },
  completed: { label: "Completed", color: "hsl(var(--chart-1))" },
  inProgress: { label: "In Progress", color: "hsl(var(--chart-2))" },
  notStarted: { label: "Not Started", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

function CompletionChart({
  completed,
  inProgress,
  notStarted,
  total,
}: {
  completed: number;
  inProgress: number;
  notStarted: number;
  total: number;
}) {
  const chartData = [
    { status: "completed", students: completed, fill: "hsl(142, 76%, 36%)" },
    { status: "inProgress", students: inProgress, fill: "hsl(217, 91%, 60%)" },
    { status: "notStarted", students: notStarted, fill: "hsl(215, 20%, 65%)" },
  ];

  return (
    <Card className="flex flex-col">
      <Card.Header className="pb-2">
        <Card.Title className="text-base">Student Completion</Card.Title>
        <Card.Description>Distribution by progress status</Card.Description>
      </Card.Header>
      <Card.Content className="flex-1 pb-0">
        <Chart
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <Chart.Tooltip
              cursor={false}
              content={<Chart.TooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="students"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {total}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-sm"
                        >
                          Students
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </Pie>
          </PieChart>
        </Chart>
      </Card.Content>
      <Card.Footer className="flex justify-center gap-6 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-sm text-muted-foreground">
            Completed ({completed})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-sm text-muted-foreground">
            In Progress ({inProgress})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          <span className="text-sm text-muted-foreground">
            Not Started ({notStarted})
          </span>
        </div>
      </Card.Footer>
    </Card>
  );
}

// =============================================================================
// Activity Feed
// =============================================================================

function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "enrolled":
        return <UserCheck className="w-4 h-4 text-blue-500" />;
      case "started":
        return <PlayCircle className="w-4 h-4 text-amber-500" />;
      case "completed_lesson":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "completed_course":
        return <Sparkles className="w-4 h-4 text-violet-500" />;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case "enrolled":
        return `${activity.user.name} enrolled in the course`;
      case "started":
        return `${activity.user.name} started the course`;
      case "completed_lesson":
        return `${activity.user.name} completed "${activity.lessonTitle}"`;
      case "completed_course":
        return `${activity.user.name} completed the course!`;
    }
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title className="text-base">Recent Activity</Card.Title>
        <Card.Description>Latest student actions</Card.Description>
      </Card.Header>
      <Card.Content>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{getActivityText(activity)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatRelativeTime(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}

// =============================================================================
// Content Tab - Two Panel Layout: Weeks (left) + Sections (right)
// =============================================================================

interface WeekState {
  id: string;
  title: string;
  description: string | null;
  lessonIds: string[];
}

interface SectionLessonsState {
  [sectionId: string]: Lesson[];
}

interface AddLessonDialogState {
  isOpen: boolean;
  sectionId: string | null;
  sectionIndex: number;
}

interface AddPartDialogState {
  isOpen: boolean;
  lessonId: string | null;
}

interface LessonPartsState {
  [lessonId: string]: LessonPart[];
}

function ContentTab() {
  const {
    sections,
    lessons,
    weeks: initialWeeks,
    getLessonParts,
  } = useCourse();

  // RPC mutation atoms
  const createLesson = useAtomSet(createLessonAtom);
  const reorderLessonsRpc = useAtomSet(reorderLessonsAtom);
  const createPartRpc = useAtomSet(createLessonPartAtom);
  const deletePartRpc = useAtomSet(deleteLessonPartAtom);
  const reorderPartsRpc = useAtomSet(reorderLessonPartsAtom);

  // Track dirty state and saving
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const deletedPartIdsRef = useRef<Set<string>>(new Set());
  const initialPartIdsRef = useRef<Set<string>>(new Set());

  // Initialize weeks state from course data or create 8 empty weeks
  const [weeks, setWeeks] = useState<WeekState[]>(() => {
    if (initialWeeks && initialWeeks.length > 0) {
      return initialWeeks.map((w) => ({
        id: w.id,
        title: w.title,
        description: w.description,
        lessonIds: [...w.lessonIds],
      }));
    }
    // Create 8 default empty weeks
    return Array.from({ length: 8 }, (_, i) => ({
      id: `week-${i + 1}`,
      title: `Week ${i + 1}`,
      description: null,
      lessonIds: [],
    }));
  });

  // Initialize section lessons state (for drag-and-drop ordering within sections)
  const [sectionLessons, setSectionLessons] = useState<SectionLessonsState>(
    () => {
      const grouped: SectionLessonsState = {};
      sections.forEach((section) => {
        grouped[section.id] = lessons
          .filter((l) => l.sectionId === section.id)
          .sort((a, b) => a.sortOrder - b.sortOrder);
      });
      return grouped;
    }
  );

  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(
    weeks[0]?.id ?? null
  );
  const [isClient, setIsClient] = useState(false);
  const [addLessonDialog, setAddLessonDialog] = useState<AddLessonDialogState>({
    isOpen: false,
    sectionId: null,
    sectionIndex: 0,
  });
  const [addPartDialog, setAddPartDialog] = useState<AddPartDialogState>({
    isOpen: false,
    lessonId: null,
  });

  // Initialize lesson parts state from course data
  const [lessonParts, setLessonParts] = useState<LessonPartsState>(() => {
    const partsMap: LessonPartsState = {};
    lessons.forEach((lesson) => {
      partsMap[lesson.id] = [...getLessonParts(lesson.id)];
    });
    return partsMap;
  });

  // Build initial part IDs set for tracking deletions
  useEffect(() => {
    const ids = new Set<string>();
    lessons.forEach((lesson) => {
      getLessonParts(lesson.id).forEach((p) => ids.add(p.id));
    });
    initialPartIdsRef.current = ids;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get parts for a lesson (from local state)
  const getLocalLessonParts = (lessonId: string): LessonPart[] => {
    return lessonParts[lessonId] || [];
  };

  // Open add part dialog for a lesson
  const openAddPartDialog = (lessonId: string) => {
    setAddPartDialog({ isOpen: true, lessonId });
  };

  // Close add part dialog
  const closeAddPartDialog = () => {
    setAddPartDialog({ isOpen: false, lessonId: null });
  };

  // Add a new part to a lesson
  const addPart = (title: string, type: LessonType) => {
    if (!addPartDialog.lessonId) return;

    const lessonId = addPartDialog.lessonId;
    const existingParts = lessonParts[lessonId] || [];
    const newPart = {
      id: `new-part-${Date.now()}`,
      lessonId: lessonId,
      title,
      type,
      sortOrder: existingParts.length,
      durationMinutes: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as LessonPart;

    setLessonParts((prev) => ({
      ...prev,
      [lessonId]: [...(prev[lessonId] || []), newPart],
    }));
    setIsDirty(true);

    closeAddPartDialog();
  };

  // Remove a part from a lesson
  const removePart = (lessonId: string, partId: string) => {
    if (initialPartIdsRef.current.has(partId)) {
      deletedPartIdsRef.current.add(partId);
    }
    setLessonParts((prev) => ({
      ...prev,
      [lessonId]: (prev[lessonId] || []).filter((p) => p.id !== partId),
    }));
    setIsDirty(true);
  };

  // Reorder parts within a lesson
  const reorderParts = (lessonId: string, newParts: LessonPart[]) => {
    setLessonParts((prev) => ({
      ...prev,
      [lessonId]: newParts,
    }));
    setIsDirty(true);
  };

  // Open add lesson dialog for a section
  const openAddLessonDialog = (sectionId: string, sectionIndex: number) => {
    setAddLessonDialog({ isOpen: true, sectionId, sectionIndex });
  };

  // Close add lesson dialog
  const closeAddLessonDialog = () => {
    setAddLessonDialog({ isOpen: false, sectionId: null, sectionIndex: 0 });
  };

  // Add a new lesson to a section
  const addLesson = (title: string) => {
    if (!addLessonDialog.sectionId) return;

    const sectionId = addLessonDialog.sectionId;
    const existingLessons = sectionLessons[sectionId] || [];
    const newLesson = {
      id: `new-lesson-${Date.now()}`,
      courseId: sections[0]?.courseId ?? "",
      sectionId: sectionId,
      title,
      description: null,
      type: "video", // Default type, not really used since parts define content
      sortOrder: existingLessons.length,
      durationMinutes: 0,
      isFree: false,
      isPreview: false,
      isPublished: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as Lesson;

    setSectionLessons((prev) => ({
      ...prev,
      [sectionId]: [...(prev[sectionId] || []), newLesson],
    }));
    setIsDirty(true);

    closeAddLessonDialog();
  };

  // Get all lesson IDs that are assigned to any week
  const assignedLessonIds = useMemo(() => {
    const ids = new Set<string>();
    weeks.forEach((w) => w.lessonIds.forEach((id) => ids.add(id)));
    return ids;
  }, [weeks]);

  // Get lessons for the selected week
  const selectedWeekLessons = useMemo(() => {
    if (!selectedWeekId) return [];
    const week = weeks.find((w) => w.id === selectedWeekId);
    if (!week) return [];
    return week.lessonIds
      .map((id) => lessons.find((l) => l.id === id))
      .filter((l): l is Lesson => l !== undefined);
  }, [selectedWeekId, weeks, lessons]);

  // Add lesson to week
  const addLessonToWeek = (lessonId: string) => {
    if (!selectedWeekId) return;
    setWeeks((prev) =>
      prev.map((w) =>
        w.id === selectedWeekId
          ? { ...w, lessonIds: [...w.lessonIds, lessonId] }
          : w
      )
    );
  };

  // Remove lesson from week
  const removeLessonFromWeek = (lessonId: string) => {
    if (!selectedWeekId) return;
    setWeeks((prev) =>
      prev.map((w) =>
        w.id === selectedWeekId
          ? { ...w, lessonIds: w.lessonIds.filter((id) => id !== lessonId) }
          : w
      )
    );
  };

  // Reorder lessons within selected week
  const reorderWeekLessons = (reorderedIds: string[]) => {
    if (!selectedWeekId) return;
    setWeeks((prev) =>
      prev.map((w) =>
        w.id === selectedWeekId ? { ...w, lessonIds: reorderedIds } : w
      )
    );
  };

  // Update week title
  const updateWeekTitle = (weekId: string, title: string) => {
    setWeeks((prev) =>
      prev.map((w) => (w.id === weekId ? { ...w, title } : w))
    );
  };

  // Reorder lessons within a section
  const reorderSectionLessons = (sectionId: string, newLessons: Lesson[]) => {
    setSectionLessons((prev) => ({
      ...prev,
      [sectionId]: newLessons,
    }));
    setIsDirty(true);
  };

  // Save all content changes to the database
  const handleSaveContent = useCallback(async () => {
    setIsSaving(true);
    try {
      // 1. Delete removed parts
      for (const partId of deletedPartIdsRef.current) {
        await deletePartRpc(partId as LessonPartId);
      }

      // 2. Create new lessons and parts
      const lessonIdMap = new Map<string, string>(); // old temp ID -> real ID

      for (const section of sections) {
        const sectionLessonList = sectionLessons[section.id] || [];
        for (const lesson of sectionLessonList) {
          if (lesson.id.startsWith("new-lesson-")) {
            const created = await createLesson({
              sectionId: section.id as BrandedSectionId,
              title: lesson.title,
              sortOrder: lesson.sortOrder,
            } as any);
            lessonIdMap.set(lesson.id, created.id);
          }
        }
      }

      // 3. Create new parts
      for (const [lessonId, parts] of Object.entries(lessonParts)) {
        const realLessonId = lessonIdMap.get(lessonId) ?? lessonId;
        for (const part of parts) {
          if (part.id.startsWith("new-part-")) {
            await createPartRpc({
              lessonId: realLessonId as BrandedLessonId,
              title: part.title,
              type: part.type,
              sortOrder: part.sortOrder,
            } as any);
          }
        }
      }

      // 4. Reorder lessons within each section
      for (const section of sections) {
        const sectionLessonList = sectionLessons[section.id] || [];
        const lessonIds = sectionLessonList.map(
          (l) =>
            (lessonIdMap.get(l.id) ?? l.id) as BrandedLessonId
        );
        if (lessonIds.length > 0) {
          await reorderLessonsRpc({
            sectionId: section.id as BrandedSectionId,
            lessonIds,
          });
        }
      }

      // 5. Reorder parts within each lesson
      for (const [lessonId, parts] of Object.entries(lessonParts)) {
        const realLessonId = lessonIdMap.get(lessonId) ?? lessonId;
        const existingParts = parts.filter(
          (p) => !p.id.startsWith("new-part-")
        );
        if (existingParts.length > 0) {
          await reorderPartsRpc({
            lessonId: realLessonId as BrandedLessonId,
            partIds: existingParts.map((p) => p.id as LessonPartId),
          });
        }
      }

      toast.success("Content changes saved successfully");
      setIsDirty(false);
      deletedPartIdsRef.current.clear();
    } catch {
      toast.error("Failed to save content changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [
    sections,
    sectionLessons,
    lessonParts,
    createLesson,
    reorderLessonsRpc,
    createPartRpc,
    deletePartRpc,
    reorderPartsRpc,
  ]);

  if (!isClient) {
    return (
      <div className="h-[calc(100vh-220px)] flex items-center justify-center">
        <div className="text-muted-foreground">Loading content...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Course Content & Order</h2>
          <p className="text-sm text-muted-foreground">
            Manage lessons in sections, then assign them to weeks for the
            learning order
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">
            {assignedLessonIds.size}/{lessons.length} lessons in weeks
          </Badge>
          {isDirty && (
            <Button
              size="sm"
              onClick={handleSaveContent}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>
      </div>

      <div className="h-[calc(100vh-240px)]">
        <ScrollArea className="h-full w-full">
          <div className="flex gap-4 p-1">
            {/* Column 1: Week List */}
            <WeekListColumn
              weeks={weeks}
              selectedWeekId={selectedWeekId}
              onSelectWeek={setSelectedWeekId}
              onUpdateTitle={updateWeekTitle}
            />

            {/* Column 2: Selected Week Lessons */}
            <WeekLessonsColumn
              selectedWeek={weeks.find((w) => w.id === selectedWeekId)}
              lessons={selectedWeekLessons}
              sections={sections}
              onRemove={removeLessonFromWeek}
              onReorder={reorderWeekLessons}
            />

            {/* Vertical Separator */}
            <div className="flex-shrink-0 w-px bg-border mx-2 self-stretch" />

            {/* Columns 3-6: Section Columns */}
            {sections.map((section, sectionIndex) => (
              <SectionColumn
                key={section.id}
                section={section}
                sectionIndex={sectionIndex}
                lessons={sectionLessons[section.id] || []}
                assignedLessonIds={assignedLessonIds}
                selectedWeekId={selectedWeekId}
                onAddToWeek={addLessonToWeek}
                onReorder={(newLessons) =>
                  reorderSectionLessons(section.id, newLessons)
                }
                onOpenAddLesson={() =>
                  openAddLessonDialog(section.id, sectionIndex)
                }
                getLessonParts={getLocalLessonParts}
                onOpenAddPart={openAddPartDialog}
                onRemovePart={removePart}
                onReorderParts={reorderParts}
              />
            ))}
          </div>
          <ScrollArea.Bar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Add Lesson Dialog */}
      <AddLessonDialog
        isOpen={addLessonDialog.isOpen}
        sectionIndex={addLessonDialog.sectionIndex}
        onClose={closeAddLessonDialog}
        onAdd={addLesson}
      />

      {/* Add Part Dialog */}
      <AddPartDialog
        isOpen={addPartDialog.isOpen}
        onClose={closeAddPartDialog}
        onAdd={addPart}
      />
    </div>
  );
}

// =============================================================================
// Week List Column (Column 1)
// =============================================================================

function WeekListColumn({
  weeks,
  selectedWeekId,
  onSelectWeek,
  onUpdateTitle,
}: {
  weeks: WeekState[];
  selectedWeekId: string | null;
  onSelectWeek: (weekId: string) => void;
  onUpdateTitle: (weekId: string, title: string) => void;
}) {
  return (
    <div className="flex-shrink-0 w-[240px] border rounded-lg bg-gradient-to-b from-primary/5 to-card flex flex-col">
      <div className="p-3 border-b bg-primary/10">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Weeks</h3>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          Select a week to edit
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {weeks.map((week, index) => (
            <WeekListItem
              key={week.id}
              week={week}
              weekIndex={index}
              isSelected={selectedWeekId === week.id}
              lessonCount={week.lessonIds.length}
              onSelect={() => onSelectWeek(week.id)}
              onUpdateTitle={(title) => onUpdateTitle(week.id, title)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function WeekListItem({
  week,
  weekIndex,
  isSelected,
  lessonCount,
  onSelect,
  onUpdateTitle,
}: {
  week: WeekState;
  weekIndex: number;
  isSelected: boolean;
  lessonCount: number;
  onSelect: () => void;
  onUpdateTitle: (title: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(week.title);

  const handleSaveTitle = () => {
    onUpdateTitle(editTitle);
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        "rounded-lg px-3 py-2.5 cursor-pointer transition-all group",
        isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"
      )}
      onClick={() => !isEditing && onSelect()}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
            isSelected
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {weekIndex + 1}
        </div>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-7 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTitle();
                  if (e.key === "Escape") setIsEditing(false);
                }}
                
              />
            </div>
          ) : (
            <>
              <span className="text-sm font-medium truncate block">
                {week.title}
              </span>
              <span
                className={cn(
                  "text-xs",
                  isSelected
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                )}
              >
                {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
              </span>
            </>
          )}
        </div>
        {isSelected && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
      </div>
    </div>
  );
}

// =============================================================================
// Week Lessons Column (Column 2)
// =============================================================================

function WeekLessonsColumn({
  selectedWeek,
  lessons,
  sections,
  onRemove,
  onReorder,
}: {
  selectedWeek: WeekState | undefined;
  lessons: Lesson[];
  sections: ReadonlyArray<Section>;
  onRemove: (lessonId: string) => void;
  onReorder: (lessonIds: string[]) => void;
}) {
  return (
    <div className="flex-shrink-0 w-[340px] border rounded-lg bg-gradient-to-b from-primary/5 to-card flex flex-col">
      <div className="p-3 border-b bg-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">
              {selectedWeek?.title ?? "Select Week"}
            </h3>
          </div>
          <Badge variant="secondary" className="text-[10px]">
            {lessons.length} lessons
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          Drag to reorder lessons
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {selectedWeek ? (
            <>
              <WeekLessonsList
                lessons={lessons}
                sections={sections}
                onRemove={onRemove}
                onReorder={onReorder}
              />
              {lessons.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-xs border-2 border-dashed rounded-lg">
                  Click + on lessons to add
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-xs">
              Select a week from the list
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// =============================================================================
// Week Lessons List (sortable list in left panel)
// =============================================================================

function WeekLessonsList({
  lessons,
  sections,
  onRemove,
  onReorder,
}: {
  lessons: Lesson[];
  sections: ReadonlyArray<Section>;
  onRemove: (lessonId: string) => void;
  onReorder: (lessonIds: string[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = lessons.findIndex((l) => l.id === active.id);
    const newIndex = lessons.findIndex((l) => l.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(
        lessons.map((l) => l.id),
        oldIndex,
        newIndex
      );
      onReorder(newOrder);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext
        items={lessons.map((l) => l.id)}
        strategy={verticalListSortingStrategy}
      >
        {lessons.map((lesson, index) => (
          <WeekLessonItem
            key={lesson.id}
            lesson={lesson}
            index={index}
            sectionIndex={sections.findIndex((s) => s.id === lesson.sectionId)}
            onRemove={() => onRemove(lesson.id)}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}

function WeekLessonItem({
  lesson,
  index,
  sectionIndex,
  onRemove,
}: {
  lesson: Lesson;
  index: number;
  sectionIndex: number;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  const sectionStyle = SECTION_STYLES[sectionIndex] ?? SECTION_STYLES[0];
  const SectionIcon = sectionStyle?.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border bg-background px-3 py-2.5 group",
        isDragging && "shadow-lg ring-2 ring-primary/20"
      )}
    >
      <div className="flex items-start gap-2">
        <button
          className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0 mt-0.5"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
        <span className="text-xs text-muted-foreground w-5 flex-shrink-0 mt-0.5">
          {index + 1}.
        </span>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium leading-snug">
            {lesson.title}
          </span>
        </div>
        {sectionStyle && SectionIcon && (
          <span
            className={cn(
              "p-1 rounded flex items-center justify-center flex-shrink-0 mt-0.5",
              sectionStyle.bgLight,
              sectionStyle.text
            )}
            title={sectionStyle.label}
          >
            <SectionIcon className="w-3.5 h-3.5" />
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5"
          onClick={onRemove}
        >
          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// Section Column (in right panel)
// =============================================================================

function SectionColumn({
  section,
  sectionIndex,
  lessons,
  assignedLessonIds,
  selectedWeekId,
  onAddToWeek,
  onReorder,
  onOpenAddLesson,
  getLessonParts,
  onOpenAddPart,
  onRemovePart,
  onReorderParts,
}: {
  section: Section;
  sectionIndex: number;
  lessons: Lesson[];
  assignedLessonIds: Set<string>;
  selectedWeekId: string | null;
  onAddToWeek: (lessonId: string) => void;
  onReorder: (lessons: Lesson[]) => void;
  onOpenAddLesson: () => void;
  getLessonParts: (lessonId: string) => LessonPart[];
  onOpenAddPart: (lessonId: string) => void;
  onRemovePart: (lessonId: string, partId: string) => void;
  onReorderParts: (lessonId: string, parts: LessonPart[]) => void;
}) {
  const sectionStyle = SECTION_STYLES[sectionIndex] ?? SECTION_STYLES[0];
  const SectionIcon = sectionStyle?.icon ?? BookOpen;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = lessons.findIndex((l) => l.id === active.id);
    const newIndex = lessons.findIndex((l) => l.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      const newLessons = arrayMove(lessons, oldIndex, newIndex);
      onReorder(newLessons);
    }
  };

  return (
    <div
      className={cn(
        "flex-shrink-0 w-[300px] min-w-[300px] max-w-[300px] border rounded-lg bg-card flex flex-col overflow-hidden",
        sectionStyle.border
      )}
    >
      {/* Section Header with color */}
      <div className={cn("p-3 border-b", sectionStyle.headerBg)}>
        <div className="flex items-center gap-2 mb-1">
          <div
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center",
              sectionStyle.bg
            )}
          >
            <SectionIcon className="w-4 h-4 text-white" />
          </div>
          <span
            className={cn("font-semibold text-sm", sectionStyle.headerText)}
          >
            {section.title}
          </span>
          <Badge
            variant="outline"
            className={cn("text-[10px] ml-auto", sectionStyle.border)}
          >
            {lessons.length}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1 pl-9">
          {section.description}
        </p>
      </div>

      {/* Section Lessons */}
      <ScrollArea className="flex-1">
        <div className="p-2 overflow-hidden">
          <div className="space-y-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={lessons.map((l) => l.id)}
                strategy={verticalListSortingStrategy}
              >
                {lessons.map((lesson, index) => (
                  <SectionLessonCard
                    key={lesson.id}
                    lesson={lesson}
                    index={index}
                    isAssigned={assignedLessonIds.has(lesson.id)}
                    canAddToWeek={selectedWeekId !== null}
                    onAddToWeek={() => onAddToWeek(lesson.id)}
                    sectionStyle={sectionStyle}
                    parts={getLessonParts(lesson.id)}
                    onOpenAddPart={() => onOpenAddPart(lesson.id)}
                    onRemovePart={(partId) => onRemovePart(lesson.id, partId)}
                    onReorderParts={(parts) => onReorderParts(lesson.id, parts)}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {lessons.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-xs">
                No lessons in this section
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Add Lesson Button */}
      <div className="p-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          className={cn("w-full gap-2", sectionStyle.headerText)}
          onClick={onOpenAddLesson}
        >
          <Plus className="w-4 h-4" />
          Add Lesson
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// Add Lesson Dialog
// =============================================================================

function AddLessonDialog({
  isOpen,
  sectionIndex,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  sectionIndex: number;
  onClose: () => void;
  onAdd: (title: string) => void;
}) {
  const [title, setTitle] = useState("");

  const sectionStyle = SECTION_STYLES[sectionIndex] ?? SECTION_STYLES[0];
  const SectionIcon = sectionStyle?.icon ?? BookOpen;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim());
      setTitle("");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setTitle("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Content className="sm:max-w-[425px]">
        <Dialog.Header>
          <Dialog.Title className="flex items-center gap-2">
            <div
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center",
                sectionStyle.bg
              )}
            >
              <SectionIcon className="w-4 h-4 text-white" />
            </div>
            Add Lesson to {sectionStyle.label}
          </Dialog.Title>
          <Dialog.Description>
            Create a new lesson container. Add parts (video, text, quiz, etc.)
            after creating.
          </Dialog.Description>
        </Dialog.Header>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <FormLabel htmlFor="lesson-title">Lesson Title</FormLabel>
              <Input
                id="lesson-title"
                placeholder="Enter lesson title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                
              />
            </div>
          </div>
          <Dialog.Footer>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim()}
              className={cn(sectionStyle.bg, "hover:opacity-90")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Lesson
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  );
}

// =============================================================================
// Add Part Dialog
// =============================================================================

function AddPartDialog({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, type: LessonType) => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<LessonType>("video");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim(), type);
      setTitle("");
      setType("video");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setTitle("");
      setType("video");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Content className="sm:max-w-[425px]">
        <Dialog.Header>
          <Dialog.Title className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Part
          </Dialog.Title>
          <Dialog.Description>
            Add a content part to this lesson (video, text, quiz, etc.)
          </Dialog.Description>
        </Dialog.Header>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <FormLabel htmlFor="part-title">Part Title</FormLabel>
              <Input
                id="part-title"
                placeholder="Enter part title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                
              />
            </div>
            <div className="space-y-2">
              <FormLabel htmlFor="part-type">Part Type</FormLabel>
              <Select
                value={type}
                onValueChange={(v) => setType(v as LessonType)}
              >
                <Select.Trigger id="part-type">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="video">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="w-4 h-4" />
                      Video
                    </div>
                  </Select.Item>
                  <Select.Item value="text">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Text
                    </div>
                  </Select.Item>
                  <Select.Item value="quiz">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      Quiz
                    </div>
                  </Select.Item>
                  <Select.Item value="assignment">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" />
                      Assignment
                    </div>
                  </Select.Item>
                  <Select.Item value="download">
                    <div className="flex items-center gap-2">
                      <FileDown className="w-4 h-4" />
                      Download
                    </div>
                  </Select.Item>
                </Select.Content>
              </Select>
            </div>
          </div>
          <Dialog.Footer>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Part
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  );
}

// =============================================================================
// Section Lesson Card (sortable, with add-to-week button)
// =============================================================================

function SectionLessonCard({
  lesson,
  index,
  isAssigned,
  canAddToWeek,
  onAddToWeek,
  sectionStyle,
  parts,
  onOpenAddPart,
  onRemovePart,
  onReorderParts,
}: {
  lesson: Lesson;
  index: number;
  isAssigned: boolean;
  canAddToWeek: boolean;
  onAddToWeek: () => void;
  sectionStyle: SectionStyleType;
  parts: LessonPart[];
  onOpenAddPart: () => void;
  onRemovePart: (partId: string) => void;
  onReorderParts: (parts: LessonPart[]) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  const getPartIcon = (type: string) => {
    switch (type) {
      case "video":
        return PlayCircle;
      case "text":
        return FileText;
      case "quiz":
        return HelpCircle;
      case "assignment":
        return ClipboardList;
      case "download":
        return FileDown;
      default:
        return FileText;
    }
  };

  // Handle part reordering
  const partSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handlePartDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = parts.findIndex((p) => p.id === active.id);
    const newIndex = parts.findIndex((p) => p.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      const newParts = arrayMove(parts, oldIndex, newIndex);
      onReorderParts(newParts);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
      className={cn(
        "rounded-lg border bg-background p-3 group overflow-hidden",
        isDragging && "shadow-lg ring-2 ring-primary/20",
        isAssigned && cn(sectionStyle.border, sectionStyle.bgLight)
      )}
    >
      <div className="flex items-start gap-2 min-w-0 w-full overflow-hidden">
        <button
          className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0 mt-0.5"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="flex-1 min-w-0 overflow-hidden w-0">
          <div className="flex items-center gap-2 mb-1 overflow-hidden">
            <span className="text-sm font-medium truncate flex-1 min-w-0">
              {lesson.title}
            </span>
            {isAssigned && (
              <CheckCircle2
                className={cn("w-3.5 h-3.5 flex-shrink-0", sectionStyle.text)}
              />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              {parts.length} {parts.length === 1 ? "part" : "parts"}
            </span>
          </div>

          {/* Lesson Parts - Sortable */}
          <div className="mt-2 pt-2 border-t border-dashed overflow-hidden">
            {parts.length > 0 ? (
              <DndContext
                sensors={partSensors}
                collisionDetection={closestCenter}
                onDragEnd={handlePartDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={parts.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1">
                    {parts.map((part) => (
                      <SortablePartItem
                        key={part.id}
                        part={part}
                        getPartIcon={getPartIcon}
                        onRemove={() => onRemovePart(part.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-xs text-muted-foreground italic py-1">
                No parts yet
              </div>
            )}

            {/* Add Part Button */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
              onClick={onOpenAddPart}
            >
              <Plus className="w-3 h-3" />
              Add Part
            </Button>
          </div>
        </div>

        {canAddToWeek && !isAssigned && (
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-7 w-7 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
              sectionStyle.border
            )}
            onClick={onAddToWeek}
            title="Add to week"
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Sortable Part Item (for drag-and-drop within lesson card)
// =============================================================================

function SortablePartItem({
  part,
  getPartIcon,
  onRemove,
}: {
  part: LessonPart;
  getPartIcon: (type: string) => React.ElementType;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: part.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const PartIcon = getPartIcon(part.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-1.5 text-xs text-muted-foreground py-1 px-1 -mx-1 rounded group/part hover:bg-muted/50 overflow-hidden",
        isDragging && "bg-muted"
      )}
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-3 h-3" />
      </button>
      <PartIcon className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="flex-1 min-w-0 truncate">{part.title}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 flex-shrink-0 opacity-0 group-hover/part:opacity-100 transition-opacity"
        onClick={onRemove}
      >
        <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
      </Button>
    </div>
  );
}

// =============================================================================
// Students Tab
// =============================================================================

function StudentsTab({
  students,
  isLoading,
  onRemoveStudent,
  onInviteStudent,
}: {
  students: StudentProgress[];
  isLoading: boolean;
  onRemoveStudent: (enrollmentId: string) => void;
  onInviteStudent: (userId: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "progress" | "lastActive">(
    "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteUserId, setInviteUserId] = useState("");

  const filteredStudents = useMemo(() => {
    let result = [...students];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.user.name.toLowerCase().includes(query) ||
          s.user.email.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.user.name.localeCompare(b.user.name);
          break;
        case "progress":
          comparison = a.progressPercent - b.progressPercent;
          break;
        case "lastActive":
          const aTime = a.lastActiveAt?.getTime() ?? 0;
          const bTime = b.lastActiveAt?.getTime() ?? 0;
          comparison = aTime - bTime;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [students, searchQuery, statusFilter, sortBy, sortOrder]);

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <Card>
      <Card.Header>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Card.Title>Enrolled Students</Card.Title>
            <Card.Description>
              {students.length} students enrolled
            </Card.Description>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                className="pl-8 w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <Select.Trigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">All Status</Select.Item>
                <Select.Item value="completed">Completed</Select.Item>
                <Select.Item value="in_progress">In Progress</Select.Item>
                <Select.Item value="not_started">Not Started</Select.Item>
              </Select.Content>
            </Select>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => setInviteDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add Student
            </Button>
          </div>
        </div>
      </Card.Header>
      <Card.Content>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>
                <button
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => toggleSort("name")}
                >
                  Student
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </Table.Head>
              <Table.Head>
                <button
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => toggleSort("progress")}
                >
                  Progress
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </Table.Head>
              <Table.Head>
                <button
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => toggleSort("lastActive")}
                >
                  Last Active
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head className="w-[50px]"></Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredStudents.map((student) => (
              <Table.Row key={student.user.id}>
                <Table.Cell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      {student.user.image && (
                        <Avatar.Image
                          src={student.user.image}
                          alt={student.user.name}
                        />
                      )}
                      <Avatar.Fallback className="text-xs">
                        {getInitials(student.user.name)}
                      </Avatar.Fallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">
                        {student.user.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {student.user.email}
                      </div>
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center gap-3">
                    <SectionProgressBars
                      sectionProgress={student.sectionProgress}
                    />
                    <span className="text-sm font-medium w-10 text-right">
                      {student.progressPercent}%
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <span className="text-sm text-muted-foreground">
                    {student.lastActiveAt
                      ? formatRelativeTime(student.lastActiveAt)
                      : "Never"}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <StatusBadge status={student.status} />
                </Table.Cell>
                <Table.Cell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    title="Remove student"
                    onClick={() => onRemoveStudent(student.enrollmentId)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
            {isLoading && (
              <Table.Row>
                <Table.Cell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading students...
                </Table.Cell>
              </Table.Row>
            )}
            {!isLoading && filteredStudents.length === 0 && (
              <Table.Row>
                <Table.Cell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No students found
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </Card.Content>

      {/* Invite Student Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={(open) => {
        setInviteDialogOpen(open);
        if (!open) setInviteUserId("");
      }}>
        <Dialog.Content className="sm:max-w-[425px]">
          <Dialog.Header>
            <Dialog.Title className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Student
            </Dialog.Title>
            <Dialog.Description>
              Enroll a user in this course by entering their user ID.
            </Dialog.Description>
          </Dialog.Header>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (inviteUserId.trim()) {
              onInviteStudent(inviteUserId.trim());
              setInviteUserId("");
              setInviteDialogOpen(false);
            }
          }}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <FormLabel htmlFor="invite-user-id">User ID</FormLabel>
                <Input
                  id="invite-user-id"
                  placeholder="Enter user ID..."
                  value={inviteUserId}
                  onChange={(e) => setInviteUserId(e.target.value)}
                />
              </div>
            </div>
            <Dialog.Footer>
              <Button type="button" variant="outline" onClick={() => {
                setInviteDialogOpen(false);
                setInviteUserId("");
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={!inviteUserId.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                Enroll Student
              </Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog>
    </Card>
  );
}

// =============================================================================
// Settings Tab
// =============================================================================

function SettingsTab() {
  const { course } = useCourse();

  // RPC mutation atoms
  const updateCourse = useAtomSet(updateCourseAtom);
  const publishCourse = useAtomSet(publishCourseAtom);
  const archiveCourse = useAtomSet(archiveCourseAtom);

  // Controlled form state
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description ?? "");
  const [isPublished, setIsPublished] = useState(
    course.status === "published"
  );
  const [enrollmentOpen, setEnrollmentOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Update title and description
      await updateCourse({
        id: course.id as BrandedCourseId,
        input: {
          title,
          description: description || undefined,
        } as any,
      });

      // Handle publish/unpublish state change
      const wasPublished = course.status === "published";
      if (isPublished && !wasPublished) {
        await publishCourse(course.id as BrandedCourseId);
      } else if (!isPublished && wasPublished) {
        await updateCourse({
          id: course.id as BrandedCourseId,
          input: { status: "draft" } as any,
        });
      }

      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to archive this course? It will be hidden from all students."
    );
    if (!confirmed) return;

    setIsArchiving(true);
    try {
      await archiveCourse(course.id as BrandedCourseId);
      toast.success("Course archived successfully");
    } catch {
      toast.error("Failed to archive course. Please try again.");
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Course Visibility */}
      <Card>
        <Card.Header>
          <Card.Title className="text-base">Course Visibility</Card.Title>
          <Card.Description>
            Control who can see and access this course
          </Card.Description>
        </Card.Header>
        <Card.Content className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium text-sm">Published</div>
              <div className="text-xs text-muted-foreground">
                Make this course visible to students
              </div>
            </div>
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium text-sm">Open Enrollment</div>
              <div className="text-xs text-muted-foreground">
                Allow new students to enroll
              </div>
            </div>
            <Switch
              checked={enrollmentOpen}
              onCheckedChange={setEnrollmentOpen}
            />
          </div>
        </Card.Content>
      </Card>

      {/* Course Info */}
      <Card>
        <Card.Header>
          <Card.Title className="text-base">Course Information</Card.Title>
          <Card.Description>Basic details about your course</Card.Description>
        </Card.Header>
        <Card.Content className="space-y-4">
          <div className="space-y-2">
            <FormLabel>Course Title</FormLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <FormLabel>Description</FormLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </Card.Content>
        <Card.Footer>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </Card.Footer>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <Card.Header>
          <Card.Title className="text-base text-destructive">
            Danger Zone
          </Card.Title>
          <Card.Description>
            Irreversible actions for this course
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium text-sm">Archive Course</div>
              <div className="text-xs text-muted-foreground">
                Hide this course from all students
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleArchive}
              disabled={isArchiving}
            >
              {isArchiving ? "Archiving..." : "Archive"}
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}

// =============================================================================
// Section Progress Bars (for Students table)
// =============================================================================

function SectionProgressBars({
  sectionProgress,
}: {
  sectionProgress: SectionProgress[];
}) {
  return (
    <div className="flex items-end gap-1 h-6">
      {sectionProgress.map((section, index) => {
        const percent =
          section.total > 0 ? (section.completed / section.total) * 100 : 0;
        const sectionStyle = SECTION_STYLES[index] ?? SECTION_STYLES[0];
        const bgColor = sectionStyle?.bg ?? "bg-gray-500";
        const label = sectionStyle?.label ?? "Section";

        return (
          <div
            key={section.sectionId}
            className="relative w-3 h-full bg-muted rounded-sm overflow-hidden"
            title={`${label}: ${section.completed}/${section.total}`}
          >
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 transition-all",
                bgColor
              )}
              style={{ height: `${percent}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// Helpers
// =============================================================================

function StatusBadge({ status }: { status: StudentProgress["status"] }) {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-emerald-500 hover:bg-emerald-500/90">
          Completed
        </Badge>
      );
    case "in_progress":
      return <Badge variant="secondary">In Progress</Badge>;
    case "not_started":
      return <Badge variant="outline">Not Started</Badge>;
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
