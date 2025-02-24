"use client";
import Image from "next/image";
import Marquee from "react-fast-marquee";
import { Card, CardContent } from "@/components/ui/card";
import { ArtistTypeData } from "../data/ArtistTypeData";

export function ArtistTypeScroller() {
  return (
    <div className="relative w-full bg-gradient-to-r py-8">
      <div className="relative mt-4 flex h-[180px] w-full flex-wrap justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] md:mt-2 md:h-[260px] md:gap-10 md:gap-40">
        <Marquee pauseOnHover direction="left" speed={40} className="w-full">
          {ArtistTypeData.map((type) => (
            <div key={type.name} className="mx-2 md:mx-4">
              <Card className="h-[160px] w-[160px] border-0 bg-transparent md:h-[240px] md:w-[240px]">
                <CardContent className="flex h-full items-center justify-center p-0">
                  <Image
                    src={type.image || "/placeholder.svg"}
                    alt={type.name}
                    width={160}
                    height={160}
                    className="object-contain dark:invert md:h-[240px] md:w-[240px]"
                  />
                </CardContent>
              </Card>
            </div>
          ))}
        </Marquee>
      </div>
    </div>
  );
}
