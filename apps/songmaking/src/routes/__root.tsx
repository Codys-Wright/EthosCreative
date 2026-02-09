import { RegistryProvider } from "@effect-atom/atom-react";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import {
  getThemeScriptContent,
  ThemeProvider,
  ThemeSystemProviderWithContext,
} from "@theme";
import { Toaster } from "@shadcn";
import { Construction } from "lucide-react";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Songmaking",
      },
      // Prevent Dark Reader from modifying the page (causes hydration mismatches)
      {
        name: "darkreader-lock",
        content: "",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      // Preload Google Fonts
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap",
      },
    ],
  }),

  component: RootComponent,
  shellComponent: RootDocument,
});

function RootComponent() {
  return (
    <div className="min-h-screen" suppressHydrationWarning>
      {/* Construction Banner */}
      <div className="bg-amber-500 text-amber-950 px-4 py-2 text-center text-sm font-medium">
        <div className="flex items-center justify-center gap-2">
          <Construction className="w-4 h-4" />
          <span>
            This website is under construction, many sections are incomplete but
            will be back soon
          </span>
        </div>
      </div>
      <Outlet />
      <Toaster />
    </div>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  // Generate blocking theme script - must be first to prevent FOUC
  const themeScript = getThemeScriptContent({
    defaultThemeName: "neutral",
    defaultRadius: "default",
    storageKey: "vite-ui-theme-name",
    radiusStorageKey: "vite-ui-radius",
    themeStorageKey: "vite-ui-theme",
  });

  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        {/* Blocking theme script - runs synchronously before any rendering */}
        <script
          dangerouslySetInnerHTML={{ __html: themeScript }}
          suppressHydrationWarning
        />
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <ThemeSystemProviderWithContext>
            <RegistryProvider defaultIdleTTL={60_000}>
              {children}
            </RegistryProvider>
          </ThemeSystemProviderWithContext>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
