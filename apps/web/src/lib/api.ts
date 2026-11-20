import type { AppType } from "@app/api/client";
import { type ClientResponse, DetailedError, hc, parseResponse } from "hono/client";

/**
 * Cliente RPC tipado de punta a punta: los tipos de request/response salen
 * directamente de las rutas de Hono, sin generar código.
 *   const notes = await unwrap(api.api.notes.$get({ query: {} }))
 */
export const api = hc<AppType>("/", {
  init: { credentials: "same-origin" },
});

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public issues?: Record<string, string[]>,
  ) {
    super(message);
  }
}

/** Devuelve los datos tipados de la respuesta OK o lanza ApiError (para TanStack Query). */
export async function unwrap<T extends ClientResponse<unknown>>(request: Promise<T>) {
  try {
    return await parseResponse(request);
  } catch (e) {
    if (e instanceof DetailedError) {
      const data = (e.detail as { data?: { error?: string; issues?: Record<string, string[]> } })
        ?.data;
      throw new ApiError(
        Number(e.statusCode ?? 500),
        data?.error ?? "Ocurrió un error",
        data?.issues,
      );
    }
    throw new ApiError(0, "Sin conexión. Revisá tu internet e intentá de nuevo.");
  }
}
