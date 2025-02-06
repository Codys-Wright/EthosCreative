"use client"

import * as React from "react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  ContextMenuCheckboxItem,
} from "@repo/ui"
import { Card } from "@repo/ui"
import { cn } from "@repo/ui"
import { motion } from "framer-motion"
import { useMediaQuery } from "@repo/ui"
import { WidgetPicker } from "./WidgetPicker"

import {
  NextConceptWidget,
  CourseProgressWidget,
} from "./CourseWidgets"
import { RecentCoursesWidget } from "./RecentCoursesWidget"
import { useWidgetStore } from "./widget-store"


interface ResizableCardProps {
  className?: string
  colSpan?: number
  rowSpan?: number
  onResize?: (colSpan: number, rowSpan: number) => void
  onWidgetChange?: (
    widgetType: string,
    size: { width: number; height: number }
  ) => void
  onVisibilityChange?: (
    breakpoint: "large" | "medium" | "small",
    hidden: boolean
  ) => void
  onDelete?: () => void
  hideInLarge?: boolean
  hideInMedium?: boolean
  hideInSmall?: boolean
  children?: React.ReactNode
  type?: string
  width: number
  height: number
  id: string
}

export function ResizableCard({
  className,
  colSpan = 1,
  rowSpan = 1,
  onResize,
  onWidgetChange,
  onVisibilityChange,
  onDelete,
  hideInLarge: initialHideInLarge = false,
  hideInMedium: initialHideInMedium = false,
  hideInSmall: initialHideInSmall = false,
  type = "empty",
  id,
}: ResizableCardProps) {
  const setWidgetSize = useWidgetStore((state) => state.setWidgetSize)

  // Update widget size in store whenever it changes
  React.useEffect(() => {
    if (id) {
      const size = { width: colSpan, height: rowSpan }
      // console.log("Setting widget size in store:", { id, size })
      setWidgetSize(id, size)
    }
  }, [id, colSpan, rowSpan, setWidgetSize])

  // All hooks must be called before any conditional returns
  const [effectiveColSpan, setEffectiveColSpan] = React.useState(colSpan)
  const [hoveredSize, setHoveredSize] = React.useState<{
    col: number
    row: number
  } | null>(null)
  const [isWidgetPickerOpen, setIsWidgetPickerOpen] = React.useState(false)
  const [hideInLarge, setHideInLarge] = React.useState(initialHideInLarge)
  const [hideInMedium, setHideInMedium] = React.useState(initialHideInMedium)
  const [hideInSmall, setHideInSmall] = React.useState(initialHideInSmall)
  const isLarge = useMediaQuery("(min-width: 1024px)")
  const isMedium = useMediaQuery("(min-width: 768px)")
  const isSmall = useMediaQuery("(max-width: 767px)")

  // Check if we should render after all hooks are called
  const shouldRender = React.useMemo(() => {
    if (isLarge) return !hideInLarge
    if (isMedium) return !hideInMedium
    if (isSmall) return !hideInSmall
    return true
  }, [isLarge, isMedium, isSmall, hideInLarge, hideInMedium, hideInSmall])

  if (!shouldRender) return null

  const getWidgetComponent = () => {
    const size = { width: colSpan, height: rowSpan }
    // console.log("ResizableCard rendering widget:", { id, type, size })

    switch (type) {
      case "recent-courses":
        return <RecentCoursesWidget size={size} id={id} />
      case "next-concept":
        return <NextConceptWidget size={size} id={id} />
      case "course-progress":
        return <CourseProgressWidget size={size} id={id} />
      default:
        return (
          <div className="p-4">
            <h3 className="font-semibold">{type}</h3>
          </div>
        )
    }
  }

  const handleVisibilityChange = (
    breakpoint: "large" | "medium" | "small",
    hidden: boolean
  ) => {
    switch (breakpoint) {
      case "large":
        setHideInLarge(hidden)
        break
      case "medium":
        setHideInMedium(hidden)
        break
      case "small":
        setHideInSmall(hidden)
        break
    }
    onVisibilityChange?.(breakpoint, hidden)
  }

  const handleResize = (newColSpan: number, newRowSpan: number) => {
    setEffectiveColSpan(newColSpan)
    onResize?.(newColSpan, newRowSpan)
  }

  const handleWidgetSelect = (
    widgetType: string,
    size: { width: number; height: number }
  ) => {
    onWidgetChange?.(widgetType, size)
    setIsWidgetPickerOpen(false)
  }

  // Column span class mapping
  const colSpanClass: Record<number, string> = {
    1: "",
    2: "col-span-2",
    3: "col-span-3",
    4: "col-span-4",
    5: "col-span-5",
    6: "col-span-6",
  }

  const rowSpanClass: Record<number, string> = {
    1: "",
    2: "row-span-2",
    3: "row-span-3",
    4: "row-span-4",
    5: "row-span-5",
    6: "row-span-6",
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <motion.div
            layout
            initial={false}
            className={cn(
              "w-full h-full min-w-[100px]",
              colSpanClass[effectiveColSpan],
              rowSpanClass[rowSpan],
              className
            )}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn("relative h-full overflow-hidden", className)}
            >
              <Card className="h-full">{getWidgetComponent()}</Card>
            </motion.div>
          </motion.div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              Change Size{" "}
              {colSpan !== effectiveColSpan &&
                `(Limited to ${effectiveColSpan})`}
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-[280px] p-2">
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-6 gap-1">
                  {Array.from({ length: 36 }).map((_, index) => {
                    const row = Math.floor(index / 6) + 1
                    const col = (index % 6) + 1
                    const isSelected = col === colSpan && row === rowSpan
                    const isHovered =
                      hoveredSize &&
                      col <= hoveredSize.col &&
                      row <= hoveredSize.row
                    const isDirectlyHovered =
                      hoveredSize &&
                      col === hoveredSize.col &&
                      row === hoveredSize.row

                    return (
                      <ContextMenuItem
                        key={index}
                        className={cn(
                          "w-full p-0 m-0 focus:bg-transparent relative",
                          "before:content-[''] before:pt-[100%] before:block",
                          "after:absolute after:inset-0 after:rounded-sm after:transition-all after:duration-150",
                          isSelected
                            ? cn(
                                "after:bg-primary",
                                isHovered
                                  ? "after:brightness-110"
                                  : "hover:after:brightness-110"
                              )
                            : "after:bg-muted hover:after:bg-primary/50",
                          !isSelected && isHovered && "after:bg-primary/50",
                          isDirectlyHovered && "after:scale-110 after:z-10"
                        )}
                        onClick={() => {
                          handleResize(col, row)
                        }}
                        onMouseEnter={() => setHoveredSize({ col, row })}
                        onMouseLeave={() => setHoveredSize(null)}
                      />
                    )
                  })}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {hoveredSize
                    ? `${hoveredSize.col} × ${hoveredSize.row}`
                    : "Select size"}
                </div>
              </div>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuItem onClick={() => setIsWidgetPickerOpen(true)}>
            Change Widget
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuSub>
            <ContextMenuSubTrigger>Visibility</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuCheckboxItem
                checked={hideInLarge}
                onCheckedChange={(checked) =>
                  handleVisibilityChange("large", checked)
                }
              >
                Hide In Large
              </ContextMenuCheckboxItem>
              <ContextMenuCheckboxItem
                checked={hideInMedium}
                onCheckedChange={(checked) =>
                  handleVisibilityChange("medium", checked)
                }
              >
                Hide In Medium
              </ContextMenuCheckboxItem>
              <ContextMenuCheckboxItem
                checked={hideInSmall}
                onCheckedChange={(checked) =>
                  handleVisibilityChange("small", checked)
                }
              >
                Hide In Small
              </ContextMenuCheckboxItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => {
              handleResize(1, 1)
            }}
          >
            Reset Size
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={onDelete}
            className="text-red-600 focus:text-red-600 focus:bg-red-100"
          >
            Delete Widget
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <WidgetPicker
        open={isWidgetPickerOpen}
        onOpenChange={setIsWidgetPickerOpen}
        onSelectWidget={handleWidgetSelect}
      />
    </>
  )
}
