import { Card, CardContent } from "@repo/ui"
import { Progress } from "@repo/ui"


import { useWidgetStore } from "./widget-store"
import { BarChart, BookOpen, Clock, Target } from "lucide-react"


interface WidgetProps {
  size?: {
    width: number
    height: number
  }
  id?: string
}

const NotImplemented = ({ size }: { size: string }) => (
  <div className="flex items-center justify-center h-full text-muted-foreground">
    Size {size} not implemented
  </div>
)

export function NextConceptWidget({ size, id }: WidgetProps) {
  const widgetSize = useWidgetStore((state) => state.getWidgetSize(id ?? ""))
  const actualSize = id ? widgetSize : size
  const width = actualSize?.width || 1
  const height = actualSize?.height || 1

  const NextConcept1x1 = () => (
    <div className="flex items-center gap-2">
      <Target className="w-5 h-5" />
      <div className="font-medium">Next Up {`<1x1>`}</div>
    </div>
  )

  const NextConcept2x1 = () => (
    <div className="flex justify-between items-center">
      <div className="space-y-1">
        <div className="font-medium">Functions & Methods {`<2x1>`}</div>
        <div className="text-sm text-muted-foreground">20 min</div>
      </div>
      <Clock className="w-5 h-5" />
    </div>
  )

  const NextConcept2x2 = () => (
    <div className="space-y-3">
      <div className="font-medium flex items-center gap-2">
        <Target className="w-5 h-5" />
        Next Concept {`<2x2>`}
      </div>
      <div className="space-y-2">
        <div className="font-medium">Functions & Methods</div>
        <div className="text-sm text-muted-foreground">
          Learn about JavaScript functions, methods, and their practical
          applications in web development.
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4" />
          <span>20 min</span>
        </div>
      </div>
    </div>
  )

  const NextConcept3x2 = () => (
    <div className="space-y-3">
      <div className="font-medium flex items-center gap-2">
        <Target className="w-5 h-5" />
        Next Concept {`<3x2>`}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-2">
          <div className="font-medium">Functions & Methods</div>
          <div className="text-sm text-muted-foreground">
            Learn about JavaScript functions, methods, and their practical
            applications in web development.
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>20 min</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Chapter 4</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="font-medium">Prerequisites</div>
          <div className="text-sm text-muted-foreground">
            <div>• Variables</div>
            <div>• Data Types</div>
            <div>• Control Flow</div>
          </div>
        </div>
      </div>
    </div>
  )

  const getContentForSize = () => {
    const size = `${width}x${height}`

    // Single Row (Height = 1)
    if (height === 1) {
      if (width === 1) return <NextConcept1x1 />
      if (width === 2) return <NextConcept2x1 />
      if (width === 3) return <NotImplemented size={size} />
      if (width === 4) return <NotImplemented size={size} />
      if (width === 5) return <NotImplemented size={size} />
      if (width === 6) return <NotImplemented size={size} />
    }

    // Two Rows (Height = 2)
    if (height === 2) {
      if (width === 1) return <NotImplemented size={size} />
      if (width === 2) return <NextConcept2x2 />
      if (width === 3) return <NextConcept3x2 />
      if (width === 4) return <NotImplemented size={size} />
      if (width === 5) return <NotImplemented size={size} />
      if (width === 6) return <NotImplemented size={size} />
    }

    // Three Rows (Height = 3)
    if (height === 3) {
      if (width === 1) return <NotImplemented size={size} />
      if (width === 2) return <NotImplemented size={size} />
      if (width === 3) return <NotImplemented size={size} />
      if (width === 4) return <NotImplemented size={size} />
      if (width === 5) return <NotImplemented size={size} />
      if (width === 6) return <NotImplemented size={size} />
    }

    // Four Rows (Height = 4)
    if (height === 4) {
      if (width === 1) return <NotImplemented size={size} />
      if (width === 2) return <NotImplemented size={size} />
      if (width === 3) return <NotImplemented size={size} />
      if (width === 4) return <NotImplemented size={size} />
      if (width === 5) return <NotImplemented size={size} />
      if (width === 6) return <NotImplemented size={size} />
    }

    // Five Rows (Height = 5)
    if (height === 5) {
      if (width === 1) return <NotImplemented size={size} />
      if (width === 2) return <NotImplemented size={size} />
      if (width === 3) return <NotImplemented size={size} />
      if (width === 4) return <NotImplemented size={size} />
      if (width === 5) return <NotImplemented size={size} />
      if (width === 6) return <NotImplemented size={size} />
    }

    // Six Rows (Height = 6)
    if (height === 6) {
      if (width === 1) return <NotImplemented size={size} />
      if (width === 2) return <NotImplemented size={size} />
      if (width === 3) return <NotImplemented size={size} />
      if (width === 4) return <NotImplemented size={size} />
      if (width === 5) return <NotImplemented size={size} />
      if (width === 6) return <NotImplemented size={size} />
    }

    return <NotImplemented size={size} />
  }

  return (
    <Card className="h-full">
      <CardContent className="p-4">{getContentForSize()}</CardContent>
    </Card>
  )
}

export function CourseProgressWidget({ size, id }: WidgetProps) {
  const widgetSize = useWidgetStore((state) => state.getWidgetSize(id ?? ""))
  const actualSize = id ? widgetSize : size
  const width = actualSize?.width || 1
  const height = actualSize?.height || 1

  const CourseProgress1x1 = () => (
    <div className="flex items-center gap-2">
      <BarChart className="w-5 h-5" />
      <div className="font-medium">Progress {`<1x1>`}</div>
    </div>
  )

  const CourseProgress2x1 = () => (
    <div className="space-y-2">
      <div className="font-medium flex items-center gap-2">
        <BarChart className="w-5 h-5" />
        Course Progress {`<2x1>`}
      </div>
      <Progress value={65} />
      <div className="text-sm text-muted-foreground text-right">65%</div>
    </div>
  )

  const CourseProgress2x2 = () => (
    <div className="space-y-3">
      <div className="font-medium flex items-center gap-2">
        <BarChart className="w-5 h-5" />
        Course Progress {`<2x2>`}
      </div>
      <Progress value={65} />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Completed</div>
          <div className="font-medium">13 lessons</div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Remaining</div>
          <div className="font-medium">7 lessons</div>
        </div>
      </div>
    </div>
  )

  const CourseProgress3x2 = () => (
    <div className="space-y-3">
      <div className="font-medium flex items-center gap-2">
        <BarChart className="w-5 h-5" />
        Course Progress {`<3x2>`}
      </div>
      <Progress value={65} />
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Completed</div>
          <div className="font-medium">13 lessons</div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Time Spent</div>
          <div className="font-medium">4.5 hours</div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Avg. Score</div>
          <div className="font-medium">92%</div>
        </div>
      </div>
    </div>
  )

  const getContentForSize = () => {
    const size = `${width}x${height}`

    // Single Row (Height = 1)
    if (height === 1) {
      if (width === 1) return <CourseProgress1x1 />
      if (width === 2) return <CourseProgress2x1 />
      if (width === 3) return <NotImplemented size={size} />
      if (width === 4) return <NotImplemented size={size} />
      if (width === 5) return <NotImplemented size={size} />
      if (width === 6) return <NotImplemented size={size} />
    }

    // Two Rows (Height = 2)
    if (height === 2) {
      if (width === 1) return <NotImplemented size={size} />
      if (width === 2) return <CourseProgress2x2 />
      if (width === 3) return <CourseProgress3x2 />
      if (width === 4) return <NotImplemented size={size} />
      if (width === 5) return <NotImplemented size={size} />
      if (width === 6) return <NotImplemented size={size} />
    }

    // Three Rows (Height = 3)
    if (height === 3) {
      if (width === 1) return <NotImplemented size={size} />
      if (width === 2) return <NotImplemented size={size} />
      if (width === 3) return <NotImplemented size={size} />
      if (width === 4) return <NotImplemented size={size} />
      if (width === 5) return <NotImplemented size={size} />
      if (width === 6) return <NotImplemented size={size} />
    }

    // Four Rows (Height = 4)
    if (height === 4) {
      if (width === 1) return <NotImplemented size={size} />
      if (width === 2) return <NotImplemented size={size} />
      if (width === 3) return <NotImplemented size={size} />
      if (width === 4) return <NotImplemented size={size} />
      if (width === 5) return <NotImplemented size={size} />
      if (width === 6) return <NotImplemented size={size} />
    }

    // Five Rows (Height = 5)
    if (height === 5) {
      if (width === 1) return <NotImplemented size={size} />
      if (width === 2) return <NotImplemented size={size} />
      if (width === 3) return <NotImplemented size={size} />
      if (width === 4) return <NotImplemented size={size} />
      if (width === 5) return <NotImplemented size={size} />
      if (width === 6) return <NotImplemented size={size} />
    }

    // Six Rows (Height = 6)
    if (height === 6) {
      if (width === 1) return <NotImplemented size={size} />
      if (width === 2) return <NotImplemented size={size} />
      if (width === 3) return <NotImplemented size={size} />
      if (width === 4) return <NotImplemented size={size} />
      if (width === 5) return <NotImplemented size={size} />
      if (width === 6) return <NotImplemented size={size} />
    }

    return <NotImplemented size={size} />
  }

  return (
    <Card className="h-full">
      <CardContent className="p-4">{getContentForSize()}</CardContent>
    </Card>
  )
}
