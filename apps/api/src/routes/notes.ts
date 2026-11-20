/**
 * MÓDULO DE EJEMPLO (ver packages/db/src/schema/notes.ts).
 * Patrón a copiar en cada módulo de dominio:
 *  1. requireAuth en todo el router.
 *  2. Validar params y body con los contratos de @app/contracts.
 *  3. Filtrar SIEMPRE por el dueño (o tenant) en la consulta, no después.
 *  4. Escribir con withActor() para que quede auditado.
 *  5. Devolver 404 (no 403) si el registro no es del usuario: no revela que existe.
 */

import { idParam, noteCreateInput, noteUpdateInput, paginationQuery } from "@app/contracts";
import { withActor } from "@app/db";
import { and, desc, eq } from "@app/db/orm";
import { note } from "@app/db/schema";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AuthedEnv } from "../lib/context.ts";
import { db } from "../lib/db.ts";
import { validate } from "../lib/validate.ts";
import { requireAuth } from "../middleware/auth.ts";

export const notesRoute = new Hono<AuthedEnv>()
  .use(requireAuth)
  .get("/", validate("query", paginationQuery), async (c) => {
    const { limit } = c.req.valid("query");
    const rows = await db
      .select()
      .from(note)
      .where(eq(note.ownerId, c.var.user.id))
      .orderBy(desc(note.createdAt))
      .limit(limit);
    return c.json(rows);
  })
  .post("/", validate("json", noteCreateInput), async (c) => {
    const input = c.req.valid("json");
    const userId = c.var.user.id;
    const [row] = await withActor(db, userId, (tx) =>
      tx
        .insert(note)
        .values({ ...input, ownerId: userId })
        .returning(),
    );
    return c.json(row, 201);
  })
  .patch("/:id", validate("param", idParam), validate("json", noteUpdateInput), async (c) => {
    const { id } = c.req.valid("param");
    const userId = c.var.user.id;
    const [row] = await withActor(db, userId, (tx) =>
      tx
        .update(note)
        .set(c.req.valid("json"))
        .where(and(eq(note.id, id), eq(note.ownerId, userId)))
        .returning(),
    );
    if (!row) throw new HTTPException(404, { message: "No encontrado" });
    return c.json(row);
  })
  .delete("/:id", validate("param", idParam), async (c) => {
    const { id } = c.req.valid("param");
    const userId = c.var.user.id;
    const [row] = await withActor(db, userId, (tx) =>
      tx
        .delete(note)
        .where(and(eq(note.id, id), eq(note.ownerId, userId)))
        .returning({ id: note.id }),
    );
    if (!row) throw new HTTPException(404, { message: "No encontrado" });
    return c.body(null, 204);
  });
