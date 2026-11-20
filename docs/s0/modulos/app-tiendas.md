# Módulo: App en tiendas

**Qué aporta:** la misma app publicada en Google Play y App Store, empaquetada con Capacitor. Acceso a funciones nativas (cámara, archivos, notificaciones push nativas, biometría) sin reescribir la interfaz.

> Consultá con Context7 la API vigente de Capacitor.

## Pasos

1. `pnpm --filter @app/web add @capacitor/core && pnpm --filter @app/web add -D @capacitor/cli` → `npx cap init` y `npx cap add android ios`.
2. Build de la SPA → `npx cap sync`.
3. **API en otro origen:** la app nativa no comparte origen con la API.
   - Agregar el origen de Capacitor a `EXTRA_ORIGINS`.
   - Usar `hc` con la URL absoluta de la API en el build nativo.
   - Sesión con el plugin `bearer` de Better Auth (token en almacenamiento seguro del dispositivo) en lugar de cookies.
4. Versionar la API (`/api/v1/...`) para no romper versiones viejas de la app instaladas en los teléfonos.
5. Íconos, splash screen y permisos nativos (cámara, notificaciones) con textos claros.

## Alternativa

Si hace falta una experiencia muy nativa (animaciones complejas, mucho hardware): Expo/React Native como app aparte que reutiliza `@app/contracts` y el cliente `hc`.
