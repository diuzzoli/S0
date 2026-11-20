import { schema } from "@app/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, haveIBeenPwned } from "better-auth/plugins";
import { env } from "../env.ts";
import { db } from "./db.ts";
import { sendMail } from "./mailer.ts";

const isProd = env.NODE_ENV === "production";

export const auth = betterAuth({
  appName: "App",
  baseURL: env.APP_URL,
  basePath: "/api/auth",
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.APP_URL, ...env.EXTRA_ORIGINS],
  database: drizzleAdapter(db, { provider: "pg", schema, usePlural: false }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: "Restablecer contraseña",
        text: `Para elegir una nueva contraseña entrá a: ${url}\n\nSi no lo pediste, ignorá este mail.`,
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: "Confirmá tu email",
        text: `Confirmá tu cuenta entrando a: ${url}`,
      });
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 días
    updateAge: 60 * 60 * 24, // renueva la sesión una vez por día de uso
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },

  // Límite estricto en endpoints de auth (login, registro, reset). Guardado en DB
  // para que funcione igual con más de una instancia de la API.
  rateLimit: {
    enabled: env.NODE_ENV !== "test",
    storage: "database",
    window: 60,
    max: 30,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
      "/request-password-reset": { window: 300, max: 3 },
    },
  },

  advanced: {
    useSecureCookies: isProd,
    ...(env.TRUST_PROXY && { ipAddress: { ipAddressHeaders: ["x-forwarded-for"] } }),
  },

  plugins: [
    // Roles (user/admin), bloqueo de usuarios e impersonación auditada.
    admin({ defaultRole: "user", adminRoles: ["admin"] }),
    // Rechaza contraseñas filtradas (consulta k-anonymity: nunca envía la contraseña).
    ...(env.AUTH_CHECK_PWNED_PASSWORDS ? [haveIBeenPwned()] : []),
  ],
});

export type Session = typeof auth.$Infer.Session;
