import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useWidgetStore } from "./widget-context"
import { Clock } from "lucide-react"
import type { WidgetSize } from "./widget-registry"

interface WidgetProps {
  size: WidgetSize
  id: string
  compact?: boolean
}

const courses = [
  {
    name: "Digital Art Fundamentals",
    progress: 75,
    lastAccessed: "2 hours ago",
  },
  {
    name: "Character Design",
    progress: 45,
    lastAccessed: "1 day ago",
  },
  {
    name: "Color Theory",
    progress: 20,
    lastAccessed: "3 days ago",
  },
]

export function RecentCoursesWidget({ size, id, compact = false }: WidgetProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Recent Courses</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100%-2rem)] pr-4">
          <div className="space-y-4">
            {courses.map((course, i) => (
              <div key={i} className="flex flex-col">
                <div className="flex justify-between">
              <div className="space-y-1">
                    <p className={compact ? "text-sm font-medium" : "text-base font-medium"}>
                      {course.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {course.lastAccessed}
                    </p>
              </div>
                  <div className="text-sm font-medium">{course.progress}%</div>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${course.progress}%` }}
                  />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      </CardContent>
    </Card>
  )
}
