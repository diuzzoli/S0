# Módulo: Archivos

**Qué aporta:** subir y descargar archivos (PDF, imágenes, comprobantes) a un almacenamiento compatible con S3 — Cloudflare R2, Backblaze B2, AWS S3 o MinIO en un VPS — sin que los archivos pasen por la API.

> Consultá con Context7 la API vigente de `@aws-sdk/client-s3` y `@aws-sdk/s3-request-presigner`.

## Flujo (URLs firmadas)

1. El cliente pide permiso: `POST /api/files/upload-url` con `{ nombre, tipo, tamaño }`.
2. La API valida tipo (lista blanca: `application/pdf`, `image/jpeg`, `image/png`, `image/webp`…) y tamaño (ej. ≤ 10 MB), crea el registro `file` con `status: "pending"` y devuelve una URL firmada de PUT que vence en 5 minutos.
3. El navegador sube directo al bucket.
4. El cliente confirma: `POST /api/files/:id/complete`; la API verifica con `HeadObject` que existe y que el tamaño coincide → `status: "ready"`.
5. Descarga: `GET /api/files/:id/download-url` verifica permisos y devuelve una URL firmada de GET (5 min) con `Content-Disposition: attachment`.

## Pasos

1. Variables en `env.ts`: `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`.
2. Tabla `file`: `id`, `ownerId`/`organizationId`, `key` (generada por el servidor: `org/<id>/<uuid>`), `originalName`, `mimeType`, `size`, `status`, timestamps. `audit_enable('file')`.
3. Rutas en `apps/api/src/routes/files.ts` siguiendo el patrón del módulo de ejemplo.
4. Componente `FileDropzone` en la web: en mobile, `<input type="file" accept="…" capture>` permite sacar la foto con la cámara.
5. Dev local: agregar MinIO al `docker-compose.yml`.

## Seguridad

- El nombre del objeto lo decide el servidor, nunca el usuario.
- Bucket **privado**; nada público por defecto.
- Nunca servir archivos subidos desde el dominio de la app (riesgo de XSS con SVG/HTML).
- Tarea periódica que borra los `pending` de más de 24 h (módulo Tareas).
