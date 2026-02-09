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
      "motion/react": path.resolve(
        __dirname,
        "./src/__tests__/mocks/motion-react.ts"
      ),
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
      "@playground": path.resolve(
        __dirname,
        "../../packages/playground/src"
      ),
      "@sse": path.resolve(__dirname, "../../packages/sse/src"),
      "@course": path.resolve(__dirname, "../../packages/course/src"),
      "@chat": path.resolve(__dirname, "../../packages/chat/src"),
    },
  },
});
