import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const schema = z
  .object({
    password: z.string().min(10, "Mínimo 10 caracteres").max(128),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "No coinciden" });

export const Route = createFileRoute("/reset-password")({
  validateSearch: z.object({ token: z.string().optional().catch(undefined) }),
  component: ResetPassword,
});

function ResetPassword() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = form.handleSubmit(async ({ password }) => {
    if (!token) return;
    const { error } = await authClient.resetPassword({ newPassword: password, token });
    if (error) {
      toast.error("El enlace venció o no es válido. Pedí uno nuevo.");
      return;
    }
    toast.success("Contraseña actualizada");
    await navigate({ to: "/login" });
  });

  if (!token) {
    return (
      <AuthLayout title="Enlace inválido">
        <Link to="/forgot-password" className="text-center text-sm underline underline-offset-4">
          Pedir un enlace nuevo
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Nueva contraseña">
      <form onSubmit={onSubmit} className="grid gap-4" noValidate>
        <Field label="Contraseña" error={form.formState.errors.password}>
          {(p) => (
            <Input
              {...p}
              type="password"
              autoComplete="new-password"
              {...form.register("password")}
            />
          )}
        </Field>
        <Field label="Repetir contraseña" error={form.formState.errors.confirm}>
          {(p) => (
            <Input
              {...p}
              type="password"
              autoComplete="new-password"
              {...form.register("confirm")}
            />
          )}
        </Field>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Guardar
        </Button>
      </form>
    </AuthLayout>
  );
}
