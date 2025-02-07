import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui"
import { useWidgetStore } from "./widget-context"
import { BarChart } from "lucide-react"
import type { WidgetSize } from "./widget-registry"

interface WidgetProps {
  size: WidgetSize
  id: string
  compact?: boolean
}

const courseProgress = {
  totalCourses: 12,
  completedCourses: 5,
  inProgressCourses: 3,
  upcomingCourses: 4,
  percentComplete: 42
}

export function CourseProgressWidget({ size, id, compact = false }: WidgetProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Course Progress</CardTitle>
        <BarChart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className={compact ? "text-sm font-medium" : "text-base font-medium"}>
                {courseProgress.percentComplete}% Complete
              </p>
              <p className="text-xs text-muted-foreground">
                {courseProgress.completedCourses} of {courseProgress.totalCourses} courses
              </p>
            </div>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${courseProgress.percentComplete}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p className="font-medium">{courseProgress.completedCourses}</p>
              <p className="text-muted-foreground">Completed</p>
            </div>
            <div>
              <p className="font-medium">{courseProgress.inProgressCourses}</p>
              <p className="text-muted-foreground">In Progress</p>
            </div>
            <div>
              <p className="font-medium">{courseProgress.upcomingCourses}</p>
              <p className="text-muted-foreground">Upcoming</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
