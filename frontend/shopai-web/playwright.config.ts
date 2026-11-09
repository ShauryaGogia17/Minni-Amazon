import { defineConfig, devices } from "@playwright/test";
const externalBase = process.env.SHOPAI_E2E_BASE_URL;
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  use: { baseURL: externalBase || "http://127.0.0.1:5173", trace: "retain-on-failure" },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
  webServer: externalBase ? undefined : {
    command: "npm run dev",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
