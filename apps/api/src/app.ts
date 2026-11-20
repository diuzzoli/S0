import { sql } from "@app/db/orm";
import * as Sentry from "@sentry/node";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { env } from "./env.ts";
import { auth } from "./lib/auth.ts";
import type { AppEnv } from "./lib/context.ts";
import { db } from "./lib/db.ts";
import { sessionMiddleware } from "./middleware/auth.ts";
import {
  apiRateLimit,
  corsPolicy,
  csrfProtection,
  requestSizeLimit,
  securityHeaders,
} from "./middleware/security.ts";
import { notesRoute } from "./routes/notes.ts";

const app = new Hono<AppEnv>();

app.use(requestId());
if (env.NODE_ENV !== "test") app.use(logger());
app.use(securityHeaders);
app.use("/api/*", corsPolicy);
app.use("/api/*", csrfProtection);
app.use("/api/*", requestSizeLimit);
app.use("/api/*", apiRateLimit);

// Better Auth maneja todo /api/auth/* (login, registro, sesión, reset, admin).
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.use("/api/*", sessionMiddleware);

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    const issues = err.status === 400 && err.cause ? { issues: err.cause } : {};
    return c.json({ error: err.message, ...issues }, err.status);
  }
  // Nunca devolver detalles internos al cliente; el detalle va a Sentry y al log.
  Sentry.captureException(err, { tags: { requestId: c.var.requestId } });
  console.error(`[${c.var.requestId}]`, err);
  return c.json({ error: "Error interno", requestId: c.var.requestId }, 500);
});

app.notFound((c) => c.json({ error: "No encontrado" }, 404));

// Las rutas se encadenan para que `AppType` tenga todos los tipos (cliente RPC hc).
const routes = app
  .get("/api/health", async (c) => {
    await db.execute(sql`select 1`);
    return c.json({ status: "ok" as const });
  })
  .get("/api/me", (c) => c.json({ user: c.var.user }))
  .route("/api/notes", notesRoute);

export type AppType = typeof routes;
export default app;
