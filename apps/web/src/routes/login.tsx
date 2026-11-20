import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const schema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(1, "Ingresá tu contraseña"),
});

export const Route = createFileRoute("/login")({
  // Solo se aceptan redirects internos (evita open redirect a sitios externos).
  validateSearch: z.object({
    redirect: z
      .string()
      .refine((v) => v.startsWith("/") && !v.startsWith("//"))
      .optional()
      .catch(undefined),
  }),
  component: Login,
});

function Login() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const { error } = await authClient.signIn.email(values);
    if (error) {
      // Mensaje genérico: no revelar si el email existe.
      toast.error(
        error.status === 403
          ? "Confirmá tu email antes de ingresar"
          : "Email o contraseña incorrectos",
      );
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["session"] });
    await navigate({ to: redirect ?? "/dashboard" });
  });

  return (
    <AuthLayout
      title="Ingresar"
      footer={
        <>
          ¿No tenés cuenta?{" "}
          <Link to="/register" className="underline underline-offset-4">
            Registrate
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="grid gap-4" noValidate>
        <Field label="Email" error={form.formState.errors.email}>
          {(p) => (
            <Input
              {...p}
              type="email"
              autoComplete="email"
              inputMode="email"
              {...form.register("email")}
            />
          )}
        </Field>
        <Field label="Contraseña" error={form.formState.errors.password}>
          {(p) => (
            <Input
              {...p}
              type="password"
              autoComplete="current-password"
              {...form.register("password")}
            />
          )}
        </Field>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Ingresando…" : "Ingresar"}
        </Button>
        <Link to="/forgot-password" className="text-center text-sm underline underline-offset-4">
          Olvidé mi contraseña
        </Link>
      </form>
    </AuthLayout>
  );
}
