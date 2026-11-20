import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      NODE_ENV: "test",
      DATABASE_URL: process.env.DATABASE_URL ?? "postgres://app:app@localhost:5432/app_test",
      BETTER_AUTH_SECRET: "test-secret-test-secret-test-secret-123",
      AUTH_CHECK_PWNED_PASSWORDS: "false",
      RATE_LIMIT_PER_MINUTE: "1000",
    },
    // Los tests de integración comparten la base: correr en serie.
    fileParallelism: false,
  },
});
