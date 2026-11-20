# Stack S0

Stack único para proyectos que empiezan como MVP y deben llegar a 100–1000 usuarios sin reescribirse. Cada elección tiene un motivo; si un proyecto necesita otra cosa, se registra un ADR en `decisiones.md`.

## Arquitectura

```
Navegador (celular / desktop)
   │  mismo origen: https://app.cliente.com
   ├── /            → SPA React (archivos estáticos)
   └── /api/*       → API Hono (Node)
                        ├── /api/auth/*  Better Auth (sesiones en cookie httpOnly)
                        └── /api/<módulo> rutas de negocio
                                 │
                            PostgreSQL (Drizzle) + audit_log por triggers
```

Web y API se sirven desde **el mismo origen** (Vite proxy en desarrollo; Caddy o rewrites del hosting en producción). Resultado: sin CORS para la web, cookies de sesión first-party y una superficie de ataque más chica.

## Herramientas y por qué

| Herramienta                   | Rol                            | Por qué esta                                                                                                                                                                                    |
| ----------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TypeScript** (estricto)     | Lenguaje en todo el stack      | Los errores de tipos aparecen antes de producción y el agente puede iterar sobre ellos. Los tipos viajan de la base al navegador.                                                               |
| **pnpm workspaces**           | Monorepo                       | Un solo repo con API, web y paquetes compartidos; instalación estricta (sin dependencias fantasma).                                                                                             |
| **Node 22**                   | Runtime del servidor           | LTS estable; Hono también corre en Bun/Deno/Workers si algún día hace falta.                                                                                                                    |
| **Hono**                      | API HTTP                       | "Con baterías": CORS, CSRF, headers de seguridad, body limit, request id, JWT, cookies. TypeScript-first y con **cliente RPC tipado** (`hc`) que reemplaza a Axios y a la generación de código. |
| **PostgreSQL**                | Base de datos                  | Robusta de 10 a millones de filas; triggers para auditoría; JSONB; RLS si se necesita multi-tenant.                                                                                             |
| **Drizzle ORM + Drizzle Kit** | Acceso a datos y migraciones   | Sintaxis cercana a SQL (joins en una consulta), tipos inferidos y migraciones SQL versionadas y revisables.                                                                                     |
| **Better Auth**               | Autenticación                  | Registro, login, verificación de email, reset, sesiones, roles (plugin admin), rate limit propio, 2FA y organizaciones como plugins. Las tablas viven en tu schema de Drizzle.                  |
| **Zod**                       | Validación                     | Un mismo contrato valida la API (`validate()`), los formularios (React Hook Form) y las variables de entorno.                                                                                   |
| **React 19 + Vite**           | Interfaz                       | Ecosistema más amplio y mejor dominado por los modelos; Vite da builds rápidos.                                                                                                                 |
| **TanStack Router**           | Rutas                          | Rutas por archivo, parámetros y search params tipados, guards en `beforeLoad`, code-splitting automático.                                                                                       |
| **TanStack Query**            | Estado del servidor            | Caché, carga, errores, reintentos, deduplicación e invalidación.                                                                                                                                |
| **React Hook Form**           | Formularios                    | Estado de campos, errores, envío y bloqueo de doble submit con poco código.                                                                                                                     |
| **shadcn/ui + Tailwind 4**    | Design system                  | Componentes que viven en el repo (control total). Tokens en `styles.css` para adaptar la marca de cada cliente.                                                                                 |
| **Zustand**                   | Estado de UI                   | Solo tema, menús y preferencias visuales. Los datos del servidor nunca van acá.                                                                                                                 |
| **Biome**                     | Lint + formato                 | Una herramienta, muy rápida, sin configuración repartida.                                                                                                                                       |
| **Vitest + Playwright**       | Tests                          | Unitarios/integración contra Postgres real; e2e en viewport mobile y desktop.                                                                                                                   |
| **Sentry**                    | Errores en producción          | Configurado sin datos personales; se activa con `SENTRY_DSN`.                                                                                                                                   |
| **Docker**                    | Servicios locales y deploy VPS | Mismo Postgres en todos lados; `docker compose up` y listo.                                                                                                                                     |
| **Databasus**                 | Backups (perfil VPS)           | Backups programados de Postgres con UI y destino externo (S3/R2).                                                                                                                               |

## Decisión importante: contratos sin ORM en el navegador

Los esquemas Zod viven en `@app/contracts` como Zod puro, **no derivados con drizzle-zod**. Derivarlos metía Drizzle en el bundle del celular (~90 KB gzip extra en la pantalla de notas). Para que contrato y tabla no se desincronicen, `packages/db/src/contracts-check.ts` lo verifica en compilación: si no coinciden, `pnpm typecheck` falla.

## Presupuesto de rendimiento (referencia)

- JS inicial ≤ 200 KB gzip (hoy ~150 KB con auth, router, query y zod).
- Cada pantalla se carga en su propio chunk (code-splitting automático por ruta).
- Sentry se carga en un chunk aparte y solo si hay DSN.

## Qué NO usar (y qué usar en su lugar)

| No                                            | Sí                                                             |
| --------------------------------------------- | -------------------------------------------------------------- |
| Next.js / Express / NestJS                    | Hono + SPA (o la variante SEO con TanStack Start, ver módulos) |
| Axios / `fetch` manual a la API               | Cliente RPC `hc` + `unwrap()`                                  |
| Prisma / Sequelize / TypeORM                  | Drizzle                                                        |
| Redux / Context para datos del servidor       | TanStack Query                                                 |
| ESLint + Prettier                             | Biome                                                          |
| Librerías de componentes cerradas (MUI, Antd) | shadcn/ui en el repo                                           |
