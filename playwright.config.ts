import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 120000,
  expect: { timeout: 20000 },
  workers: 1,
  fullyParallel: false,
  reporter: "list",
  use: { ...(process.env.TEST_BROWSER_CHANNEL ? { channel: process.env.TEST_BROWSER_CHANNEL } : {}), actionTimeout: 20000, navigationTimeout: 30000, baseURL: process.env.TEST_BASE_URL || "http://localhost:3000", trace: "retain-on-failure", screenshot: "only-on-failure", ...(process.env.TEST_ADMIN_PASSWORD ? { httpCredentials: { username: process.env.TEST_ADMIN_USERNAME || "admin", password: process.env.TEST_ADMIN_PASSWORD } } : {}) },
  projects: [{ name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } }, { name: "mobile", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } }],
});
