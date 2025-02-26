"use client";

import * as React from "react";
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
} from "@/components/ui/context-menu";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import { WidgetPicker } from "./WidgetPicker";

import { NextConceptWidget, CourseProgressWidget } from "./CourseWidgets";
import { RecentCoursesWidget } from "./RecentCoursesWidget";
import { useWidgets } from "./widget-context";
import { WIDGET_CONFIGS, type WidgetType } from "./widget-config";
import { getWidget, matchesBreakpoint } from "./widget-registry";

interface ResizableCardProps {
  className?: string;
  colSpan?: number;
  rowSpan?: number;
  onResize?: (colSpan: number, rowSpan: number) => void;
  onWidgetChange?: (
    widgetType: string,
    size: { width: number; height: number },
  ) => void;
  onVisibilityChange?: (
    breakpoint: "large" | "medium" | "small",
    hidden: boolean,
  ) => void;
  onDelete?: () => void;
  hideInLarge?: boolean;
  hideInMedium?: boolean;
  hideInSmall?: boolean;
  children?: React.ReactNode;
  type?: string;
  width: number;
  height: number;
  id: string;
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
  children,
  type = "empty",
  id,
}: ResizableCardProps) {
  const { useStore, getWidget } = useWidgets();
  const store = useStore();

  // Update widget size in store whenever it changes
  React.useEffect(() => {
    if (id) {
      const size = { width: colSpan, height: rowSpan };
      store.setState((state) => ({
        widgetSizes: {
          ...state.widgetSizes,
          [id]: size,
        },
      }));
    }
  }, [id, colSpan, rowSpan, store]);

  // All hooks must be called before any conditional returns
  const [effectiveColSpan, setEffectiveColSpan] = React.useState(colSpan);
  const [hoveredSize, setHoveredSize] = React.useState<{
    col: number;
    row: number;
  } | null>(null);
  const [isWidgetPickerOpen, setIsWidgetPickerOpen] = React.useState(false);
  const [hideInLarge, setHideInLarge] = React.useState(initialHideInLarge);
  const [hideInMedium, setHideInMedium] = React.useState(initialHideInMedium);
  const [hideInSmall, setHideInSmall] = React.useState(initialHideInSmall);
  const isLarge = useMediaQuery("(min-width: 1024px)");
  const isMedium = useMediaQuery("(min-width: 768px)");
  const isSmall = useMediaQuery("(max-width: 767px)");

  // Check if we should render after all hooks are called
  const shouldRender = React.useMemo(() => {
    if (isLarge) return !hideInLarge;
    if (isMedium) return !hideInMedium;
    if (isSmall) return !hideInSmall;
    return true;
  }, [isLarge, isMedium, isSmall, hideInLarge, hideInMedium, hideInSmall]);

  if (!shouldRender) return null;

  const getWidgetComponent = () => {
    const size = { width: colSpan, height: rowSpan };
    const widgetDef = getWidget(type);

    if (!widgetDef) {
      return (
        <div className="p-4">
          <h3 className="font-semibold">Unknown Widget: {type}</h3>
        </div>
      );
    }

    // Find the first matching breakpoint view
    const matchingView = widgetDef.views.find((view) =>
      matchesBreakpoint(view.breakpoint),
    );

    // Use matching view or fall back to default
    const ViewComponent = matchingView?.component ?? widgetDef.defaultView;
    return <ViewComponent size={size} id={id} />;
  };

  const handleVisibilityChange = (
    breakpoint: "large" | "medium" | "small",
    hidden: boolean,
  ) => {
    switch (breakpoint) {
      case "large":
        setHideInLarge(hidden);
        break;
      case "medium":
        setHideInMedium(hidden);
        break;
      case "small":
        setHideInSmall(hidden);
        break;
    }
    onVisibilityChange?.(breakpoint, hidden);
  };

  const handleResize = (newColSpan: number, newRowSpan: number) => {
    setEffectiveColSpan(newColSpan);
    onResize?.(newColSpan, newRowSpan);
  };

  const handleWidgetSelect = (
    widgetType: string,
    size: { width: number; height: number },
  ) => {
    onWidgetChange?.(widgetType, size);
    setIsWidgetPickerOpen(false);
  };

  // Update max size calculation
  const widgetDef = getWidget(type);
  const maxCols = widgetDef?.maxSize.width ?? 1;
  const maxRows = widgetDef?.maxSize.height ?? 1;

  // Generate grid cells based on maxSize
  const gridCells = Array.from({ length: maxCols * maxRows }).map(
    (_, index) => {
      const row = Math.floor(index / maxCols) + 1;
      const col = (index % maxCols) + 1;

      // Skip rendering if beyond max dimensions
      if (row > maxRows || col > maxCols) return null;

      const isSelected = col === colSpan && row === rowSpan;
      const isHovered =
        hoveredSize && col <= hoveredSize.col && row <= hoveredSize.row;
      const isDirectlyHovered =
        hoveredSize && col === hoveredSize.col && row === hoveredSize.row;

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
                    : "hover:after:brightness-110",
                )
              : "after:bg-muted hover:after:bg-primary/50",
            !isSelected && isHovered && "after:bg-primary/50",
            isDirectlyHovered && "after:scale-110 after:z-10",
          )}
          onClick={() => {
            handleResize(col, row);
          }}
          onMouseEnter={() => setHoveredSize({ col, row })}
          onMouseLeave={() => setHoveredSize(null)}
        />
      );
    },
  );

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <motion.div
            layout
            initial={false}
            className={cn("w-full h-full min-w-[100px]", className)}
            style={{
              gridColumn: `span ${effectiveColSpan} / span ${effectiveColSpan}`,
              gridRow: `span ${rowSpan} / span ${rowSpan}`,
            }}
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
            <ContextMenuSubContent className="w-auto p-2">
              <div className="flex flex-col gap-2">
                <div
                  className="grid auto-rows-[2rem] gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${maxCols}, 2rem)`,
                    width: "fit-content",
                  }}
                >
                  {gridCells}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {hoveredSize
                    ? `${hoveredSize.col} × ${hoveredSize.row}`
                    : `Max size: ${maxCols} × ${maxRows}`}
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
              handleResize(1, 1);
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
  );
}
