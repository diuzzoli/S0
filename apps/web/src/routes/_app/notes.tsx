/**
 * MÓDULO DE EJEMPLO — pantalla de listado responsive:
 *  - Mobile: tarjetas apiladas + botón flotante de alta (zona del pulgar).
 *  - Desktop: tabla + botón en el encabezado.
 *  - Estados de carga, vacío y error siempre presentes.
 */
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { NoteForm } from "@/features/notes/note-form";
import { notesListQuery, useDeleteNote } from "@/features/notes/queries";

export const Route = createFileRoute("/_app/notes")({
  loader: ({ context }) => context.queryClient.ensureQueryData(notesListQuery),
  pendingComponent: () => (
    <div className="grid gap-3">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <ErrorState message={error instanceof Error ? error.message : "Error"} onRetry={reset} />
  ),
  component: NotesPage,
});

const dateFmt = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" });

function NotesPage() {
  const { data: notes } = useQuery(notesListQuery);
  const [open, setOpen] = useState(false);
  const remove = useDeleteNote();

  async function onDelete(id: string) {
    if (!window.confirm("¿Eliminar esta nota?")) return;
    try {
      await remove.mutateAsync(id);
      toast.success("Nota eliminada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo eliminar");
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Notas</h1>
        <Button className="hidden md:inline-flex" onClick={() => setOpen(true)}>
          <Plus aria-hidden /> Nueva nota
        </Button>
      </div>

      {!notes?.length ? (
        <EmptyState
          title="Todavía no hay notas"
          description="Creá la primera para ver el patrón completo funcionando."
          action={<Button onClick={() => setOpen(true)}>Crear nota</Button>}
        />
      ) : (
        <>
          {/* Mobile: tarjetas */}
          <ul className="grid gap-3 md:hidden">
            {notes.map((n) => (
              <li key={n.id} className="flex items-start gap-3 rounded-xl border p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{n.title}</p>
                  {n.body && <p className="line-clamp-2 text-sm text-muted-foreground">{n.body}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {dateFmt.format(new Date(n.createdAt))}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Eliminar ${n.title}`}
                  onClick={() => onDelete(n.id)}
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>

          {/* Desktop: tabla */}
          <div className="hidden overflow-x-auto rounded-xl border md:block">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th scope="col" className="p-3 font-medium">
                    Título
                  </th>
                  <th scope="col" className="p-3 font-medium">
                    Contenido
                  </th>
                  <th scope="col" className="p-3 font-medium">
                    Creada
                  </th>
                  <th scope="col" className="p-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {notes.map((n) => (
                  <tr key={n.id} className="border-b last:border-0">
                    <td className="p-3 font-medium">{n.title}</td>
                    <td className="max-w-xs truncate p-3 text-muted-foreground">{n.body}</td>
                    <td className="whitespace-nowrap p-3 text-muted-foreground">
                      {dateFmt.format(new Date(n.createdAt))}
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Eliminar ${n.title}`}
                        onClick={() => onDelete(n.id)}
                      >
                        <Trash2 />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Botón flotante mobile, por encima de la barra inferior. */}
      <Button
        size="icon"
        aria-label="Nueva nota"
        className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 size-14 rounded-full shadow-lg md:hidden"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-6" />
      </Button>

      <ResponsiveDialog open={open} onOpenChange={setOpen} title="Nueva nota">
        <NoteForm onDone={() => setOpen(false)} />
      </ResponsiveDialog>
    </div>
  );
}
