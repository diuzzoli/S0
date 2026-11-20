/**
 * MÓDULO DE EJEMPLO — hooks de datos. Patrón:
 *  - queryOptions con queryKey jerárquica por módulo.
 *  - mutaciones que invalidan la lista al terminar.
 *  - los tipos salen del cliente RPC: si cambia la API, rompe el build acá.
 */
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType } from "hono/client";
import { api, unwrap } from "@/lib/api";

export const notesKeys = {
  all: ["notes"] as const,
  list: () => [...notesKeys.all, "list"] as const,
};

export const notesListQuery = queryOptions({
  queryKey: notesKeys.list(),
  queryFn: () => unwrap(api.api.notes.$get({ query: {} })),
});

type CreateInput = InferRequestType<typeof api.api.notes.$post>["json"];

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (json: CreateInput) => unwrap(api.api.notes.$post({ json })),
    onSuccess: () => qc.invalidateQueries({ queryKey: notesKeys.all }),
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unwrap(api.api.notes[":id"].$delete({ param: { id } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: notesKeys.all }),
  });
}
