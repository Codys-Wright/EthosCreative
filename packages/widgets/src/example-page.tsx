"use client"

import { ResizableCard } from "./components/ResizableCard"
import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import { SortableItem } from "./components/SortableItem"
import { cn } from "@repo/ui"
import { ChartWidget } from "./components/ChartWidget"

import { RecentCoursesWidget } from "./components/RecentCoursesWidget"
import {
  NextConceptWidget,
  CourseProgressWidget,
} from "./components/CourseWidgets"
import { useMediaQuery } from "@repo/ui"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuSeparator,
} from "@repo/ui"
import { WidgetPicker } from "./components/WidgetPicker"
import { SavePresetDialog } from "./components/SavePresetDialog"
import { useDashboardStore } from "./components/dashboard-store"
import type { DashboardItem } from "./components/dashboard-store"

export function WidgetExamplePage() {
  const { items, setItems, presets, activePresetId, savePreset, applyPreset } =
    useDashboardStore()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [isWidgetPickerOpen, setIsWidgetPickerOpen] = useState(false)
  const [isSavePresetOpen, setIsSavePresetOpen] = useState(false)

  // Media queries for different screen sizes
  const isLarge = useMediaQuery("(min-width: 1024px)") // lg breakpoint
  const isMedium = useMediaQuery("(min-width: 768px) and (max-width: 1023px)") // md breakpoint
  const isSmall = useMediaQuery("(max-width: 767px)") // sm breakpoint

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString())
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(
        (item) => item.id === active.id.toString()
      )
      const newIndex = items.findIndex((item) => item.id === over.id.toString())

      const newItems = arrayMove(items, oldIndex, newIndex)
      setItems(newItems)
    }

    setActiveId(null)
  }

  const handleResize = (id: string, colSpan: number, rowSpan: number) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, colSpan, rowSpan } : item
    )
    setItems(newItems)
  }

  const handleWidgetChange = (
    id: string,
    widgetType: string,
    size: { width: number; height: number }
  ) => {
    const newItems = items.map((item) =>
      item.id === id
        ? {
            ...item,
            type: widgetType,
            colSpan: size.width,
            rowSpan: size.height,
          }
        : item
    )
    setItems(newItems)
  }

  const handleVisibilityChange = (
    id: string,
    breakpoint: "large" | "medium" | "small",
    hidden: boolean
  ) => {
    const newItems = items.map((item) =>
      item.id === id
        ? {
            ...item,
            ...(breakpoint === "large" && { hideInLarge: hidden }),
            ...(breakpoint === "medium" && { hideInMedium: hidden }),
            ...(breakpoint === "small" && { hideInSmall: hidden }),
          }
        : item
    )
    setItems(newItems)
  }

  const handleResetVisibility = () => {
    const newItems = items.map((item) => ({
      ...item,
      hideInLarge: false,
      hideInMedium: false,
      hideInSmall: false,
    }))
    setItems(newItems)
  }

  const handleAddWidget = (
    widgetType: string,
    size: { width: number; height: number }
  ) => {
    const newId = (
      Math.max(...items.map((item) => parseInt(item.id)), 0) + 1
    ).toString()
    const newItems = [
      ...items,
      {
        id: newId,
        type: widgetType,
        colSpan: size.width,
        rowSpan: size.height,
      },
    ]
    setItems(newItems)
    setIsWidgetPickerOpen(false)
  }

  const handleSavePreset = (name: string, presetId?: string) => {
    savePreset(name, items, presetId)
  }

  const handleApplyPreset = (presetId: string) => {
    applyPreset(presetId)
  }

  const handleDeleteWidget = (id: string) => {
    const newItems = items.filter((item) => item.id !== id)
    setItems(newItems)
  }

  const renderWidgetContent = (item: DashboardItem) => {
    const size = { width: item.colSpan, height: item.rowSpan }

    switch (item.type) {
      case "recent-courses":
        return <RecentCoursesWidget size={size} id={item.id} />
      case "next-concept":
        return <NextConceptWidget size={size} id={item.id} />
      case "course-progress":
        return <CourseProgressWidget size={size} id={item.id} />
      case "chart":
        return (
          <ChartWidget
            width={item.colSpan}
            height={item.rowSpan}
            className="h-full"
          />
        )
      case "empty":
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Empty Widget
          </div>
        )
      case "calendar":
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Calendar Widget
          </div>
        )
      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {item.type} Widget
          </div>
        )
    }
  }

  const activeItem = activeId
    ? items.find((item) => item.id === activeId)
    : null

  // Filter out hidden items based on current breakpoint
  const visibleItems = items.filter((item) => {
    if (isLarge) return !item.hideInLarge
    if (isMedium) return !item.hideInMedium
    if (isSmall) return !item.hideInSmall
    return true
  })

  return (
    <div className="h-full overflow-auto p-8">
      <div className="mb-6 rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
        This page is in beta, and will soon be a place to view anything in one
        page!
      </div>
      <DndContext
        id="dashboard-dnd-context"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <ContextMenu>
          <ContextMenuTrigger>
            <div className="min-h-[calc(100vh-4rem)]">
              <SortableContext
                items={visibleItems.map((item) => item.id)}
                strategy={rectSortingStrategy}
              >
                <div 
                  className={cn(
                    "min-h-full grid auto-rows-[110px] gap-4 [grid-auto-flow:dense] pb-8 w-full",
                    "grid-cols-2",
                    "md:grid-cols-3",
                    "lg:grid-cols-4",
                    "xl:grid-cols-5",
                    "2xl:grid-cols-8",
                    "3xl:grid-cols-10",
                    "4xl:grid-cols-12",
                    "5xl:grid-cols-14",
                    "6xl:grid-cols-16",
                    "7xl:grid-cols-18",
                    "8xl:grid-cols-20",
                    "9xl:grid-cols-22",
                    "10xl:grid-cols-24"
                  )}
                  style={{ gridAutoColumns: "1fr" }}
                >
                  {visibleItems.map((item) => {
                    const itemClassName = cn(
                      item.colSpan && `col-span-${item.colSpan}`,
                      item.rowSpan && `row-span-${item.rowSpan}`
                    )

                    return (
                      <SortableItem
                        key={item.id}
                        id={item.id}
                        className={itemClassName}
                      >
                        <ResizableCard
                          id={item.id}
                          colSpan={item.colSpan}
                          rowSpan={item.rowSpan}
                          width={item.colSpan}
                          height={item.rowSpan}
                          onResize={(colSpan, rowSpan) =>
                            handleResize(item.id, colSpan, rowSpan)
                          }
                          onWidgetChange={(widgetType, size) =>
                            handleWidgetChange(item.id, widgetType, size)
                          }
                          onVisibilityChange={(breakpoint, hidden) =>
                            handleVisibilityChange(item.id, breakpoint, hidden)
                          }
                          onDelete={() => handleDeleteWidget(item.id)}
                          hideInLarge={item.hideInLarge}
                          hideInMedium={item.hideInMedium}
                          hideInSmall={item.hideInSmall}
                          type={item.type}
                          className="h-full"
                        >
                          {renderWidgetContent(item)}
                        </ResizableCard>
                      </SortableItem>
                    )
                  })}
                </div>
              </SortableContext>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onSelect={() => setIsWidgetPickerOpen(true)}>
              Add Widget
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger>Dashboard Presets</ContextMenuSubTrigger>
              <ContextMenuSubContent className="min-w-[220px]">
                {presets.length > 0 ? (
                  <>
                    {presets.map((preset) => (
                      <ContextMenuItem
                        key={preset.id}
                        onSelect={() => handleApplyPreset(preset.id)}
                        className="flex items-center justify-between"
                      >
                        <span>{preset.name}</span>
                        {activePresetId === preset.id && (
                          <span className="text-muted-foreground text-sm">
                            Active
                          </span>
                        )}
                      </ContextMenuItem>
                    ))}
                    <ContextMenuSeparator />
                  </>
                ) : (
                  <ContextMenuItem disabled className="text-muted-foreground">
                    No presets saved
                  </ContextMenuItem>
                )}
                <ContextMenuItem onSelect={() => setIsSavePresetOpen(true)}>
                  Save Current Layout
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuItem onSelect={handleResetVisibility}>
              Reset All Visibility
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        <WidgetPicker
          open={isWidgetPickerOpen}
          onOpenChange={setIsWidgetPickerOpen}
          onSelectWidget={handleAddWidget}
        />

        <SavePresetDialog
          open={isSavePresetOpen}
          onOpenChange={setIsSavePresetOpen}
          onSave={handleSavePreset}
          existingPresets={presets}
        />

        <DragOverlay adjustScale={false}>
          {activeId && activeItem ? (
            <ResizableCard
              id={activeItem.id}
              colSpan={activeItem.colSpan}
              rowSpan={activeItem.rowSpan}
              width={activeItem.colSpan}
              height={activeItem.rowSpan}
              className={cn(
                "h-full shadow-2xl opacity-50",
                activeItem.colSpan && `col-span-${activeItem.colSpan}`,
                activeItem.rowSpan && `row-span-${activeItem.rowSpan}`
              )}
            >
              {renderWidgetContent(activeItem)}
            </ResizableCard>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
