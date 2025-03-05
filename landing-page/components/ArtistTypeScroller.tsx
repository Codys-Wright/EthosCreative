"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LandingPageArtistType } from "@/types";
import Marquee from "react-fast-marquee";
import { ImageWithFallback } from "./ImageWithFallback";

interface ArtistTypeScrollerProps {
  artistTypes: LandingPageArtistType[];
}

/**
 * A horizontally scrolling component that displays artist type images
 * in a continuous scrolling marquee.
 */
export function ArtistTypeScroller({ artistTypes }: ArtistTypeScrollerProps) {
  const hasData = artistTypes && artistTypes.length > 0;

  return (
    <div className="relative w-full bg-gradient-to-r py-8">
      <div className="relative mt-4 flex h-[220px] w-full justify-center overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] md:mt-2 md:h-[320px]">
        <Marquee
          pauseOnHover
          direction="left"
          speed={40}
          className="w-full py-4"
          gradient={false}
        >
          {hasData
            ? artistTypes.map((type, index) => (
                <div key={type.id} className="mx-3 md:mx-6">
                  <Card className="h-[140px] w-[140px] border-0 bg-transparent overflow-hidden md:h-[200px] md:w-[200px] lg:h-[240px] lg:w-[240px] py-0">
                    <CardContent className="p-0 h-full w-full">
                      <div className="relative h-full w-full">
                        <ImageWithFallback
                          src={type.image || "/placeholder.svg"}
                          alt={type.name}
                          fill
                          sizes="(max-width: 768px) 140px, (max-width: 1024px) 200px, 240px"
                          priority={index === 0}
                          fallbackSrc="/placeholder.svg"
                          className="object-cover dark:invert"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            : // Fallback loading state
              Array(5)
                .fill(null)
                .map((_, i) => (
                  <div key={i} className="mx-3 md:mx-6">
                    <Card className="h-[140px] w-[140px] border-0 bg-transparent overflow-hidden md:h-[200px] md:w-[200px] lg:h-[240px] lg:w-[240px] py-0">
                      <CardContent className="p-0 h-full w-full">
                        <div className="flex h-full w-full items-center justify-center">
                          <div className="h-[120px] w-[120px] animate-pulse rounded-full bg-muted md:h-[160px] md:w-[160px] lg:h-[180px] lg:w-[180px]" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
        </Marquee>
      </div>
    </div>
  );
}
