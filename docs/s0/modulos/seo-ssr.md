# Módulo: SEO / páginas públicas

**Qué aporta:** páginas públicas que Google indexa bien (landing, precios, blog, fichas de producto), renderizadas en el servidor para que carguen rápido y tengan sus metadatos.

**Enfoque:** variante C del stack: TanStack Start en lugar de la SPA con Vite, **con Hono montado dentro** en `/api/$`. Un solo deploy.

> TanStack Start 1.0 es estable desde octubre 2026. Consultá con Context7 su API vigente antes de migrar.

## Regla de oro

**Todo el backend sigue en Hono.** No usar server functions de Start para lógica de negocio: el cliente `hc`, la validación, la auditoría y los tests quedan iguales. Start solo renderiza.

## Pasos

1. Migrar `apps/web` a TanStack Start (las rutas de TanStack Router se conservan casi sin cambios).
2. Ruta comodín `src/routes/api/$.ts` que delega cada request a `app.fetch` de Hono.
3. Páginas públicas con SSR y `head()` (título, descripción, Open Graph, canonical). El área logueada (`_app`) puede seguir renderizándose en el cliente.
4. `sitemap.xml` y `robots.txt`.
5. Opcional: la skill **Taste** para landings con diseño más distintivo.

## Alternativa más simple

Si solo hace falta una landing estática: hacerla aparte (HTML/Astro) en el dominio raíz y dejar la app en `app.dominio.com`.
