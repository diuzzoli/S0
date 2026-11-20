import { noteCreateInput } from "@app/contracts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { useCreateNote } from "./queries";

/** El formulario usa EL MISMO esquema Zod que valida la API. */
export function NoteForm({ onDone }: { onDone: () => void }) {
  const create = useCreateNote();
  const form = useForm({
    resolver: zodResolver(noteCreateInput),
    defaultValues: { title: "", body: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await create.mutateAsync({ title: values.title, body: values.body ?? "" });
      toast.success("Nota creada");
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
    }
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <Field label="Título" error={form.formState.errors.title}>
        {(p) => <Input {...p} autoFocus {...form.register("title")} />}
      </Field>
      <Field label="Contenido" error={form.formState.errors.body}>
        {(p) => <Textarea {...p} rows={5} {...form.register("body")} />}
      </Field>
      {/* En mobile el botón ocupa el ancho completo (fácil de tocar). */}
      <Button
        type="submit"
        className="w-full md:w-auto md:justify-self-end"
        disabled={create.isPending}
      >
        {create.isPending ? "Guardando…" : "Guardar"}
      </Button>
    </form>
  );
}
