# Módulo: Login social

**Qué aporta:** ingresar con la cuenta de Google o Microsoft. Menos fricción y, en empresas que ya usan Google Workspace o Microsoft 365, una contraseña menos que gestionar.

> Consultá con Context7 la configuración vigente de `socialProviders` en Better Auth.

## Pasos

1. Crear las credenciales OAuth (Google Cloud Console / Microsoft Entra). Redirect URI: `https://<dominio>/api/auth/callback/<proveedor>`.
2. Variables en `env.ts`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (idem Microsoft). Opcionales: si faltan, el botón no se muestra.
3. `socialProviders: { google: {...}, microsoft: {...} }` en `auth.ts`.
4. Botones en `login.tsx` y `register.tsx` con `authClient.signIn.social({ provider, callbackURL: "/dashboard" })`.
5. Si la app es solo para una empresa: restringir el dominio del email (hook de Better Auth) para que no entre cualquier cuenta de Gmail.

## Verificación

- Login con cuenta permitida → entra; cuenta de otro dominio (si se restringió) → rechazada.
- Vincular una cuenta social a un usuario existente con el mismo email verificado.
