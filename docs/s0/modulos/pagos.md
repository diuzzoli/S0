# Módulo: Pagos

**Qué aporta:** cobrar dentro de la app (productos, servicios o suscripciones) con Mercado Pago —lo habitual en Argentina— o Stripe, confirmando cada pago de forma segura en el servidor.

> Consultá con Context7 o la documentación oficial la API vigente del SDK de Mercado Pago (Checkout Pro / Suscripciones) o de Stripe Checkout.

## Flujo

1. El usuario elige qué pagar → `POST /api/payments/checkout`: la API calcula el **precio desde la base** (nunca desde el cliente), crea un registro `payment` con `status: "pending"` y una preferencia/sesión de checkout del proveedor con `external_reference = payment.id`.
2. Redirección al checkout del proveedor (no se tocan datos de tarjeta: fuera del alcance de PCI).
3. **Webhook** `POST /api/payments/webhook`: verificar la firma del proveedor, consultar el pago a su API, y recién ahí marcar `approved`/`rejected`. Idempotente (el proveedor puede reenviar).
4. La pantalla de "volver" solo muestra estado; **nunca** confirma el pago por sí misma.

## Seguridad

- Secretos (`MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`) solo en `.env`.
- El webhook queda fuera de `csrfProtection` y `requireAuth`, pero con verificación de firma obligatoria.
- `audit_enable('payment')`.

## Verificación

- Pruebas con usuarios y tarjetas de test del proveedor.
- Reenviar el mismo webhook dos veces → un solo efecto.
