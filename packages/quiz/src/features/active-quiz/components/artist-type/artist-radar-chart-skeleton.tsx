"use client";

import { cn } from "@shadcn";

// =============================================================================
// CONSTANTS
// =============================================================================

const ICON_RADIUS_MULTIPLIER = 0.9;

// Artist types in the same order as the actual radar chart with correct icon paths
const ARTIST_TYPES = [
  {
    name: "Visionary",
    iconPath: "/svgs/artist-type-logos/1_VISIONARY_LOGO.svg",
  },
  {
    name: "Consummate",
    iconPath: "/svgs/artist-type-logos/2_CONSUMATE_LOGO.svg",
  },
  { name: "Analyzer", iconPath: "/svgs/artist-type-logos/3_ANALYZER_LOGO.svg" },
  { name: "Tech", iconPath: "/svgs/artist-type-logos/4_TECH_LOGO.svg" },
  {
    name: "Entertainer",
    iconPath: "/svgs/artist-type-logos/5_ENTERTAINER_LOGO.svg",
  },
  { name: "Maverick", iconPath: "/svgs/artist-type-logos/6_MAVERICK_LOGO.svg" },
  { name: "Dreamer", iconPath: "/svgs/artist-type-logos/7_DREAMER_LOGO.svg" },
  { name: "Feeler", iconPath: "/svgs/artist-type-logos/8_FEELER_LOGO.svg" },
  { name: "Tortured", iconPath: "/svgs/artist-type-logos/9_TORTURED_LOGO.svg" },
  { name: "Solo", iconPath: "/svgs/artist-type-logos/10_SOLO_LOGO.svg" },
] as const;

// =============================================================================
// SKELETON COMPONENT
// =============================================================================

export type ArtistRadarChartSkeletonProps = {
  className?: string;
};

export const ArtistRadarChartSkeleton: React.FC<
  ArtistRadarChartSkeletonProps
> = ({ className }) => {
  // Calculate icon positions for the 10 artist types around the circle
  // Use a larger radius (48) to match the client-rendered chart spacing
  const iconPositions = ARTIST_TYPES.map((artist, index) => {
    const angle = (index / ARTIST_TYPES.length) * 2 * Math.PI - Math.PI / 2;
    const radiusPercent = 48 * ICON_RADIUS_MULTIPLIER;
    const x = 50 + radiusPercent * Math.cos(angle);
    const y = 50 + radiusPercent * Math.sin(angle);
    return { x, y, name: artist.name, iconPath: artist.iconPath };
  });

  return (
    <div
      className={cn("relative h-full w-full", className)}
      style={{ aspectRatio: "1 / 1" }}
    >
      {/* Radar chart grid - matches Recharts PolarGrid styling */}
      <svg viewBox="0 0 100 100" className="h-full w-full">
        {/* Concentric polygon rings (like PolarGrid) */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
          <polygon
            key={i}
            points={Array.from({ length: ARTIST_TYPES.length }, (_, idx) => {
              const angle =
                (idx / ARTIST_TYPES.length) * 2 * Math.PI - Math.PI / 2;
              // Use 32 as max radius to better match Recharts' default sizing
              const r = 32 * scale;
              const x = 50 + r * Math.cos(angle);
              const y = 50 + r * Math.sin(angle);
              return `${x},${y}`;
            }).join(" ")}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.2"
            className="text-muted-foreground/20"
          />
        ))}

        {/* Radial lines from center to each point */}
        {Array.from({ length: ARTIST_TYPES.length }, (_, idx) => {
          const angle = (idx / ARTIST_TYPES.length) * 2 * Math.PI - Math.PI / 2;
          const x = 50 + 32 * Math.cos(angle);
          const y = 50 + 32 * Math.sin(angle);
          return (
            <line
              key={idx}
              x1="50"
              y1="50"
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeWidth="0.2"
              className="text-muted-foreground/20"
            />
          );
        })}
      </svg>

      {/* Artist type icons around the perimeter */}
      {iconPositions.map((pos) => (
        <div
          key={pos.name}
          className="absolute"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <img
            src={pos.iconPath}
            alt={pos.name}
            className="h-6 w-6 rounded-full dark:brightness-0 dark:invert sm:h-8 sm:w-8 md:h-10 md:w-10"
          />
        </div>
      ))}

      {/* Central logo */}
      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transform">
        <div
          className="bg-background absolute inset-0 rounded-full"
          style={{
            width: "50px",
            height: "50px",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
        <img
          src="/svgs/MyArtistTypeLogo.svg"
          alt="My Artist Type Logo"
          className="relative z-10 h-[50px] w-[50px] dark:brightness-0 dark:invert"
          style={{ objectFit: "contain" }}
        />
      </div>
    </div>
  );
};

ArtistRadarChartSkeleton.displayName = "ArtistRadarChartSkeleton";
