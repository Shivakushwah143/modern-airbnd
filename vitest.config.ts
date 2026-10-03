import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["apps/api/tests/**/*.test.ts"],
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 30000,
    reporters: ["default"],
  },
});
