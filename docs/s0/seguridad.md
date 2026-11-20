# Seguridad en S0

Tres niveles: lo que la plantilla **ya trae resuelto**, lo que **cada funcionalidad nueva** tiene que cumplir y lo que se revisa **antes de cada salida a producción**.

## 1. Ya resuelto en la plantilla (verificado con tests)

| Riesgo                                          | Protección                                                                                                                         | Dónde                                               |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Contraseñas débiles o filtradas                 | Mínimo 10 caracteres; rechazo de contraseñas filtradas (haveibeenpwned por k-anonymity: la contraseña nunca sale del servidor)     | `apps/api/src/lib/auth.ts`                          |
| Cuentas falsas                                  | Verificación de email obligatoria para ingresar                                                                                    | idem (test: "no permite login sin verificar")       |
| Fuerza bruta                                    | Rate limit de Better Auth en DB (login 5/min, registro 3/min, reset 3/5 min) + límite general por IP                               | `auth.ts`, `middleware/security.ts`                 |
| Robo de sesión                                  | Cookies httpOnly, `Secure` en producción, SameSite; sesiones revocadas al cambiar contraseña                                       | Better Auth                                         |
| CSRF                                            | Middleware `csrf` de Hono + verificación de origen de Better Auth                                                                  | test: "bloquea POST con origen no permitido"        |
| CORS abierto                                    | Web y API en el mismo origen; CORS solo para `EXTRA_ORIGINS` explícitos                                                            | test: "no habilita CORS para orígenes desconocidos" |
| Clickjacking, sniffing, downgrade               | `secureHeaders`: HSTS, nosniff, frame-ancestors none, CSP restrictiva en la API; CSP de la web en Caddy                            | test: "envía headers de seguridad"                  |
| Acceso a datos ajenos (IDOR)                    | Filtro por dueño dentro de la consulta; 404 si no es suyo                                                                          | test: aislamiento entre alice y bob                 |
| Mass assignment                                 | Contratos Zod con campos explícitos; `ownerId` siempre del servidor                                                                | test: "el ownerId enviado se ignora"                |
| Entrada maliciosa                               | Validación Zod en toda ruta; body ≤ 1 MB; consultas parametrizadas (Drizzle)                                                       | `lib/validate.ts`                                   |
| Fuga de información                             | Errores genéricos al cliente con `requestId`; detalle solo a Sentry/log; mensajes de login/reset que no revelan si el email existe | `app.ts`, rutas de auth en la web                   |
| Open redirect                                   | `?redirect=` del login solo acepta rutas internas                                                                                  | test e2e                                            |
| Sin trazabilidad                                | `audit_log` append-only por triggers con el actor de cada cambio                                                                   | `drizzle/0001_audit.sql`                            |
| Config insegura                                 | Variables de entorno validadas al arrancar; en producción exige https                                                              | `apps/api/src/env.ts`                               |
| Datos personales en terceros                    | Sentry configurado sin usuario, cookies, headers ni bodies                                                                         | `instrument.ts`, `main.tsx`                         |
| Dependencias vulnerables / secretos commiteados | CI: `pnpm audit` + gitleaks; Dependabot semanal                                                                                    | `.github/`                                          |
| Contenedores                                    | API corre con usuario sin privilegios; Postgres sin puertos publicados                                                             | `deploy/vps/`                                       |

## 2. Checklist por funcionalidad nueva

- [ ] ¿Toda entrada (body, query, params, headers usados) pasa por `validate()` con un contrato de `@app/contracts`?
- [ ] ¿El contrato incluye SOLO campos que el usuario puede enviar?
- [ ] ¿La consulta filtra por `ownerId` / `organizationId` / rol **en el WHERE**?
- [ ] ¿Las escrituras usan `withActor()` y la tabla tiene `audit_enable()`?
- [ ] ¿Las acciones de administración usan `requireRole("admin")`?
- [ ] ¿Hay test de integración que pruebe que otro usuario NO puede leer/editar/borrar?
- [ ] ¿Los listados tienen `limit` máximo?
- [ ] ¿Se sube algún archivo? → URL firmada, tipo y tamaño validados, nunca servirlo desde el mismo origen sin `Content-Disposition` (ver módulo Archivos).
- [ ] ¿Se llama a un servicio externo? → timeout, manejo de error y secretos en `.env`.
- [ ] ¿Se renderiza HTML de usuario? → no. Si es imprescindible, sanitizar con DOMPurify.
- [ ] ¿Se agregó una dependencia? → mantenida, licencia compatible, sin vulnerabilidades (`pnpm audit`).

## 3. Antes de producción

- [ ] `BETTER_AUTH_SECRET` único por entorno (`openssl rand -base64 32`), guardado fuera del repo.
- [ ] `APP_URL` con https; `TRUST_PROXY=true` si hay proxy delante.
- [ ] SMTP real con SPF/DKIM configurados en el dominio (si no, los mails van a spam).
- [ ] Backups automáticos funcionando **y una restauración probada**.
- [ ] Sentry con alertas activas.
- [ ] Rama `main` protegida: PR obligatorio + CI en verde.
- [ ] Auditoría con la skill de seguridad de Cloudflare sobre el repo y hallazgos resueltos.
- [ ] Primer usuario admin creado a mano (`UPDATE "user" SET role='admin' WHERE email=...`), nunca por endpoint público.
- [ ] Políticas de privacidad/términos si se recolectan datos personales (Ley 25.326 en Argentina).
