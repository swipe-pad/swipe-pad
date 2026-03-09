import { defineConfig, devices } from "@playwright/test"

const port = process.env.PLAYWRIGHT_PORT ?? "3030"
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH

export default defineConfig({
  testDir: "tests/playwright",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    launchOptions: {
      executablePath,
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `bun run dev -- --port ${port}`,
    url: `${baseURL}/ui`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
