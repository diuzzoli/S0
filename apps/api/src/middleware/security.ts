import { getConnInfo } from "@hono/node-server/conninfo";
import type { Context } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { secureHeaders } from "hono/secure-headers";
import { rateLimiter } from "hono-rate-limiter";
import { env } from "../env.ts";

const allowedOrigins = [env.APP_URL, ...env.EXTRA_ORIGINS];

export function clientIp(c: Context): string {
  if (env.TRUST_PROXY) {
    const forwarded = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
    if (forwarded) return forwarded;
  }
  try {
    return getConnInfo(c).remote.address ?? "unknown";
  } catch {
    return "unknown";
  }
}

/** Headers de seguridad (HSTS, nosniff, frame-ancestors, CSP restrictiva para la API). */
export const securityHeaders = secureHeaders({
  contentSecurityPolicy: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] },
  strictTransportSecurity: "max-age=63072000; includeSubDomains",
  referrerPolicy: "strict-origin-when-cross-origin",
  crossOriginResourcePolicy: "same-origin",
});

/** CORS solo para orígenes extra (la web comparte origen con la API y no lo necesita). */
export const corsPolicy = cors({
  origin: (origin) => (allowedOrigins.includes(origin) ? origin : null),
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  maxAge: 600,
});

/** Rechaza POST/PUT/DELETE con cookies desde orígenes no permitidos. */
export const csrfProtection = csrf({ origin: allowedOrigins });

/** Máximo 1 MB por request (los archivos van directo a storage con URL firmada). */
export const requestSizeLimit = bodyLimit({
  maxSize: 1024 * 1024,
  onError: (c) => c.json({ error: "Request demasiado grande" }, 413),
});

/** Límite general por IP. Con más de una instancia, cambiar el store (ver docs/s0/escalar.md). */
export const apiRateLimit = rateLimiter({
  windowMs: 60_000,
  limit: env.RATE_LIMIT_PER_MINUTE,
  standardHeaders: "draft-7",
  keyGenerator: clientIp,
  handler: (c) => c.json({ error: "Demasiadas solicitudes, probá en un minuto" }, 429),
});
