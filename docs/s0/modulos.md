# Módulos

## Núcleo fijo (viene en todos los proyectos)

| Módulo                  | Qué aporta                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Autenticación**       | Registro, login, verificación de email, recuperación de contraseña y sesiones seguras.                               |
| **Roles**               | Usuarios `user` y `admin`; bloqueo de usuarios y rutas solo para administradores (`requireRole`).                    |
| **Auditoría**           | Registro inmodificable de quién cambió qué y cuándo, en la base de datos.                                            |
| **Seguridad HTTP**      | Headers, CSRF, rate limit, límite de tamaño, validación de entrada y errores sin fugas.                              |
| **Mails**               | Envío de mails transaccionales (Mailpit en desarrollo, SMTP real en producción).                                     |
| **Observabilidad**      | Errores de API y web en Sentry, sin datos personales.                                                                |
| **Layout mobile-first** | Navegación inferior en celular, sidebar en PC, diálogos adaptables, tema claro/oscuro.                               |
| **Calidad**             | Biome, tipos estrictos, tests de integración y e2e en mobile y desktop, CI con auditoría de dependencias y secretos. |
| **Backups**             | Respaldos programados de la base a un destino externo (perfil VPS: Databasus).                                       |

## Opcionales (se eligen al crear el proyecto)

Cada uno se aplica siguiendo su receta en `docs/s0/modulos/`, en un commit separado.

| Módulo                                           | Qué aporta al proyecto                                                                                                       | Elegilo si…                                                                                                    |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [**Multi-tenant**](modulos/multi-tenant.md)      | Varias empresas/clientes usan la misma instalación con sus datos totalmente aislados, cada una con sus miembros y roles.     | Es un SaaS (ej. CRM-LAB, timbre.digital) o un cliente con varias sucursales que no deben verse entre sí.       |
| [**Archivos**](modulos/archivos.md)              | Subir y descargar documentos e imágenes a un almacenamiento S3/R2/MinIO, con URLs firmadas que vencen.                       | Hay adjuntos, fotos, comprobantes, PDFs o gestión documental.                                                  |
| [**Tareas en segundo plano**](modulos/tareas.md) | Procesos que corren sin bloquear al usuario: envío masivo de mails, reportes pesados, recordatorios programados, reintentos. | Hay trabajos que tardan más de 1–2 segundos o deben ejecutarse en horarios fijos.                              |
| [**PWA**](modulos/pwa.md)                        | La app se instala en el celular con ícono propio, abre a pantalla completa y muestra una base offline.                       | Se usa mucho desde el celular y no hace falta publicar en las tiendas.                                         |
| [**Login social**](modulos/login-social.md)      | Ingresar con Google o Microsoft sin crear otra contraseña.                                                                   | Usuarios corporativos (Google Workspace / Microsoft 365) o público masivo.                                     |
| [**Doble factor (2FA)**](modulos/2fa.md)         | Un segundo paso al ingresar (app autenticadora) para cuentas con acceso sensible.                                            | Hay datos de salud, dinero, documentos legales o administradores con mucho poder.                              |
| [**Pagos**](modulos/pagos.md)                    | Cobros con Mercado Pago (o Stripe) con confirmación segura por webhook.                                                      | Se venden productos, suscripciones o se cobran servicios dentro de la app.                                     |
| [**Tiempo real**](modulos/tiempo-real.md)        | La pantalla se actualiza sola cuando otro usuario cambia algo (sin recargar).                                                | Tableros compartidos, estados de pedidos, notificaciones en vivo.                                              |
| [**SEO / páginas públicas**](modulos/seo-ssr.md) | Páginas públicas indexables por Google (landing, precios, blog) con renderizado en el servidor.                              | El producto necesita captar clientes desde buscadores.                                                         |
| [**App en tiendas**](modulos/app-tiendas.md)     | Publicar la misma app en Google Play y App Store empaquetándola con Capacitor.                                               | El cliente exige estar en las tiendas o se necesita hardware del teléfono (cámara avanzada, NFC, push nativo). |

## Reemplazar el módulo de ejemplo "notes"

Cuando crees tu primer módulo real, copiá el patrón y después borrá:

```
packages/db/src/schema/notes.ts        (y su export en schema/index.ts)
packages/contracts/src/notes.ts        (y su export en index.ts)
packages/db/src/contracts-check.ts     (las líneas de note)
apps/api/src/routes/notes.ts           (y su .route() en app.ts)
apps/api/test/notes.integration.test.ts  (adaptalo a tu módulo, no lo borres sin reemplazo)
apps/web/src/features/notes/
apps/web/src/routes/_app/notes.tsx     (y su ítem en NAV_ITEMS)
```

Luego `pnpm db:generate` para crear la migración que elimina la tabla `note`.
