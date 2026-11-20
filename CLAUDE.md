# CLAUDE.md — reglas del proyecto

Proyecto creado con **S0 (Step Zero)**. Objetivo: MVP rápido que escale a 100–1000 usuarios **sin sacrificar seguridad ni usabilidad**. Antes de cambiar algo estructural, leé `docs/s0/` (stack, seguridad, UX, módulos).

## Cómo trabajar

1. **Pensá antes de codear.** Explicitá supuestos. Si el pedido admite más de una interpretación, preguntá en vez de adivinar.
2. **Lo mínimo que resuelve el problema.** Antes de escribir código: ¿hace falta? ¿ya existe en el repo? ¿lo resuelve la plataforma (HTML, CSS, Postgres)? ¿una dependencia instalada? Recién ahí, código nuevo. Nunca recortes validación, manejo de errores, seguridad ni accesibilidad para "simplificar".
3. **Cambios quirúrgicos.** Tocá solo lo que el pedido requiere y respetá el estilo existente. Si ves código muerto ajeno a la tarea, mencionalo; no lo borres.
4. **Criterio de éxito verificable.** Convertí cada tarea en algo comprobable (un test que falla y pasa, un comando que da OK) y no la des por terminada hasta verificarlo.
5. **Documentación actualizada:** para APIs de librerías usá Context7 en lugar de la memoria del modelo (las versiones cambian).

## Stack (no cambiar sin un ADR en `docs/s0/decisiones.md`)

| Capa      | Herramienta                                                                                                                                         |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Monorepo  | pnpm workspaces · TypeScript estricto · Biome (lint + formato)                                                                                      |
| API       | Hono sobre Node 22 · Zod · Better Auth · Drizzle ORM · PostgreSQL                                                                                   |
| Web       | React 19 SPA · Vite · TanStack Router (rutas por archivo) · TanStack Query · React Hook Form · shadcn/ui + Tailwind 4 · Zustand (solo estado de UI) |
| Contratos | `@app/contracts`: Zod puro compartido por web y API                                                                                                 |
| Calidad   | Vitest · Playwright (mobile + desktop) · Sentry                                                                                                     |

**Prohibido sin ADR:** Next.js/Express/NestJS, Axios (usar el cliente `hc`), Prisma/Sequelize, Redux, CSS-in-JS, otro ORM o validador, `fetch` manual a la API propia.

## Estructura

```
apps/api        Hono: src/routes/<módulo>.ts, src/middleware, src/lib
apps/web        React: src/routes (páginas), src/features/<módulo> (queries + componentes), src/components/ui
packages/db     Drizzle: src/schema/<módulo>.ts, drizzle/ (migraciones SQL versionadas)
packages/contracts  Zod: entradas/salidas de la API (sin dependencias de servidor)
docs/s0         Definición del stack, seguridad, UX, módulos opcionales, deploy
```

## Patrón de módulo (copiar de "notes", el módulo de ejemplo)

1. Tabla en `packages/db/src/schema/<módulo>.ts` con `ownerId` (o `organizationId` si hay multi-tenant). Exportarla en `schema/index.ts`.
2. Contrato en `packages/contracts/src/<módulo>.ts` — solo los campos que el usuario puede enviar.
3. Agregar la verificación en `packages/db/src/contracts-check.ts`.
4. `pnpm db:generate` → revisar el SQL generado → si la tabla tiene datos de negocio, nueva migración con `SELECT audit_enable('<tabla>');`.
5. Ruta en `apps/api/src/routes/<módulo>.ts` con `requireAuth`, `validate()`, filtro por dueño en la consulta y escrituras con `withActor()`. Montarla en `app.ts` (encadenada, para que el cliente RPC la vea).
6. Hooks en `apps/web/src/features/<módulo>/queries.ts` y página en `apps/web/src/routes/_app/<módulo>.tsx`.
7. Tests: integración de la API (aislamiento entre usuarios incluido) + e2e en mobile y desktop.

## Seguridad — no negociable

- Toda entrada externa se valida con Zod (`validate()` en la API). Nunca confiar en el cliente.
- **Autorización por registro:** filtrar por `ownerId`/`organizationId` dentro de la consulta. Si no es del usuario → 404.
- Nunca aceptar `id`, `ownerId`, `role`, `organizationId` desde el body (mass assignment).
- Escrituras de dominio con `withActor()` (auditoría). Nunca auditar tablas con secretos (`account`, tokens).
- Secretos solo en `.env` (validados en `apps/api/src/env.ts`). Nunca en el código, en logs, ni en variables `VITE_*`.
- No devolver errores internos al cliente; el detalle va a Sentry/log.
- SQL solo con el query builder de Drizzle o `sql\`\`` con parámetros. Nunca concatenar strings.
- No usar `dangerouslySetInnerHTML`. No agregar dependencias sin revisar mantenimiento y licencia.
- Ver checklist completo: `docs/s0/seguridad.md`.

## UX — mobile-first siempre

- Diseñar primero para 360–390 px de ancho; agrandar con `sm:`/`md:`/`lg:`.
- Diálogos con `ResponsiveDialog` (Drawer en mobile). Listas: tarjetas en mobile, tabla en desktop.
- Áreas táctiles ≥ 44 px, inputs con `type`/`inputMode`/`autoComplete` correctos, texto ≥ 16 px en inputs.
- Toda pantalla de datos contempla cargando / vacío / error.
- Formularios con `Field` (label + error accesible). Navegable con teclado y foco visible.
- Ver reglas completas: `docs/s0/ux-mobile-first.md`.

## Comandos

```bash
pnpm services:up        # Postgres + Mailpit (Docker)
pnpm db:migrate         # aplicar migraciones (y pnpm db:migrate:test para la base de tests)
pnpm dev                # API :3000 + web :5173 (la web hace proxy de /api)
pnpm check              # Biome   ·  pnpm check:fix para corregir
pnpm typecheck          # tipos de todo el monorepo
pnpm test               # unitarios + integración
pnpm --filter @app/web test:e2e   # Playwright mobile + desktop (con pnpm dev corriendo)
pnpm db:generate        # migración a partir de cambios en el schema
```

Antes de dar una tarea por terminada: `pnpm check && pnpm typecheck && pnpm test && pnpm build`.
