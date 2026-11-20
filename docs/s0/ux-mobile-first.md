# UX mobile-first

Las apps se usan tanto en el celular como en la PC. La regla es diseñar **primero para el celular** (360–390 px) y agregar comodidades para pantallas grandes, nunca al revés.

## Reglas

**Layout**

- Una columna en mobile; grillas con `sm:grid-cols-2 lg:grid-cols-3`.
- Sin scroll horizontal (lo verifica el test e2e). Tablas anchas → tarjetas en mobile.
- Navegación: barra inferior en mobile (zona del pulgar), sidebar en desktop. Ítems en `NAV_ITEMS` de `app-shell.tsx`.
- Respetar safe areas (`pb-safe`, `pb-safe-nav`) para el notch y la barra de gestos.
- Usar `dvh` en lugar de `vh` para alturas de pantalla completa.

**Interacción**

- Áreas táctiles ≥ 44×44 px (los `Button` ya lo cumplen en mobile).
- Acción principal de una pantalla: botón flotante en mobile, botón en el encabezado en desktop.
- Diálogos: siempre `ResponsiveDialog` (hoja inferior en mobile, modal en desktop).
- Confirmar acciones destructivas. Dar feedback de cada acción (toast de éxito o error).
- Deshabilitar el botón de envío mientras se procesa (evita dobles envíos).

**Formularios**

- Un campo por fila en mobile. Label visible siempre (no solo placeholder).
- `type`, `inputMode` y `autoComplete` correctos: el teclado del celular se adapta y el gestor de contraseñas funciona.
- Inputs con texto ≥ 16 px (si no, iOS hace zoom al enfocar).
- Validar con el mismo contrato Zod que la API; mostrar el error junto al campo (`Field` ya lo hace accesible).

**Estados**

- Toda pantalla de datos: cargando (skeleton), vacío (con acción para empezar) y error (con reintentar).
- Mensajes en lenguaje del usuario, no técnicos.

**Accesibilidad (mínimo)**

- Navegable con teclado y foco visible. Enlace "Saltar al contenido".
- Iconos solos con `aria-label`. Imágenes con `alt`.
- Contraste suficiente en ambos temas. Respeta `prefers-reduced-motion`.
- Nunca bloquear el zoom (`user-scalable=no` prohibido).

**Rendimiento percibido**

- Prefetch al pasar el mouse o tocar un link (`defaultPreload: "intent"`).
- Code-splitting por ruta (automático).
- Imágenes con `loading="lazy"`, tamaño explícito y formatos modernos (AVIF/WebP).

## Cómo se verifica

- E2E de Playwright corre cada test en **Pixel 7 y desktop**.
- Revisión de diseño con la skill **UI UX Pro Max** y la guía responsive de **Modern Web Guidance**.
- Antes de entregar: probar en un celular real (Chrome Android y Safari iOS) contra la URL de staging.

## Personalizar la marca de un cliente

Cambiar solo los tokens de `apps/web/src/styles.css` (`--primary`, `--radius`, etc.), el `appName` en `auth.ts`, el `<title>` y los colores `theme-color` de `index.html`, y el favicon. Los componentes no llevan colores fijos.
