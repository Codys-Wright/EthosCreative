"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  ScrollArea,
  Input,
  cn,
} from "@repo/ui"
import { Search } from "lucide-react"
import { useWidgets } from "./widget-context"
import { getWidgetsByCategory, widgetCategories } from "./widget-registry"
import type { WidgetDefinition, WidgetCategory } from "./widget-registry"

interface WidgetPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectWidget: (type: string, size: { width: number; height: number }) => void
}

export function WidgetPicker({
  open,
  onOpenChange,
  onSelectWidget,
}: WidgetPickerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { getWidget } = useWidgets()
  const allWidgets = getWidgetsByCategory()

  // Filter widgets based on search query
  const filteredCategories = Object.entries(allWidgets).reduce(
    (acc, [key, widgets]) => {
      const filteredWidgets = widgets.filter(
        (widget) =>
          widget.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          widget.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      if (filteredWidgets.length > 0) {
        acc[key] = filteredWidgets
      }
      return acc
    },
    {} as Record<string, Array<WidgetDefinition<unknown> & { type: string }>>
  )

  const displayCategories = searchQuery ? filteredCategories : allWidgets
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
              onChange={(e) => setSearchQuery(e.target.value)}
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

                {Object.entries(currentCategory).map(([key, widgets]) => {
                  const category = widgetCategories[key]
                  if (!category || !widgets) return null

                  return (
                    <div key={key}>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        {category.icon && <category.icon className="h-4 w-4" />}
                        {category.name}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {widgets.map((widget) => (
                          <button
                            key={widget.id}
                            onClick={() => onSelectWidget(widget.type, widget.defaultSize)}
                            className="group rounded-lg border p-4 hover:border-primary hover:bg-accent/50 transition-colors text-left"
                          >
                            <h4 className="font-medium group-hover:text-primary">
                              {widget.label}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {widget.description}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
