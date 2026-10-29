import { defineConfig } from "@playwright/test";

// Сквозные тесты в браузере: npm run test:e2e (сначала собирает сайт).
// Работают с той же базой, что и сайт: создают аккаунты qa.e2e-*@bestauto-qa.lv и удаляют их в конце
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  globalTeardown: "./tests/e2e/teardown.ts",
  use: {
    baseURL: "http://localhost:3100",
    channel: "chrome", // установленный Chrome — без скачивания браузеров Playwright
    locale: "lv-LV",
    viewport: { width: 1280, height: 900 },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npx next start -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
