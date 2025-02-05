"use client";

import { BlogContentWithToc } from "@/features/landing-page/components/BlogContentWithToc";
import { artistTypeContent } from "@/features/landing-page/data/ArtistTypeContent";
import { notFound } from "next/navigation";

export default function ArtistTypePage({ params }: { params: { type: string } }) {
  const artistType = artistTypeContent[params.type];

  if (!artistType) {
    notFound();
  }

  return (
    <main className="min-h-screen w-full py-20">
      <BlogContentWithToc blog={artistType} />
    </main>
  );
} 