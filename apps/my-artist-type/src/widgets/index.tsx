import type { WidgetDefinition, WidgetSize } from "@repo/ui";
import {
  RecentCoursesWidget,
  NextConceptWidget,
  CourseProgressWidget,
} from "@repo/ui";
import {
  LayoutDashboard,
  GraduationCap,
  ArrowRight,
  BarChart,
} from "lucide-react";

interface WidgetProps {
  size: WidgetSize;
  id: string;
}

export const dashboardWidgets: Record<string, WidgetDefinition<WidgetProps>> = {
  "recent-courses": {
    id: "recent-courses",
    label: "Recent Courses",
    description: "View and resume your recently accessed courses",
    category: "courses",
    icon: GraduationCap,
    defaultSize: { width: 3, height: 2 },
    maxSize: { width: 6, height: 4 },
    views: [
      {
        breakpoint: { minWidth: 64 }, // Large screens
        component: RecentCoursesWidget,
      },
      {
        breakpoint: { minWidth: 48, maxWidth: 64 }, // Medium screens
        component: ({ size, id }) => (
          <RecentCoursesWidget size={size} id={id} compact />
        ),
      },
    ],
    defaultView: RecentCoursesWidget,
  },
  "next-concept": {
    id: "next-concept",
    label: "Next Concept",
    description: "See what's next in your learning journey",
    category: "courses",
    icon: ArrowRight,
    defaultSize: { width: 2, height: 1 },
    maxSize: { width: 4, height: 2 },
    views: [
      {
        breakpoint: { minWidth: 48 },
        component: NextConceptWidget,
      },
    ],
    defaultView: NextConceptWidget,
  },
  "course-progress": {
    id: "course-progress",
    label: "Course Progress",
    description: "Track your overall course completion and achievements",
    category: "progress",
    icon: BarChart,
    defaultSize: { width: 2, height: 2 },
    maxSize: { width: 4, height: 4 },
    views: [
      {
        breakpoint: { minWidth: 48 },
        component: CourseProgressWidget,
      },
    ],
    defaultView: CourseProgressWidget,
  },
  "dashboard-overview": {
    id: "dashboard-overview",
    label: "Dashboard Overview",
    description:
      "A comprehensive overview of your learning progress and upcoming content",
    category: "general",
    defaultSize: { width: 8, height: 2 },
    maxSize: { width: 12, height: 4 },
    icon: LayoutDashboard,
    views: [
      {
        breakpoint: { minWidth: 64 },
        component: ({ size, id }) => (
          <div
            className="grid h-full gap-4"
            style={{
              gridTemplateColumns: `repeat(${size.width}, 1fr)`,
              gridTemplateRows: `repeat(${size.height}, 1fr)`,
            }}
          >
            <div className="bg-muted/50 col-span-4 rounded-lg p-4">
              <h3 className="mb-2 font-medium">Course Progress</h3>
              <div className="text-3xl font-bold">75%</div>
              <p className="text-muted-foreground text-sm">
                Overall completion
              </p>
            </div>
            <div className="bg-muted/50 col-span-4 rounded-lg p-4">
              <h3 className="mb-2 font-medium">Next Up</h3>
              <p className="text-lg">Color Theory Basics</p>
              <p className="text-muted-foreground text-sm">25 min remaining</p>
            </div>
            <div className="bg-muted/50 col-span-4 rounded-lg p-4">
              <h3 className="mb-2 font-medium">Recent Activity</h3>
              <p className="text-lg">Completed: Perspective Drawing</p>
              <p className="text-muted-foreground text-sm">2 hours ago</p>
            </div>
          </div>
        ),
      },
    ],
    defaultView: ({ size, id }) => (
      <div className="p-4">
        <h3 className="font-medium">Dashboard Overview</h3>
        <p className="text-muted-foreground text-sm">Resize for more details</p>
      </div>
    ),
  },
  welcome: {
    id: "welcome",
    label: "Welcome",
    description: "Welcome message for new users",
    category: "general",
    defaultSize: { width: 2, height: 1 },
    maxSize: { width: 4, height: 2 },
    views: [
      {
        breakpoint: { minWidth: 64 },
        component: ({ size, id }) => (
          <div className="flex h-full items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
            <h2 className="text-xl font-bold">Welcome to My Artist Type!</h2>
          </div>
        ),
      },
    ],
    defaultView: ({ size, id }) => (
      <div className="flex h-full items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
        <h2 className="text-lg font-bold">Welcome!</h2>
      </div>
    ),
  },
  "quick-actions": {
    id: "quick-actions",
    label: "Quick Actions",
    description: "Quick access to common actions and settings",
    category: "general",
    defaultSize: { width: 2, height: 2 },
    maxSize: { width: 3, height: 3 },
    views: [
      {
        breakpoint: { minWidth: 48 },
        component: ({ size, id }) => (
          <div className="flex flex-col gap-2 p-4">
            <h3 className="font-semibold">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="bg-muted hover:bg-muted/80 rounded-lg p-2">
                New Course
              </button>
              <button className="bg-muted hover:bg-muted/80 rounded-lg p-2">
                Messages
              </button>
              <button className="bg-muted hover:bg-muted/80 rounded-lg p-2">
                Profile
              </button>
              <button className="bg-muted hover:bg-muted/80 rounded-lg p-2">
                Settings
              </button>
            </div>
          </div>
        ),
      },
    ],
    defaultView: ({ size, id }) => (
      <div className="p-4">
        <h3 className="font-semibold">Quick Actions</h3>
        <div className="mt-2 space-y-2">
          <button className="bg-muted hover:bg-muted/80 w-full rounded-lg p-2">
            Menu
          </button>
        </div>
      </div>
    ),
  },
};
