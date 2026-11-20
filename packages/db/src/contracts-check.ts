/**
 * Verificación en tiempo de compilación: cada contrato de entrada debe ser
 * asignable a lo que la tabla acepta. Si cambiás una columna y no el contrato
 * (o al revés), `pnpm typecheck` falla acá. No genera código en runtime.
 *
 * Al crear un módulo nuevo, agregá su línea.
 */
import type { NoteCreateInput, NoteUpdateInput } from "@app/contracts";
import type { note } from "./schema/notes.ts";

type Assert<T extends true> = T;
type Fits<Input, Table> = Input extends Partial<Table> ? true : false;
type Insert<T extends { $inferInsert: unknown }> = T["$inferInsert"];

export type _Checks = [
  Assert<Fits<NoteCreateInput, Insert<typeof note>>>,
  Assert<Fits<NoteUpdateInput, Insert<typeof note>>>,
];
