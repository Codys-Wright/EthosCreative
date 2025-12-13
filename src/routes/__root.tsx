import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { RegistryProvider } from "@effect-atom/atom-react";
import { ThemeProvider, ThemeSystemProviderWithContext } from "@shadcn";
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
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      // Preload Google Fonts for dynamic font switching
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
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Noto+Sans:wght@100..900&family=Nunito+Sans:opsz,wght@6..12,200..1000&family=Figtree:wght@300..900&family=Roboto:wght@100;300;400;500;700;900&family=Raleway:wght@100..900&family=DM+Sans:opsz,wght@9..40,100..1000&family=Public+Sans:wght@100..900&family=Outfit:wght@100..900&family=JetBrains+Mono:wght@100..800&display=swap",
      },
    ],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <ThemeSystemProviderWithContext defaultThemeName="neutral" storageKey="vite-ui-theme-name">
            <RegistryProvider defaultIdleTTL={60_000}>{children}</RegistryProvider>
            <TanStackDevtools
              config={{
                position: "bottom-right",
              }}
              plugins={[
                {
                  name: "Tanstack Router",
                  render: <TanStackRouterDevtoolsPanel />,
                },
              ]}
            />
          </ThemeSystemProviderWithContext>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
