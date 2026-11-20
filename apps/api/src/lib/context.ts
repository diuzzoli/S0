import type { Session } from "./auth.ts";

/** Variables disponibles en `c.var` en todas las rutas. */
export type AppEnv = {
  Variables: {
    user: Session["user"] | null;
    session: Session["session"] | null;
    requestId: string;
  };
};

/** Igual que AppEnv pero garantiza usuario (usar en rutas detrás de requireAuth). */
export type AuthedEnv = {
  Variables: {
    user: Session["user"];
    session: Session["session"];
    requestId: string;
  };
};
