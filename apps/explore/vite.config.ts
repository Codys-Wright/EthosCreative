import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import netlify from "@netlify/vite-plugin-tanstack-start";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

const config = defineConfig({
  root: import.meta.dirname,
  plugins: [
    devtools({
      injectSource: {
        enabled: false,
      },
      eventBusConfig: {
        port: 42072, // Different port to avoid conflicts with other apps
      },
    }),
    viteTsConfigPaths({
      root: "../..",
    }),
    tailwindcss(),
    tanstackStart(),
    netlify(),
    viteReact(),
  ],
  resolve: {
    alias: {
      "@shadcn": path.resolve(__dirname, "../../packages/ui/shadcn/src"),
      "@theme": path.resolve(__dirname, "../../packages/ui/theme/src"),
      "@chat": path.resolve(__dirname, "../../packages/chat/src"),
      "@sse": path.resolve(__dirname, "../../packages/sse/src"),
    },
  },
  server: {
    watch: {
      ignored: ["**/.netlify/**", "**/.output/**", "**/dist/**"],
    },
  },
  optimizeDeps: {
    exclude: ["cpu-features", "pg", "@testcontainers/postgresql"],
  },
  ssr: {
    external: ["cpu-features", "pg", "@testcontainers/postgresql"],
    noExternal: ["lucide-react"],
  },
  build: {
    outDir: "./output",
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});

export default config;
