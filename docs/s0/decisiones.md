# Decisiones de arquitectura (ADR)

Formato corto: contexto → decisión → consecuencias. Agregar una entrada por cada desvío del stack S0 en un proyecto.

## ADR-001 · SPA + Hono como base (no TanStack Start ni Next.js)

- **Contexto:** la mayoría de las apps viven detrás de un login y no necesitan SEO; se quiere una sola API para web, PWA y futuras apps móviles.
- **Decisión:** SPA con Vite + TanStack Router/Query y API Hono separada en el mismo origen. SSR solo con el módulo SEO (TanStack Start con Hono adentro).
- **Consecuencias:** un solo lugar para la lógica de negocio; la carga inicial depende del JS (presupuesto ≤ 200 KB gzip).

## ADR-002 · Mismo origen para web y API

- **Decisión:** la API vive en `/api` del mismo dominio (proxy de Vite en dev, Caddy/rewrites en prod).
- **Consecuencias:** sin CORS para la web y cookies first-party; las apps nativas usan `EXTRA_ORIGINS` + bearer.

## ADR-003 · Contratos Zod puros en `@app/contracts`

- **Contexto:** derivar Zod desde Drizzle (drizzle-zod) metía el ORM en el bundle del navegador (~90 KB gzip).
- **Decisión:** contratos en Zod puro + verificación de compatibilidad con las tablas en compilación (`contracts-check.ts`).
- **Consecuencias:** un poco de duplicación controlada; el typecheck detecta desincronizaciones.

## ADR-004 · Auditoría por triggers de PostgreSQL

- **Decisión:** `audit_log` append-only escrito por triggers; el actor se propaga con `set_config` por transacción (`withActor`).
- **Consecuencias:** ninguna escritura escapa a la auditoría; las escrituras de dominio deben ir dentro de `withActor`.

## ADR-005 · Cliente RPC `hc` en lugar de Axios

- **Decisión:** los tipos de request/response salen de las rutas de Hono; `unwrap()` normaliza errores para TanStack Query.
- **Consecuencias:** si cambia la API, el frontend no compila hasta adaptarse.

## ADR-006 · Superpowers como flujo del agente (no ECC)

- **Decisión:** núcleo chico de skills sin superposiciones; ECC descartado por tamaño y patrones de otros stacks.
