# S0 · Step Zero

Plantilla y definición de stack para arrancar apps web que empiezan como **MVP** y escalan a **100–1000 usuarios** sin reescribirse. Viene con **seguridad incluida** e interfaces **mobile-first** desde el primer commit.

- **API:** Hono · Better Auth · Drizzle · PostgreSQL · Zod
- **Web:** React 19 · Vite · TanStack Router + Query · React Hook Form · shadcn/ui + Tailwind 4 · Zustand
- **Calidad:** TypeScript estricto · Biome · Vitest · Playwright (mobile + desktop) · Sentry · CI con auditoría de dependencias y secretos

## Qué hay acá

|                                      |                                                                                                                                                                                                                                                                                                |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api`, `apps/web`, `packages/*` | La plantilla funcionando: login completo con verificación de email, roles, auditoría, seguridad HTTP, layout mobile-first y un módulo de ejemplo (`notes`) con el patrón a copiar.                                                                                                             |
| `docs/s0/`                           | La definición: [stack](docs/s0/stack.md) · [seguridad](docs/s0/seguridad.md) · [UX mobile-first](docs/s0/ux-mobile-first.md) · [módulos](docs/s0/modulos.md) · [skills](docs/s0/skills.md) · [deploy](docs/s0/deploy.md) · [escalar](docs/s0/escalar.md) · [decisiones](docs/s0/decisiones.md) |
| `CLAUDE.md`                          | Reglas para el agente en cada proyecto creado.                                                                                                                                                                                                                                                 |
| `skill/s0/SKILL.md`                  | La skill **S0** que crea proyectos nuevos desde esta plantilla.                                                                                                                                                                                                                                |
| `deploy/vps/`                        | Dockerfile, Caddy (HTTPS automático) y compose de producción con backups.                                                                                                                                                                                                                      |

## Crear un proyecto nuevo

Con la skill instalada, pedile a Claude: _"Usá S0 para crear el proyecto X"_. La skill hace las preguntas (deploy, módulos), crea el repo, aplica los módulos y verifica todo.

A mano:

```bash
gh repo create <owner>/<proyecto> --private --template diuzzoli/S0 --clone
cd <proyecto>
cp .env.example .env                 # BETTER_AUTH_SECRET: openssl rand -base64 32
pnpm install
pnpm services:up                     # Postgres + Mailpit (requiere Docker)
pnpm db:migrate && pnpm db:migrate:test
pnpm dev                             # web http://localhost:5173 · mails http://localhost:8025
```

## Verificar

```bash
pnpm check && pnpm typecheck && pnpm test && pnpm build
pnpm --filter @app/web test:e2e      # con pnpm dev corriendo
```

## Requisitos

Node 22+, pnpm 10+, Docker (para Postgres y Mailpit en desarrollo).
