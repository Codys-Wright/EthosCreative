"use client";

import { Card, cn } from "@shadcn";

import { ArtistBarChartSkeleton } from "./artist-bar-chart-skeleton.js";
import { ArtistRadarChartSkeleton } from "./artist-radar-chart-skeleton.js";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export type ArtistTypeGraphCardSkeletonProps = {
  showBarChart?: boolean;
  /** Show bar chart only on lg screens and up (useful for SSR where we can't detect screen size) */
  showBarChartOnLg?: boolean;
  barChartHeight?: string;
  className?: string;
  contentClassName?: string;
  transparent?: boolean;
  fill?: boolean;
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ArtistTypeGraphCardSkeleton = ({
  barChartHeight = "h-56",
  className = "",
  contentClassName = "",
  fill = false,
  showBarChart = true,
  showBarChartOnLg = false,
  transparent = false,
}: ArtistTypeGraphCardSkeletonProps) => {
  const shouldShowBarChart = showBarChart || showBarChartOnLg;

  return (
    <Card
      className={cn(
        "overflow-hidden",
        transparent && "bg-transparent border-none shadow-none",
        className
      )}
    >
      <Card.Content
        className={cn(
          fill ? "h-full w-full p-0" : "aspect-square p-4",
          contentClassName
        )}
      >
        <ArtistRadarChartSkeleton />
      </Card.Content>
      {shouldShowBarChart && (
        <Card.Footer
          className={cn(
            "flex-col overflow-hidden p-2",
            // If showBarChartOnLg is true but showBarChart is false, only show on lg+
            showBarChartOnLg && !showBarChart && "hidden lg:flex"
          )}
        >
          <div className="w-full max-w-full overflow-hidden">
            <ArtistBarChartSkeleton
              height={barChartHeight}
              className="text-left w-full max-w-full"
            />
          </div>
        </Card.Footer>
      )}
    </Card>
  );
};

ArtistTypeGraphCardSkeleton.displayName = "ArtistTypeGraphCardSkeleton";
