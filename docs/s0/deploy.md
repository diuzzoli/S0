# Deploy

El destino depende del cliente. S0 trae dos perfiles; se elige uno al crear el proyecto.

|                          | Perfil A — VPS                                                              | Perfil B — Vercel/Cloudflare + Postgres administrado    |
| ------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------- |
| Ideal para               | Clientes que quieren costo fijo, datos en un servidor propio o en Argentina | Clientes que prefieren cero mantenimiento de servidores |
| Costo típico             | VPS de 4 GB (Hetzner, Latincloud…)                                          | Plan del hosting + Postgres (Neon, Supabase…)           |
| Mantenimiento            | Actualizaciones del SO y de Docker a cargo tuyo                             | Mínimo                                                  |
| Backups                  | Databasus → bucket externo                                                  | Los del proveedor de Postgres (verificar retención)     |
| Incluido en la plantilla | `deploy/vps/` + `.github/workflows/release-vps.yml`                         | Guía de abajo                                           |

## Perfil A — VPS con Docker Compose

Arquitectura: **Caddy** (HTTPS automático, sirve la SPA y hace proxy de `/api`) → **API** (Node, usuario sin privilegios) → **PostgreSQL** (sin puertos públicos). Las migraciones corren solas antes de cada arranque. **Databasus** hace los backups.

### Primera vez

1. VPS con Ubuntu LTS, usuario no-root con SSH por clave, firewall con solo 22/80/443 abiertos (`ufw`), actualizaciones automáticas de seguridad.
2. Instalar Docker Engine + plugin compose.
3. DNS: registro A del dominio → IP del VPS.
4. En el VPS: carpeta `~/app` con `compose.prod.yml` (copiado de `deploy/vps/`) y un `.env` con:

   ```
   DOMAIN=app.cliente.com
   REGISTRY=ghcr.io/<owner>/<repo>
   POSTGRES_USER=app
   POSTGRES_PASSWORD=<openssl rand -base64 24>
   POSTGRES_DB=app
   APP_URL=https://app.cliente.com
   BETTER_AUTH_SECRET=<openssl rand -base64 32>
   SMTP_URL=smtp://usuario:clave@smtp.proveedor.com:587
   MAIL_FROM="Cliente <no-reply@cliente.com>"
   SENTRY_DSN=
   ```
5. `docker login ghcr.io` con un token de solo lectura de paquetes.
6. Crear un tag `v0.1.0` en GitHub → el workflow publica las imágenes → `docker compose -f compose.prod.yml up -d`.
7. Backups: túnel `ssh -L 4005:localhost:4005 usuario@vps`, abrir `http://localhost:4005`, configurar Postgres (host `postgres`) con destino S3/R2 y frecuencia diaria. **Probar una restauración.**

### Deploys siguientes

Automático: crear variable de repo `DEPLOY_ENABLED=true`, environment `production` (con aprobación manual si querés) y secrets `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`. Cada tag `vX.Y.Z` construye, publica y despliega.

## Perfil B — Vercel o Cloudflare + Postgres administrado

> Este perfil no viene armado en la plantilla porque las plataformas cambian seguido. Consultá con Context7 y la documentación del hosting la forma vigente de desplegar Hono.

1. **Postgres administrado** (Neon, Supabase, etc.): usar la URL **con pooling** para la API y la URL directa para migraciones. Bajar `max` del pool a 1–3 por instancia en entornos serverless.
2. **API:** Hono corre nativamente en Vercel Functions (Node) y en Cloudflare Workers. Exportar `app` desde un entrypoint de la plataforma en lugar de `server.ts`. En Workers usar un driver compatible (ej. Hyperdrive o el driver serverless del proveedor).
3. **Web:** desplegar `apps/web/dist` como sitio estático.
4. **Mismo origen:** configurar rewrites para que `/api/*` vaya a la función de la API y el resto a la SPA (fallback a `index.html`).
5. **Rate limit:** el límite general en memoria no sirve en serverless (cada instancia cuenta aparte). Usar el rate limit de la plataforma (WAF de Vercel / Rate Limiting de Cloudflare) o un store compartido.
6. **Migraciones:** paso del pipeline (`pnpm db:migrate` con la URL directa) antes de promover el deploy.
7. Headers de seguridad y CSP de la web: replicar los de `deploy/vps/Caddyfile` en la configuración del hosting.
8. Borrar `deploy/vps/` y `release-vps.yml` del proyecto.
