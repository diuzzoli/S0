import { sql } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/index.ts";

export type Database = NodePgDatabase<typeof schema>;
export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

export function createDb(connectionString: string, opts: { max?: number } = {}) {
  const pool = new Pool({
    connectionString,
    // 10 conexiones alcanzan holgadamente para 100–1000 usuarios con una instancia de API.
    max: opts.max ?? 10,
    idleTimeoutMillis: 30_000,
    // Evita consultas colgadas que agotan el pool.
    statement_timeout: 15_000,
  });
  const db = drizzle(pool, { schema, casing: "snake_case" });
  return { db, pool };
}

/**
 * Ejecuta `fn` dentro de una transacción con el usuario actual registrado
 * para los triggers de auditoría (ver sql/audit.sql).
 * Toda escritura de dominio debe pasar por acá.
 */
export async function withActor<T>(
  db: Database,
  actorId: string,
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.actor_id', ${actorId}, true)`);
    return fn(tx);
  });
}
