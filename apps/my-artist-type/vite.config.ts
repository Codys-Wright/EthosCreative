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
      // Disable data-tsd-source attributes to prevent hydration warnings
      // These attributes embed source file locations but cause SSR/client mismatches during development
      injectSource: {
        enabled: false,
      },
    }),
    // this is the plugin that enables path aliases from tsconfig.base.json
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
      "@my-artist-type": path.resolve(__dirname, "./src"),
      "@quiz": path.resolve(__dirname, "../../packages/quiz/src"),
      "@artist-types": path.resolve(
        __dirname,
        "../../packages/artist-types/src"
      ),
      "@auth": path.resolve(__dirname, "../../packages/auth/src"),
      "@core": path.resolve(__dirname, "../../packages/core/src"),
      "@shadcn": path.resolve(__dirname, "../../packages/ui/shadcn/src"),
      "@theme": path.resolve(__dirname, "../../packages/ui/theme/src"),
      "@todo": path.resolve(__dirname, "../../packages/todo/src"),
      "@example": path.resolve(__dirname, "../../packages/example/src"),
      "@components": path.resolve(
        __dirname,
        "../../packages/ui/components/src"
      ),
      "@email": path.resolve(__dirname, "../../packages/email/src"),
      "@playground": path.resolve(__dirname, "../../packages/playground/src"),
      "@sse": path.resolve(__dirname, "../../packages/sse/src"),
      "@course": path.resolve(__dirname, "../../packages/course/src"),
      "@chat": path.resolve(__dirname, "../../packages/chat/src"),
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
    noExternal: [],
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
