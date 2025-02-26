"use client";

import React, { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import TanstackProvider from "./_providers/tanstack-provider";
import { ManagedRuntime } from "effect";
import { LiveLayer } from "@/features/global/lib/services/live-layer";
import { RuntimeProvider } from "@/features/global/lib/runtime/runtime-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const runtime = React.useMemo(() => ManagedRuntime.make(LiveLayer), []);
  return (
    <RuntimeProvider runtime={runtime}>
      <TanstackProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </TanstackProvider>
    </RuntimeProvider>
  );
}
