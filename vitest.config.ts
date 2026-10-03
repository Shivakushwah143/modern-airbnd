import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["apps/api/tests/**/*.test.ts"],
    setupFiles: ["apps/api/tests/setup-env.ts"],
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 30000,
    reporters: ["default"],
  },
});
