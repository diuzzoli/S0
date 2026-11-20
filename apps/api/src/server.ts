import "./instrument.ts";
import { serve } from "@hono/node-server";
import app from "./app.ts";
import { env } from "./env.ts";
import { pool } from "./lib/db.ts";

const server = serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.info(`API escuchando en http://localhost:${info.port}`);
});

// Apagado prolijo: termina requests en curso y cierra el pool (deploys sin errores).
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  });
}
