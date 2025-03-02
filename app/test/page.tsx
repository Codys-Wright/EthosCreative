"use client";

import { ExampleComponent } from "@/features/example/presentation";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/features/global/lib/utils/tanstack-query";

export default function TestPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Database Operations Test Page</h1>
      <QueryClientProvider client={queryClient}>
        <ExampleComponent />
      </QueryClientProvider>
    </div>
  );
}
