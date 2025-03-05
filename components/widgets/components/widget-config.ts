export interface WidgetSize {
  width: number;
  height: number;
}

export interface WidgetConfig {
  label: string;
  defaultSize: WidgetSize;
  maxSize: WidgetSize;
}

export const WIDGET_CONFIGS: Record<string, WidgetConfig> = {
  "recent-courses": {
    label: "Recent Courses",
    defaultSize: { width: 3, height: 2 },
    maxSize: { width: 6, height: 4 },
  },
  "next-concept": {
    label: "Next Concept",
    defaultSize: { width: 2, height: 1 },
    maxSize: { width: 4, height: 2 },
  },
  "course-progress": {
    label: "Course Progress",
    defaultSize: { width: 2, height: 2 },
    maxSize: { width: 4, height: 4 },
  },
  chart: {
    label: "Chart",
    defaultSize: { width: 3, height: 2 },
    maxSize: { width: 8, height: 6 },
  },
  empty: {
    label: "Empty",
    defaultSize: { width: 1, height: 1 },
    maxSize: { width: 2, height: 2 },
  },
  calendar: {
    label: "Calendar",
    defaultSize: { width: 2, height: 2 },
    maxSize: { width: 4, height: 4 },
  },
} as const;

export type WidgetType = keyof typeof WIDGET_CONFIGS;
