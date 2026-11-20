import { bigserial, index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Registro de auditoría append-only. Lo escriben triggers de PostgreSQL
 * (drizzle/0001_audit.sql), no el código de la app: así ninguna escritura
 * se escapa aunque alguien olvide llamar a un helper.
 *
 * Para auditar una tabla nueva de dominio, en una migración:
 *   select audit_enable('nombre_tabla');
 */
export const auditLog = pgTable(
  "audit_log",
  {
    id: bigserial({ mode: "number" }).primaryKey(),
    tableName: text().notNull(),
    recordId: text().notNull(),
    operation: text({ enum: ["INSERT", "UPDATE", "DELETE"] }).notNull(),
    // Usuario que hizo el cambio (seteado por withActor). null = sistema/migración.
    actorId: text(),
    oldData: jsonb(),
    newData: jsonb(),
    occurredAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("audit_log_record_idx").on(t.tableName, t.recordId),
    index("audit_log_actor_idx").on(t.actorId),
    index("audit_log_occurred_idx").on(t.occurredAt),
  ],
);
