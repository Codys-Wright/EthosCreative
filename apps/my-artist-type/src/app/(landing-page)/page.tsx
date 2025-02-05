"use client";

import { HeroSection } from "../../landing-page/components/HeroSection";
import { ArtistTypeFolddown } from "../../landing-page/components/ArtistTypeFolddown";
import { Footer } from "../../landing-page/components/Footer";
import { ArtistTypeScroller } from "../../landing-page/components/ArtistTypeScroller";
import { Test } from "@repo/quiz";

export default function Home() {
  return (
    <>
      <main className="flex min-h-screen w-full flex-col">
        <Test />
        <HeroSection />
        <ArtistTypeScroller />
        <ArtistTypeFolddown />
        <Footer />
      </main>
    </>
  );
}
