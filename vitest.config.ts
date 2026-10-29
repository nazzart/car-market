import path from "node:path";
import { defineConfig } from "vitest/config";

// Модульные тесты чистой логики (без базы и браузера): npm test
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname) } },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
  },
});
