import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useWidgetStore } from "./widget-context";
import { BarChart, BookOpen, Clock, Target } from "lucide-react";
import type { WidgetSize } from "./widget-registry";

interface WidgetProps {
  size: WidgetSize;
  id: string;
}

export function NextConceptWidget({ size, id }: WidgetProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Next Concept</CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">Color Theory</div>
        <p className="text-xs text-muted-foreground">
          Next up in Digital Art Fundamentals
        </p>
      </CardContent>
    </Card>
  );
}

export function CourseProgressWidget({ size, id }: WidgetProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Course Progress</CardTitle>
        <BookOpen className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <div className="flex-1">
            <div className="text-2xl font-bold">75%</div>
            <p className="text-xs text-muted-foreground">
              Digital Art Fundamentals
            </p>
          </div>
        </div>
        <Progress value={75} className="mt-2" />
      </CardContent>
    </Card>
  );
}
