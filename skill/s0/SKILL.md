---

name: s0
description: Step Zero — crea un proyecto nuevo de app web (MVP que escala a 100–1000 usuarios) con el stack estándar de Dany (Hono + React + Drizzle + Better Auth), seguro y mobile-first, a partir de la plantilla S0. Usar al empezar cualquier app o sistema nuevo.
---

# S0 · Step Zero

Crea un proyecto nuevo desde la plantilla **S0** (repo `diuzzoli/S0`) para que el stack, la seguridad y la UX mobile-first no se definan de nuevo en cada proyecto. La definición completa vive en `docs/s0/` de la plantilla; esta skill es el procedimiento.

## 1. Entender el proyecto (preguntar antes de crear nada)

Hacé estas preguntas juntas (con AskUserQuestion si está disponible). No crees nada hasta tener las respuestas:

1. **Nombre** del proyecto (slug para el repo) y **nombre visible** de la app.
2. **Qué resuelve y quién lo usa** en una o dos frases (roles: ¿quién administra, quién carga datos, quién consulta?).
3. **Cuenta de GitHub** donde crear el repo, y si es privado (por defecto, privado).
4. **Destino de deploy:**
   - **VPS:** costo fijo, servidor propio, Docker + Caddy + backups con Databasus.
   - **Vercel/Cloudflare:** cero servidores que mantener, con Postgres administrado.
5. **Módulos opcionales** (selección múltiple). Mostrá cada uno con su explicación breve:
   - **Multi-tenant:** varias empresas o sucursales en la misma instalación, con datos aislados.
   - **Archivos:** subir y descargar documentos e imágenes a S3/R2/MinIO con URLs firmadas.
   - **Tareas en segundo plano:** mails masivos, reportes pesados y procesos programados sin bloquear al usuario.
   - **PWA:** se instala en el celular con ícono propio y abre a pantalla completa.
   - **Login social:** ingresar con Google o Microsoft.
   - **Doble factor (2FA):** código de una app autenticadora para cuentas sensibles.
   - **Pagos:** Mercado Pago o Stripe, con confirmación segura por webhook.
   - **Tiempo real:** la pantalla se actualiza sola cuando otro usuario cambia algo.
   - **SEO / páginas públicas:** landing indexable por Google (TanStack Start con Hono adentro).
   - **App en tiendas:** publicar en Google Play / App Store con Capacitor.

Si una respuesta contradice el stack (por ejemplo, "quiero Next.js"), señalalo y pedí confirmación: cualquier desvío se registra como ADR.

## 2. Crear el repo desde la plantilla

```bash
gh repo create <owner>/<slug> --private --template diuzzoli/S0 --clone
cd <slug>
```

Si `gh` no está disponible o la plantilla no está marcada como "template", clonar `diuzzoli/S0`, borrar `.git` y hacer `git init`.

## 3. Personalizar

- Root `package.json`: `"name": "<slug>"`.
- Nombre visible: `appName` en `apps/api/src/lib/auth.ts`, `<title>` en `apps/web/index.html`, texto "App" en `apps/web/src/components/app-shell.tsx`, `MAIL_FROM` en `.env.example`.
- Borrar la carpeta `skill/` (es esta skill; no pertenece al proyecto).
- Crear `docs/PROYECTO.md` con:
  - qué resuelve y los roles;
  - los módulos elegidos y los descartados;
  - el destino de deploy;
  - los supuestos abiertos.

## 4. Levantar el entorno y verificar que todo funciona antes de tocar nada

```bash
cp .env.example .env            # completar BETTER_AUTH_SECRET con: openssl rand -base64 32
pnpm install
pnpm services:up                # Postgres + Mailpit
pnpm db:migrate && pnpm db:migrate:test
pnpm check && pnpm typecheck && pnpm test && pnpm build
```

Si algo falla acá, arreglalo antes de seguir: es la línea base.

## 5. Aplicar el perfil de deploy

- **VPS:** se queda tal cual (`deploy/vps/` y `.github/workflows/release-vps.yml`). Reemplazar `OWNER/REPO` en `compose.prod.yml`.
- **Vercel/Cloudflare:**
  - borrar `deploy/vps/` y `release-vps.yml`;
  - seguir `docs/s0/deploy.md` (perfil B), consultando con Context7 la forma vigente de desplegar Hono.

## 6. Aplicar los módulos elegidos

Para cada módulo, en este orden: multi-tenant → archivos → tareas → login social → 2FA → pagos → tiempo real → PWA → SEO → tiendas.

1. Leer `docs/s0/modulos/<módulo>.md`.
2. Consultar con Context7 la API vigente de la librería que usa.
3. Implementar siguiendo el patrón del módulo de ejemplo `notes`, con sus tests (incluido el aislamiento entre usuarios u organizaciones).
4. `pnpm check && pnpm typecheck && pnpm test`.
5. Hacer **un commit por módulo**.

Multi-tenant va primero porque cambia `ownerId` por `organizationId` en todo lo que venga después.

## 7. Skills del agente

Verificar que están instaladas las del núcleo (`docs/s0/skills.md`):

- Superpowers
- Context7
- Modern Web Guidance
- Ponytail
- Security Audit de Cloudflare
- UI UX Pro Max
- Playwright

Cualquier skill de terceros nueva pasa primero por **SkillSpector**. Si da DO NOT INSTALL, no se instala.

## 8. Cerrar

- Primer commit (`chore: proyecto creado con S0`) y push.
- Recomendar proteger `main` en GitHub: PR obligatorio y CI en verde.
- Resumir al usuario en pocas líneas:
  - URL del repo;
  - módulos aplicados;
  - cómo levantarlo (`pnpm services:up && pnpm dev`);
  - el primer módulo real sugerido, que reemplaza al ejemplo `notes` según `docs/s0/modulos.md`.

## Reglas durante todo el proyecto

Las del `CLAUDE.md` del repo. Las críticas:

- seguridad no negociable (`docs/s0/seguridad.md`);
- mobile-first (`docs/s0/ux-mobile-first.md`);
- no cambiar el stack sin un ADR (`docs/s0/decisiones.md`).
