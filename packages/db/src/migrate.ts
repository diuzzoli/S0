import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createDb } from "./client.ts";

/** Aplica las migraciones pendientes (usado al desplegar, antes de levantar la API). */
export async function runMigrations(connectionString: string, migrationsFolder: string) {
  const { db, pool } = createDb(connectionString, { max: 1 });
  try {
    await migrate(db, { migrationsFolder });
  } finally {
    await pool.end();
  }
}
