/**
 * MÓDULO DE EJEMPLO — muestra el patrón completo de un "vertical slice":
 * tabla → esquema Zod → ruta Hono → hooks de TanStack Query → página responsive.
 * Copialo para tu primer módulo real y después borralo (ver docs/s0/modulos.md).
 */
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth.ts";

export const note = pgTable(
  "note",
  {
    id: uuid().defaultRandom().primaryKey(),
    // Dueño del registro: toda consulta filtra por este campo (autorización por fila).
    ownerId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text().notNull(),
    body: text().notNull().default(""),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index("note_owner_idx").on(t.ownerId, t.createdAt)],
);
