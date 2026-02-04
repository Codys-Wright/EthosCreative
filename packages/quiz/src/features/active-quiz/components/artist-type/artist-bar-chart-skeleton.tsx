"use client";

import { cn } from "@shadcn";

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_NUM_BARS = 10;
// Match the actual bar chart component's sizing: PER_ROW_PX = 28, MIN_HEIGHT_PX = 180
const PER_ROW_PX = 28;
const MIN_HEIGHT_PX = 180;

// =============================================================================
// SKELETON COMPONENT
// =============================================================================

export type ArtistBarChartSkeletonProps = {
  className?: string;
  numBars?: number;
  /** @deprecated height prop is ignored - skeleton now matches actual bar chart's dynamic height */
  height?: string;
};

export const ArtistBarChartSkeleton: React.FC<ArtistBarChartSkeletonProps> = ({
  className,
  numBars = DEFAULT_NUM_BARS,
}) => {
  // Match actual bar chart height calculation: Math.max(MIN_HEIGHT_PX, rows * PER_ROW_PX)
  const containerHeightPx = Math.max(MIN_HEIGHT_PX, numBars * PER_ROW_PX);

  // Generate varied bar widths for visual interest
  const barWidths = Array.from({ length: numBars }, (_, i) => {
    // Create a descending pattern with some variation
    const base = 95 - i * 8;
    return Math.max(15, Math.min(95, base));
  });

  return (
    <div
      className={cn("w-full", className)}
      style={{ height: `${containerHeightPx}px` }}
    >
      <div className="flex h-full flex-col justify-between gap-1 py-1">
        {barWidths.map((width, index) => (
          <div key={index} className="flex items-center gap-2">
            {/* Label skeleton */}
            <div
              className="h-3 w-16 rounded bg-muted-foreground/20 animate-pulse flex-shrink-0"
              style={{ animationDelay: `${index * 50}ms` }}
            />
            {/* Bar skeleton */}
            <div className="flex-1 h-4 bg-muted-foreground/10 rounded overflow-hidden">
              <div
                className="h-full rounded bg-muted-foreground/20 animate-pulse"
                style={{
                  width: `${width}%`,
                  animationDelay: `${index * 50}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

ArtistBarChartSkeleton.displayName = "ArtistBarChartSkeleton";
