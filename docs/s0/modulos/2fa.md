# Módulo: Doble factor (2FA)

**Qué aporta:** además de la contraseña, se pide un código de 6 dígitos de una app autenticadora (Google Authenticator, 1Password, Authy). Si roban la contraseña, no alcanza para entrar.

> Consultá con Context7 la API vigente del plugin `twoFactor` de Better Auth.

## Pasos

1. Plugin `twoFactor()` en `auth.ts` y `twoFactorClient()` en el cliente; regenerar el schema de auth y migrar.
2. Pantalla "Seguridad" en el perfil: activar 2FA (mostrar QR + pedir un código para confirmar) y descargar **códigos de respaldo**.
3. Pantalla de verificación en el login cuando la cuenta tiene 2FA.
4. Opcional: exigir 2FA a todos los `admin` (bloquear rutas admin si no está activo).

## Verificación

- Login con 2FA activo pide el código; código incorrecto → rechazo; código de respaldo → entra y se consume.
