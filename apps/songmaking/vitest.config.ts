import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    globals: true,
  },
  resolve: {
    alias: {
      "@auth": path.resolve(__dirname, "../../packages/auth/src"),
      "@core": path.resolve(__dirname, "../../packages/core/src"),
      "@shadcn": path.resolve(__dirname, "../../packages/ui/shadcn/src"),
      "@theme": path.resolve(__dirname, "../../packages/ui/theme/src"),
      "@components": path.resolve(
        __dirname,
        "../../packages/ui/components/src"
      ),
      "@course": path.resolve(__dirname, "../../packages/course/src"),
      "@chat": path.resolve(__dirname, "../../packages/chat/src"),
      "@sse": path.resolve(__dirname, "../../packages/sse/src"),
    },
  },
});
