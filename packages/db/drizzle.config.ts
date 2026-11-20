import { defineConfig } from "drizzle-kit";

// Carga el .env de la raíz si existe (en CI las variables vienen del entorno).
try {
  process.loadEnvFile("../../.env");
} catch {}

const url = process.env.DATABASE_URL;
if (!url) throw new Error("Falta DATABASE_URL (copiá .env.example a .env)");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  casing: "snake_case",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
