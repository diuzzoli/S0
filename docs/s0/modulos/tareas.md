# Módulo: Tareas en segundo plano

**Qué aporta:** procesos que no bloquean al usuario ni dependen de que tenga la pantalla abierta: mails masivos, reportes pesados, importaciones, recordatorios a horario fijo, reintentos automáticos ante fallas de terceros.

**Herramienta:** `pg-boss` — cola de trabajos sobre el mismo PostgreSQL (no suma Redis ni otro servicio).

> Consultá con Context7 la API vigente de pg-boss.

## Pasos

1. `pnpm --filter @app/api add pg-boss`.
2. `apps/api/src/lib/jobs.ts`: instancia única de PgBoss con `DATABASE_URL`, `start()` al levantar el servidor y `stop()` en el apagado prolijo de `server.ts`.
3. Un archivo por trabajo en `apps/api/src/jobs/<nombre>.ts` con: nombre de la cola, contrato Zod del payload (validar al encolar Y al procesar) y handler idempotente (que pueda correr dos veces sin duplicar efectos).
4. Encolar desde las rutas: `await boss.send("enviar-resumen", payload)`.
5. Programados: `boss.schedule("limpieza-diaria", "0 3 * * *")` (hora del servidor; documentar la zona horaria).
6. Mover el envío de mails de Better Auth a una cola para que el registro no espere al SMTP.
7. Con más de una instancia de la API, separar un proceso `worker` (mismo código, otro entrypoint) en el compose.

## Verificación

- Test de cada handler con un payload válido y uno inválido.
- Simular falla del servicio externo y comprobar el reintento.
