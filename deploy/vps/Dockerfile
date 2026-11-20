# Imagen multi-etapa para el perfil VPS. Targets:
#   docker build -f deploy/vps/Dockerfile --target api -t app-api .
#   docker build -f deploy/vps/Dockerfile --target web -t app-web .
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
# VITE_* se inyectan en build (son públicas: nunca poner secretos acá).
ARG VITE_SENTRY_DSN=""
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN
RUN pnpm --filter @app/api build && pnpm --filter @app/web build
RUN pnpm --filter=@app/api deploy --prod --legacy /prod/api \
 && cp -r packages/db/drizzle /prod/api/drizzle

# --- API: Node sin dependencias de desarrollo, usuario sin privilegios ---
FROM node:22-alpine AS api
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /prod/api/package.json ./
COPY --from=build --chown=node:node /prod/api/node_modules ./node_modules
COPY --from=build --chown=node:node /prod/api/dist ./dist
COPY --from=build --chown=node:node /prod/api/drizzle ./drizzle
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "--enable-source-maps", "dist/server.js"]

# --- WEB: Caddy sirve el build estático y hace proxy de /api a la API ---
FROM caddy:2-alpine AS web
COPY deploy/vps/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /repo/apps/web/dist /srv
