/**
 * MÓDULO DE EJEMPLO — contrato de entrada/salida de la API de notas.
 *
 * Los contratos son Zod puro (sin Drizzle) para que el frontend los importe sin
 * cargar el ORM en el bundle del celular. Que no se desincronicen de la tabla lo
 * garantiza packages/db/src/contracts-check.ts: si no coinciden, falla el typecheck.
 *
 * REGLA DE SEGURIDAD: la entrada solo incluye los campos que el usuario puede
 * enviar. Nunca ownerId, role, tenantId, id… (mass assignment).
 */
import { z } from "zod";

export const noteCreateInput = z.object({
  title: z.string().trim().min(1, "El título es obligatorio").max(200),
  body: z.string().max(10_000).default(""),
});

export const noteUpdateInput = noteCreateInput.partial();

export type NoteCreateInput = z.infer<typeof noteCreateInput>;
export type NoteUpdateInput = z.infer<typeof noteUpdateInput>;
