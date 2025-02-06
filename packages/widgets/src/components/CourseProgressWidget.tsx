import React from 'react'
import { Progress } from '@repo/ui'


interface CourseProgressWidgetProps {
  progress: number
}

export function CourseProgressWidget({ progress }: CourseProgressWidgetProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Course Progress</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}
