import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { GraduationCap, BarChart, ArrowRight, BookOpen, Clock, Target, LayoutDashboard } from "lucide-react"

export interface WidgetSize {
  width: number
  height: number
}

export interface WidgetBreakpoint {
  minWidth?: number  // in rem
  maxWidth?: number  // in rem
  minHeight?: number // in rem
  maxHeight?: number // in rem
}

export interface WidgetCategory {
  name: string
  icon: LucideIcon
}

export interface WidgetDefinition<TProps = unknown> {
  id: string
  label: string
  description: string
  category: "courses" | "progress" | "analytics" | "general"
  defaultSize: WidgetSize
  maxSize: WidgetSize
  type?: string
  icon?: LucideIcon
  // Define different views based on breakpoints
  views: {
    breakpoint: WidgetBreakpoint
    component: (props: TProps & { size: WidgetSize; id: string }) => ReactNode
  }[]
  // Default view if no breakpoints match
  defaultView: (props: TProps & { size: WidgetSize; id: string }) => ReactNode
}

export const widgetCategories: Record<string, WidgetCategory> = {
  courses: {
    name: "My Courses",
    icon: GraduationCap,
  },
  progress: {
    name: "Progress",
    icon: BarChart,
  },
  analytics: {
    name: "Analytics",
    icon: BarChart,
  },
  general: {
    name: "General",
    icon: ArrowRight,
  },
}

const registry = new Map<string, WidgetDefinition<unknown>>()

export function registerWidget<TProps>(
  type: string,
  definition: WidgetDefinition<TProps>
) {
  registry.set(type, definition as WidgetDefinition<unknown>)
}

export function getWidget(type: string): WidgetDefinition<unknown> | undefined {
  return registry.get(type)
}

// Example widget registration
import { RecentCoursesWidget } from "./RecentCoursesWidget"
import { NextConceptWidget, CourseProgressWidget } from "./CourseWidgets"

registerWidget("recent-courses", {
  id: "recent-courses",
  label: "Recent Courses",
  description: "View and resume your recently accessed courses",
  category: "courses",
  defaultSize: { width: 3, height: 2 },
  maxSize: { width: 6, height: 4 },
  icon: GraduationCap,
  views: [
    {
      // Large view
      breakpoint: { minWidth: 64 }, // 64rem = 1024px
      component: RecentCoursesWidget,
    },
    {
      // Medium view
      breakpoint: { minWidth: 48, maxWidth: 64 }, // 768px - 1024px
      component: ({ size, id }) => (
        <RecentCoursesWidget size={size} id={id} compact />
      ),
    }
  ],
  defaultView: RecentCoursesWidget,
})

registerWidget("next-concept", {
  id: "next-concept",
  label: "Next Concept",
  description: "See what's next in your learning journey",
  category: "courses",
  defaultSize: { width: 2, height: 1 },
  maxSize: { width: 4, height: 2 },
  icon: ArrowRight,
  views: [
    {
      breakpoint: { minWidth: 48 }, // 768px and up
      component: NextConceptWidget,
    }
  ],
  defaultView: NextConceptWidget,
})

registerWidget("course-progress", {
  id: "course-progress",
  label: "Course Progress",
  description: "Track your overall course completion and achievements",
  category: "progress",
  defaultSize: { width: 2, height: 2 },
  maxSize: { width: 4, height: 4 },
  icon: BarChart,
  views: [
    {
      breakpoint: { minWidth: 48 }, // 768px and up
      component: CourseProgressWidget,
    }
  ],
  defaultView: CourseProgressWidget,
})

// Add a new wide dashboard widget
registerWidget("dashboard-overview", {
  id: "dashboard-overview",
  label: "Dashboard Overview",
  description: "A comprehensive overview of your learning progress and upcoming content",
  category: "general",
  defaultSize: { width: 8, height: 2 },
  maxSize: { width: 12, height: 4 },
  icon: LayoutDashboard,
  views: [
    {
      breakpoint: { minWidth: 64 },
      component: ({ size, id }) => (
        <div className="grid h-full gap-4" style={{ 
          gridTemplateColumns: `repeat(${size.width}, 1fr)`,
          gridTemplateRows: `repeat(${size.height}, 1fr)`
        }}>
          <div className="col-span-4 bg-muted/50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Course Progress</h3>
            <div className="text-3xl font-bold">75%</div>
            <p className="text-sm text-muted-foreground">Overall completion</p>
          </div>
          <div className="col-span-4 bg-muted/50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Next Up</h3>
            <p className="text-lg">Color Theory Basics</p>
            <p className="text-sm text-muted-foreground">25 min remaining</p>
          </div>
          <div className="col-span-4 bg-muted/50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Recent Activity</h3>
            <p className="text-lg">Completed: Perspective Drawing</p>
            <p className="text-sm text-muted-foreground">2 hours ago</p>
          </div>
        </div>
      ),
    }
  ],
  defaultView: ({ size, id }) => (
    <div className="p-4">
      <h3 className="font-medium">Dashboard Overview</h3>
      <p className="text-sm text-muted-foreground">Resize for more details</p>
    </div>
  ),
})

// Helper to get all registered widget types
export function getAvailableWidgetTypes(): string[] {
  return Array.from(registry.keys())
}

// Helper to get widgets by category
export function getWidgetsByCategory(): Record<string, Array<WidgetDefinition<unknown> & { type: string }>> {
  const categories: Record<string, Array<WidgetDefinition<unknown> & { type: string }>> = {}
  
  for (const [type, widget] of registry.entries()) {
    const category = widget.category
    if (!categories[category]) {
      categories[category] = []
    }
    categories[category].push({
      ...widget,
      type
    })
  }
  
  return categories
}

// Helper to convert rem to pixels
export function remToPixels(rem: number): number {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
}

// Helper to check if a breakpoint matches current size
export function matchesBreakpoint(breakpoint: WidgetBreakpoint): boolean {
  const { minWidth, maxWidth, minHeight, maxHeight } = breakpoint
  
  if (typeof window === "undefined") return false
  
  const width = window.innerWidth / remToPixels(1)
  const height = window.innerHeight / remToPixels(1)
  
  if (minWidth && width < minWidth) return false
  if (maxWidth && width > maxWidth) return false
  if (minHeight && height < minHeight) return false
  if (maxHeight && height > maxHeight) return false
  
  return true
} 