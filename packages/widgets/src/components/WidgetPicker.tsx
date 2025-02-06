"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  ScrollArea,
  Input,
  cn
} from "@repo/ui"
import { Search, GraduationCap, ShieldCheck, Wrench } from "lucide-react"

interface Widget {
  id: string
  name: string
  description: string
  type: string
  size: { width: number; height: number }
}

interface Category {
  name: string
  icon: React.ComponentType<{ className?: string }>
  widgets: Widget[]
}

interface WidgetPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectWidget: (
    widgetType: string,
    size: { width: number; height: number }
  ) => void
}

// Define widget categories and their widgets
const widgetCategories: Record<string, Category> = {
  courses: {
    name: "My Courses",
    icon: GraduationCap,
    widgets: [
      {
        id: "recent-courses",
        name: "Recent Courses",
        description: "Shows the recent courses you've interacted with",
        type: "recent-courses",
        size: { width: 2, height: 2 },
      },
      {
        id: "next-concept",
        name: "Next Concept",
        description: "Shows your next lesson in the current course curriculum",
        type: "next-concept",
        size: { width: 2, height: 1 },
      },
      {
        id: "course-progress",
        name: "Course Progress",
        description: "Shows your overall progress in the current course",
        type: "course-progress",
        size: { width: 2, height: 1 },
      },
    ],
  },
  admin: {
    name: "Admin",
    icon: ShieldCheck,
    widgets: [
      {
        id: "user-stats",
        name: "User Statistics",
        description: "View user engagement and activity metrics",
        type: "user-stats",
        size: { width: 2, height: 2 },
      },
      {
        id: "system-health",
        name: "System Health",
        description: "Monitor system performance and health metrics",
        type: "system-health",
        size: { width: 2, height: 1 },
      },
    ],
  },
  developer: {
    name: "Developer",
    icon: Wrench,
    widgets: [
      {
        id: "api-metrics",
        name: "API Metrics",
        description: "Monitor API performance and usage statistics",
        type: "api-metrics",
        size: { width: 2, height: 2 },
      },
      {
        id: "error-logs",
        name: "Error Logs",
        description: "View recent system errors and warnings",
        type: "error-logs",
        size: { width: 2, height: 2 },
      },
    ],
  },
}

export function WidgetPicker({
  open,
  onOpenChange,
  onSelectWidget,
}: WidgetPickerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredCategories = Object.entries(widgetCategories).reduce(
    (acc, [key, category]) => {
      const filteredWidgets = category.widgets.filter(
        (widget) =>
          widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          widget.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      if (filteredWidgets.length > 0) {
        acc[key] = { ...category, widgets: filteredWidgets }
      }
      return acc
    },
    {} as Record<string, Category>
  )

  const displayCategories = searchQuery
    ? filteredCategories
    : widgetCategories
  const currentCategory = selectedCategory
    ? { [selectedCategory]: displayCategories[selectedCategory] }
    : displayCategories

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%] duration-200",
          "w-full h-[80vh] max-w-7xl",
          "flex flex-col gap-0 p-0 overflow-hidden",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
          "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          "sm:rounded-lg border bg-background"
        )}
      >
        <DialogHeader className="p-6 pb-4 flex-none">
          <DialogTitle className="text-2xl">Add Widget</DialogTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search widgets..."
              className="pl-8"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
          </div>
        </DialogHeader>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Category Sidebar */}
          <div className="w-48 border-r flex-none overflow-y-auto">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors w-full",
                !selectedCategory && "bg-accent"
              )}
            >
              <Search className="h-4 w-4" />
              All Widgets
            </button>
            {Object.entries(widgetCategories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors w-full",
                  selectedCategory === key && "bg-accent"
                )}
              >
                {category.icon && <category.icon className="h-4 w-4" />}
                {category.name}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <ScrollArea className="flex-1">
              <div className="space-y-6 p-6">
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-muted-foreground">
                    More widgets are being added soon! Stay tuned for updates.
                  </p>
                </div>

                {Object.entries(currentCategory).map(([key, category]) => (
                  <div key={key}>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      {category?.icon && <category.icon className="h-4 w-4" />}
                      {category?.name}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {category?.widgets.map((widget) => (
                        <button
                          key={widget.id}
                          onClick={() => onSelectWidget(widget.id, widget.size)}
                          className="group rounded-lg border p-4 hover:border-primary hover:bg-accent/50 transition-colors text-left"
                        >
                          <h4 className="font-medium group-hover:text-primary">
                            {widget.name}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {widget.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
