"use client";

import { ThemeProvider } from "@repo/ui";
import TanstackProvider from "./_providers/tanstack-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
