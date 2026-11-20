# Módulo: PWA (app instalable)

**Qué aporta:** el usuario "instala" la app desde el navegador: ícono en la pantalla de inicio, apertura a pantalla completa sin barra del navegador, carga más rápida en visitas siguientes y una pantalla offline amigable.

> Consultá con Context7 la API vigente de `vite-plugin-pwa`.

## Pasos

1. `pnpm --filter @app/web add -D vite-plugin-pwa`.
2. En `vite.config.ts` agregar `VitePWA({ registerType: "prompt", manifest: {...}, workbox: {...} })`:
   - `manifest`: `name`, `short_name`, `theme_color`, `background_color`, `display: "standalone"`, `start_url: "/"`, íconos 192/512 y `maskable`.
   - `workbox.navigateFallbackDenylist: [/^\/api\//]` — **la API nunca se cachea** (datos privados y sesiones).
   - Cachear solo assets estáticos (JS/CSS/fuentes/íconos).
3. Aviso "Hay una versión nueva — Actualizar" con `useRegisterSW` (prompt, no recarga sorpresiva).
4. Página offline simple para cuando no hay conexión.
5. Íconos: generar desde un SVG con `@vite-pwa/assets-generator`.

## Seguridad

- No guardar datos de la API en el cache del service worker ni en localStorage.
- Al cerrar sesión, limpiar la caché de TanStack Query (ya lo hace `app-shell.tsx`).

## Verificación

- Lighthouse → sección PWA "instalable".
- Probar instalación en Android (Chrome) e iOS (Safari → Compartir → Agregar a inicio).
