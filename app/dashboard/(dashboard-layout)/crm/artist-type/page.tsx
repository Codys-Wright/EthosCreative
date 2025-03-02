"use client";

import dynamic from "next/dynamic";

// Dynamically import the ArtistTypeDemoPage with no SSR to avoid hydration issues
const ArtistTypeDemoPage = dynamic(
  () => import("@/features/artist-types/__tests__/demo/artist-type-demo-page"),
  { ssr: false }
);

export default function ArtistTypePage() {
  return <ArtistTypeDemoPage />;
}
