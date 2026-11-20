/**
 * Flujo completo contra PostgreSQL real: registro → verificación → login →
 * CRUD con aislamiento por dueño → auditoría con actor.
 * Requiere la base de test migrada (CI la crea; local: ver README).
 */
import { schema } from "@app/db";
import { and, eq } from "@app/db/orm";
import { afterAll, describe, expect, it } from "vitest";
import app from "../src/app.ts";
import { db, pool } from "../src/lib/db.ts";

const ORIGIN = "http://localhost:5173";
const json = { "content-type": "application/json", origin: ORIGIN };

async function createVerifiedUser(email: string) {
  const password = "una-clave-larga-de-prueba";
  const signUp = await app.request("/api/auth/sign-up/email", {
    method: "POST",
    headers: json,
    body: JSON.stringify({ email, password, name: "Test" }),
  });
  expect(signUp.status).toBe(200);
  // Simula el click en el mail de verificación.
  await db.update(schema.user).set({ emailVerified: true }).where(eq(schema.user.email, email));

  const signIn = await app.request("/api/auth/sign-in/email", {
    method: "POST",
    headers: json,
    body: JSON.stringify({ email, password }),
  });
  expect(signIn.status).toBe(200);
  const cookie = signIn.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
  const [u] = await db.select().from(schema.user).where(eq(schema.user.email, email));
  if (!u) throw new Error("usuario no creado");
  return { cookie, id: u.id };
}

describe("módulo notes (integración)", () => {
  const stamp = Date.now();

  afterAll(async () => {
    await pool.end();
  });

  it("no permite login sin verificar el email", async () => {
    const email = `noverif-${stamp}@test.local`;
    await app.request("/api/auth/sign-up/email", {
      method: "POST",
      headers: json,
      body: JSON.stringify({ email, password: "una-clave-larga-de-prueba", name: "X" }),
    });
    const res = await app.request("/api/auth/sign-in/email", {
      method: "POST",
      headers: json,
      body: JSON.stringify({ email, password: "una-clave-larga-de-prueba" }),
    });
    expect(res.status).toBe(403);
  });

  it("crea, lista y aísla notas por usuario, y audita con actor", async () => {
    const alice = await createVerifiedUser(`alice-${stamp}@test.local`);
    const bob = await createVerifiedUser(`bob-${stamp}@test.local`);

    const created = await app.request("/api/notes", {
      method: "POST",
      headers: { ...json, cookie: alice.cookie },
      body: JSON.stringify({ title: "Hola", body: "mundo", ownerId: bob.id }),
    });
    expect(created.status).toBe(201);
    const note = (await created.json()) as { id: string; ownerId: string };
    // El ownerId enviado se ignora (mass assignment bloqueado).
    expect(note.ownerId).toBe(alice.id);

    const bobList = await app.request("/api/notes", { headers: { cookie: bob.cookie } });
    expect(await bobList.json()).toEqual([]);

    const bobDelete = await app.request(`/api/notes/${note.id}`, {
      method: "DELETE",
      headers: { origin: ORIGIN, cookie: bob.cookie },
    });
    expect(bobDelete.status).toBe(404);

    const [entry] = await db
      .select()
      .from(schema.auditLog)
      .where(and(eq(schema.auditLog.tableName, "note"), eq(schema.auditLog.recordId, note.id)));
    expect(entry?.operation).toBe("INSERT");
    expect(entry?.actorId).toBe(alice.id);
  });

  it("valida la entrada con Zod", async () => {
    const u = await createVerifiedUser(`val-${stamp}@test.local`);
    const res = await app.request("/api/notes", {
      method: "POST",
      headers: { ...json, cookie: u.cookie },
      body: JSON.stringify({ title: "   " }),
    });
    expect(res.status).toBe(400);
  });
});
