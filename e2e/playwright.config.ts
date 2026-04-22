import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  retries: 3,
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:5173/",
    screenshot: "on",
    trace: "on",
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
    url: "http://localhost:5173/",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
