import { defineConfig, devices } from "@playwright/test";

const projects = [
  { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
  { name: "desktop-firefox", use: { ...devices["Desktop Firefox"] } },
  { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
];

// The Playwright WebKit build is frozen on this host's older macOS runtime.
// CI runs the current Linux WebKit build, including a mobile Safari profile.
if (process.env.CI) projects.push(
  { name: "desktop-webkit", use: { ...devices["Desktop Safari"] } },
  { name: "mobile-webkit", use: { ...devices["iPhone 13"] } },
);

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 120000,
  fullyParallel: false,
  workers: process.env.CI ? 2 : 1,
  forbidOnly: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: { baseURL: "http://127.0.0.1:3100", actionTimeout: 15000, trace: "retain-on-failure", screenshot: "only-on-failure", video: "retain-on-failure" },
  webServer: { command: "npx next start --hostname 127.0.0.1 -p 3100", url: "http://127.0.0.1:3100", reuseExistingServer: !process.env.CI, timeout: 120000 },
  projects,
});
