/** Entrada de producción: `node dist/migrate.js` aplica migraciones y termina. */
import { runMigrations } from "@app/db/migrate";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("Falta DATABASE_URL");

await runMigrations(url, process.env.MIGRATIONS_DIR ?? "./drizzle");
console.info("Migraciones aplicadas");
