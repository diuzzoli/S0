import { z } from "zod";

/**
 * Variables de entorno validadas al arrancar. Si falta algo o es inválido,
 * la API no levanta (fail-fast) y el error dice exactamente qué corregir.
 * Nunca leer process.env directamente en otro archivo: importar `env`.
 */
const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.url(),
    // URL pública de la app. Web y API comparten origen: la API vive en APP_URL/api
    // (en dev lo resuelve el proxy de Vite; en prod, Caddy o los rewrites del hosting).
    // Mismo origen = sin CORS para la web y cookies de sesión first-party.
    APP_URL: z.url().default("http://localhost:5173"),
    // Orígenes EXTRA permitidos (p. ej. app móvil o un panel en otro dominio). Separados por coma.
    EXTRA_ORIGINS: z
      .string()
      .default("")
      .transform((v) =>
        v
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    BETTER_AUTH_SECRET: z.string().min(32, "Generar con: openssl rand -base64 32"),
    AUTH_CHECK_PWNED_PASSWORDS: z.stringbool().default(true),
    SMTP_URL: z.string().default("smtp://localhost:1025"),
    MAIL_FROM: z.string().default("App <no-reply@localhost>"),
    SENTRY_DSN: z
      .url()
      .optional()
      .or(z.literal("").transform(() => undefined)),
    // Requests por minuto por IP para la API (auth tiene su propio límite más estricto).
    RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(120),
    // true cuando la API corre detrás de Caddy/Nginx/Cloudflare (para leer la IP real).
    TRUST_PROXY: z.stringbool().default(false),
  })
  .superRefine((v, ctx) => {
    if (v.NODE_ENV !== "production") return;
    if ([v.APP_URL, ...v.EXTRA_ORIGINS].some((o) => o.startsWith("http://"))) {
      ctx.addIssue({
        code: "custom",
        message: "En producción APP_URL y EXTRA_ORIGINS deben usar https",
      });
    }
  });

export type Env = z.infer<typeof schema>;

export function loadEnv(source: Record<string, string | undefined> = process.env): Env {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    console.error("❌ Variables de entorno inválidas:\n", z.prettifyError(parsed.error));
    process.exit(1);
  }
  return parsed.data;
}

export const env = loadEnv();
