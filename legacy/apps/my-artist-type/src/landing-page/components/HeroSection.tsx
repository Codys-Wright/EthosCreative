"use client";

import Image from "next/image";
import { HeroData } from "../data/HeroData";
import { TextGenerateEffect } from "./text-generate-effect";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useThemeStore } from "../store/use-theme-store";
import Link from "next/link";

export function HeroSection() {
  const quoteWords = `"Knowing yourself is the beginning of all wisdom" - Aristotle`;
  const { theme, resolvedTheme } = useTheme();
  const { backgroundImage, setBackgroundImage, getInitialBackgroundImage } =
    useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setBackgroundImage(getInitialBackgroundImage());
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (theme === "dark" || resolvedTheme === "dark") {
      setBackgroundImage("/MAT-background-landing-page-dark.png");
    } else {
      setBackgroundImage(HeroData.backgroundImage);
    }
  }, [theme, resolvedTheme, setBackgroundImage, mounted]);

  // Use default background image for initial render
  const currentBackground = mounted
    ? backgroundImage
    : HeroData.backgroundImage;

  return (
    <div className="relative h-[calc(100vh-88px)] w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={currentBackground}
          alt="Background"
          fill
          className="object-cover"
          quality={100}
          priority
        />
      </div>
      <div className="relative z-10 h-full">
        <div className="relative flex h-full flex-col items-center justify-center px-4 md:px-8">
          <div className="relative flex flex-col items-center justify-center">
            <h1 className="relative mx-auto mb-8 max-w-6xl px-4 text-center text-4xl font-bold tracking-tight text-foreground md:mb-10 md:text-5xl lg:text-7xl">
              {HeroData.title}
            </h1>
            <div className="font-regular relative mx-auto mb-12 max-w-xl px-4 text-center text-lg tracking-wide text-muted-foreground antialiased md:mb-16 md:text-xl">
              <TextGenerateEffect
                words={quoteWords}
                className="text-muted-foreground"
              />
            </div>
          </div>
          <div className="group relative z-10">
            <Link
              href="/quiz"
              className="inline-block rounded-lg bg-primary px-8 py-3 text-lg font-medium text-primary-foreground shadow-[0px_-2px_0px_0px_rgba(0,0,0,0.4)_inset] transition-colors hover:bg-primary/90 md:py-4"
            >
              {HeroData.buttonText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
