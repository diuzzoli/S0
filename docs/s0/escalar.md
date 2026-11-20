# Escalar de 100 a 1000+ usuarios

La plantilla aguanta cómodamente unos cientos de usuarios activos en un VPS de 4 GB. Señales y acciones, en orden de cuándo suelen hacer falta:

| Señal                                      | Acción                                                                                                                                                                                              |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Consultas lentas (Sentry / logs)           | `EXPLAIN ANALYZE`; índices compuestos que empiecen por `ownerId`/`organizationId`. Paginar por cursor (`createdAt`, `id`) en vez de offset.                                                         |
| `audit_log` muy grande (millones de filas) | Particionar por mes y mover particiones viejas a almacenamiento frío.                                                                                                                               |
| CPU de la API alta                         | Segunda instancia de la API detrás de Caddy (`deploy.replicas`). Antes de hacerlo: pasar el rate limit general a un store compartido (Redis/Valkey) o al WAF; el de Better Auth ya está en la base. |
| Muchas conexiones a Postgres               | PgBouncer entre API y base; bajar `max` del pool por instancia.                                                                                                                                     |
| Trabajos pesados afectan la API            | Módulo Tareas con un proceso `worker` separado.                                                                                                                                                     |
| Lecturas dominan (reportes, tableros)      | Vistas materializadas o una réplica de solo lectura.                                                                                                                                                |
| Archivos pesados                           | Módulo Archivos (nunca guardar binarios en Postgres).                                                                                                                                               |
| Usuarios lejos del servidor                | CDN delante de los assets estáticos (ya tienen cache inmutable).                                                                                                                                    |

Regla: **medir antes de optimizar.** Con Sentry (performance) y los logs con `requestId` se ve qué endpoint duele.
