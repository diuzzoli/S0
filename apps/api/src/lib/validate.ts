import { zValidator } from "@hono/zod-validator";
import type { ValidationTargets } from "hono";
import { HTTPException } from "hono/http-exception";
import { type ZodType, z } from "zod";

/**
 * Validación con Zod y respuesta de error uniforme:
 *   400 { error: "Datos inválidos", issues: { campo: ["mensaje"] } }
 * No expone la estructura interna de Zod. Usar SIEMPRE este helper, no zValidator directo.
 */
export const validate = <Target extends keyof ValidationTargets, Schema extends ZodType>(
  target: Target,
  schema: Schema,
) =>
  zValidator(target, schema, (result) => {
    if (!result.success) {
      const issues = z.flattenError(result.error).fieldErrors;
      throw new HTTPException(400, {
        message: "Datos inválidos",
        cause: issues,
      });
    }
  });
