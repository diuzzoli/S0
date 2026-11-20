import { describe, expect, it } from "vitest";
import app from "../src/app.ts";

const ORIGIN = "http://localhost:5173";

describe("seguridad base", () => {
  it("rechaza acceso sin sesión a rutas protegidas", async () => {
    const res = await app.request("/api/notes");
    expect(res.status).toBe(401);
  });

  it("envía headers de seguridad", async () => {
    const res = await app.request("/api/notes");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("strict-transport-security")).toContain("max-age=");
    expect(res.headers.get("x-frame-options")).toBeTruthy();
  });

  it("bloquea POST con origen no permitido (CSRF)", async () => {
    const res = await app.request("/api/notes", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        origin: "https://evil.example",
      },
      body: "title=x",
    });
    expect(res.status).toBe(403);
  });

  it("no habilita CORS para orígenes desconocidos", async () => {
    const res = await app.request("/api/health", { headers: { origin: "https://evil.example" } });
    expect(res.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("responde 404 en JSON sin filtrar detalles", async () => {
    const res = await app.request("/api/no-existe", { headers: { origin: ORIGIN } });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "No encontrado" });
  });
});
