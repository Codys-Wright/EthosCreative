"use client";
import { use } from "react";

import { BlogContentWithToc } from "@/landing-page/components/BlogContentWithToc";
import { artistTypeContent } from "@/landing-page/data/ArtistTypeContent";
import { notFound } from "next/navigation";

export default function ArtistTypePage(props: {
  params: Promise<{ type: string }>;
}) {
  const params = use(props.params);
  const artistType = artistTypeContent[params.type];

  if (!artistType) {
    notFound();
  }
  return (
    <main className="min-h-screen w-full py-20">
      <BlogContentWithToc blog={artistType} showAuthor={false} />
    </main>
  );
}
