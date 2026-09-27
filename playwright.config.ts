import { defineConfig, devices } from "@playwright/test";

const projects = [
  { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
  { name: "desktop-firefox", use: { ...devices["Desktop Firefox"] } },
  { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
];

// CI runs on a supported Linux image; local WebKit remains opt-in on older hosts.
if (process.env.CI || process.env.PLAYWRIGHT_WEBKIT === "true")
  projects.push(
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
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:3100",
    actionTimeout: 15000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npx next start --hostname 127.0.0.1 -p 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 120000,
  },
  projects,
});
