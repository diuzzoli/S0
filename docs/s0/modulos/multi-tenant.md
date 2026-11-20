# Módulo: Multi-tenant

**Qué aporta:** varias organizaciones (empresas, sucursales, clientes) comparten la instalación con datos aislados. Cada usuario pertenece a una o más organizaciones con un rol (owner, admin, member) y trabaja sobre una "organización activa".

> Antes de implementar, consultá con Context7 la API vigente del plugin `organization` de Better Auth.

## Pasos

1. **Auth:** agregar el plugin `organization()` en `apps/api/src/lib/auth.ts` y `organizationClient()` en `apps/web/src/lib/auth-client.ts`.
2. **Schema:** regenerar las tablas de auth (comando en el encabezado de `packages/db/src/schema/auth.ts`), volver a aplicar `withTimezone: true` y `pnpm db:generate`.
3. **Tablas de dominio:** reemplazar `ownerId` por `organizationId` (FK a `organization.id`, `notNull`, índice compuesto `(organizationId, createdAt)`). Si el registro también tiene autor, conservar `createdBy`.
4. **Middleware `requireOrg`** en `apps/api/src/middleware/auth.ts`: toma `session.activeOrganizationId`, verifica membresía y deja `c.var.organizationId`. 403 si no hay organización activa.
5. **Rutas:** todo WHERE filtra por `organizationId` de `c.var` (nunca del body ni de la URL sin verificar membresía).
6. **Defensa en profundidad (recomendado):** Row Level Security en Postgres.
   - `ALTER TABLE x ENABLE ROW LEVEL SECURITY;`
   - Política: `USING (organization_id = current_setting('app.org_id', true))`.
   - Extender `withActor()` para que también haga `set_config('app.org_id', …, true)` y usar un rol de base de datos de la app que NO sea owner de las tablas (los owners se saltean RLS).
7. **Web:** selector de organización en el header (`authClient.organization.setActive`), invitaciones por mail y pantalla de miembros.

## Verificación

- Test: usuario de la org A no ve, edita ni borra datos de la org B (aunque conozca el id).
- Test: un `member` no puede invitar ni cambiar roles.
- Con RLS: una consulta sin `app.org_id` devuelve 0 filas.
