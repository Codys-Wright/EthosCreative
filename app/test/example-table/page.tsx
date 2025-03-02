"use client";

import dynamic from "next/dynamic";

// Dynamically import the ExampleDemoPage with no SSR to avoid hydration issues
const ExampleDemoPage = dynamic(
  () => import("@/features/example/__tests__/demo/example-demo-page"),
  { ssr: false }
);

export default function ExampleTablePage() {
  return <ExampleDemoPage />;
} 