import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWidgetStore } from "./widget-context"
import { ArrowRight } from "lucide-react"
import type { WidgetSize } from "./widget-registry"

interface WidgetProps {
  size: WidgetSize
  id: string
  compact?: boolean
}

const nextConcept = {
  name: "Color Theory Basics",
  description: "Learn about color wheels, harmonies, and their psychological impact",
  duration: "25 min",
  category: "Art Fundamentals"
}

export function NextConceptWidget({ size, id, compact = false }: WidgetProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Next Concept</CardTitle>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h3 className={compact ? "text-sm font-medium" : "text-base font-medium"}>
            {nextConcept.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {nextConcept.description}
          </p>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{nextConcept.category}</span>
            <span>{nextConcept.duration}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
