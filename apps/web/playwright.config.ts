import { defineConfig, devices } from "@playwright/test";

/**
 * E2E con Playwright: cada pantalla se prueba en mobile Y desktop.
 * Local: `pnpm services:up && pnpm dev` en otra terminal, luego `pnpm --filter @app/web test:e2e`.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5173",
    trace: "on-first-retry",
    ...(process.env.PW_CHROME_PATH && {
      launchOptions: { executablePath: process.env.PW_CHROME_PATH },
    }),
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
});
