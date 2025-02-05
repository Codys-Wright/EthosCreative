"use client";

import { BlogContentWithToc } from "../../../landing-page/components/BlogContentWithToc";
import { aboutContent } from "../../../landing-page/data/AboutContent";

export default function AboutPage() {
  return (
    <main className="min-h-screen w-full py-20">
      <BlogContentWithToc blog={aboutContent} />
    </main>
  );
}
