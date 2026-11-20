import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { auth } from "../lib/auth.ts";
import type { AppEnv, AuthedEnv } from "../lib/context.ts";

/** Carga la sesión (si existe) en c.var.user / c.var.session. */
export const sessionMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const result = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("user", result?.user ?? null);
  c.set("session", result?.session ?? null);
  await next();
});

/** Corta con 401 si no hay sesión. Autenticación ≠ autorización: cada ruta debe además
 *  verificar que el usuario puede tocar ESE registro (ownerId, rol, tenant). */
export const requireAuth = createMiddleware<AuthedEnv>(async (c, next) => {
  if (!c.var.user || !c.var.session) {
    throw new HTTPException(401, { message: "No autenticado" });
  }
  await next();
});

/** Corta con 403 si el usuario no tiene alguno de los roles indicados. */
export const requireRole = (...roles: string[]) =>
  createMiddleware<AuthedEnv>(async (c, next) => {
    const role = c.var.user.role ?? "user";
    if (!roles.includes(role)) {
      throw new HTTPException(403, { message: "Sin permisos" });
    }
    await next();
  });
