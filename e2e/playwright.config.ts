import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  retries: process.env.CI ? 3 : 1,
  timeout: 60_000,
  reporter: process.env.CI ? "dot" : "list",
  use: {
    baseURL: "http://localhost:5173/web-ide/",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run start -w web",
    cwd: "..",
    url: "http://localhost:5173/web-ide/",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
