"use client";

import { Result, useAtomValue } from "@effect-atom/atom-react";
import { artistTypesAtom } from "@artist-types";
import { Accordion, Button, Skeleton } from "@shadcn";
import { ArrowRightIcon } from "lucide-react";

// ============================================================================
// Icon Mapping (same as radar chart)
// ============================================================================

const ARTIST_ICON_PATHS: Record<string, string> = {
  "the-visionary-artist": "/svgs/artist-type-logos/1_VISIONARY_LOGO.svg",
  "the-consummate-artist": "/svgs/artist-type-logos/2_CONSUMATE_LOGO.svg",
  "the-analyzer-artist": "/svgs/artist-type-logos/3_ANALYZER_LOGO.svg",
  "the-tech-artist": "/svgs/artist-type-logos/4_TECH_LOGO.svg",
  "the-entertainer-artist": "/svgs/artist-type-logos/5_ENTERTAINER_LOGO.svg",
  "the-maverick-artist": "/svgs/artist-type-logos/6_MAVERICK_LOGO.svg",
  "the-dreamer-artist": "/svgs/artist-type-logos/7_DREAMER_LOGO.svg",
  "the-feeler-artist": "/svgs/artist-type-logos/8_FEELER_LOGO.svg",
  "the-tortured-artist": "/svgs/artist-type-logos/9_TORTURED_LOGO.svg",
  "the-solo-artist": "/svgs/artist-type-logos/10_SOLO_LOGO.svg",
};

const getArtistIconPath = (databaseId: string): string | null => {
  return ARTIST_ICON_PATHS[databaseId] ?? null;
};

// ============================================================================
// Loading State
// ============================================================================

function ExploreArtistTypesLoading() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 md:px-8">
        <div className="text-center mb-8">
          <Skeleton className="h-8 w-64 mx-auto mb-4" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ExploreArtistTypes() {
  const result = useAtomValue(artistTypesAtom);

  return Result.builder(result)
    .onInitial(() => <ExploreArtistTypesLoading />)
    .onSuccess((artistTypes) => {
      const sortedTypes = [...artistTypes].sort((a, b) => a.order - b.order);

      return (
        <section className="py-16 md:py-24 bg-neutral-50 dark:bg-neutral-900/50">
          <div className="mx-auto max-w-3xl px-4 md:px-8">
            {/* Header */}
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Explore the Artist Types
              </h2>
              <p className="text-muted-foreground text-lg">
                Discover the 10 distinct Artist Types, each with their own
                strengths and creative approach.
              </p>
            </div>

            {/* Accordion */}
            <Accordion type="single" collapsible className="mb-10">
              {sortedTypes.map((artistType) => (
                <Accordion.Item key={artistType.id} value={artistType.id}>
                  <Accordion.Trigger className="hover:no-underline">
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          getArtistIconPath(artistType.id) ?? artistType.icon
                        }
                        alt={artistType.name}
                        className="h-10 w-10 rounded-full object-contain dark:brightness-0 dark:invert"
                      />
                      <span className="text-base font-semibold">
                        {artistType.name}
                      </span>
                    </div>
                  </Accordion.Trigger>
                  <Accordion.Content>
                    <div className="pl-14">
                      <p className="text-muted-foreground mb-4">
                        {artistType.elevatorPitch}
                      </p>
                      <a
                        href={`/artist-types/${artistType.id}`}
                        className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Learn more
                        <ArrowRightIcon className="h-3 w-3" />
                      </a>
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion>

            {/* CTA Button */}
            <div className="text-center">
              <a href="/artist-types">
                <Button size="lg">
                  View All Artist Types
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </section>
      );
    })
    .onFailure(() => null)
    .render();
}

ExploreArtistTypes.displayName = "ExploreArtistTypes";
