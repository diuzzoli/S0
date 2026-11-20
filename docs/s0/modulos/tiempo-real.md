# Módulo: Tiempo real

**Qué aporta:** la pantalla se actualiza sola cuando algo cambia (otro usuario editó un registro, cambió el estado de un pedido, llegó una notificación), sin recargar.

**Enfoque:** Server-Sent Events (SSE) con `streamSSE` de Hono + invalidación de TanStack Query. Más simple que WebSockets y suficiente para notificaciones servidor → cliente.

## Pasos

1. Ruta `GET /api/events` con `requireAuth` que mantiene un stream SSE por usuario/organización.
2. Publicación de eventos:
   - Una instancia: un `EventEmitter` en memoria.
   - Varias instancias: `LISTEN/NOTIFY` de PostgreSQL (sin servicios extra).
3. Los eventos llevan solo `{ tipo, id }`, **nunca datos**: el cliente invalida la query correspondiente y la vuelve a pedir con sus permisos normales.
4. Hook `useLiveUpdates()` en la web con `EventSource` (reconexión automática incluida).
5. En el proxy (Caddy) SSE funciona sin configuración extra; en Vercel/Cloudflare revisar los límites de duración de conexión.

## Verificación

- Dos navegadores con usuarios de la misma organización: el cambio en uno aparece en el otro.
- Un usuario de otra organización no recibe el evento.
