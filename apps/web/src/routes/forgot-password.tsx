import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const schema = z.object({ email: z.email("Email inválido") });

export const Route = createFileRoute("/forgot-password")({ component: ForgotPassword });

function ForgotPassword() {
  const [done, setDone] = useState(false);
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  const onSubmit = form.handleSubmit(async ({ email }) => {
    await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
    // Siempre el mismo mensaje, exista o no la cuenta.
    setDone(true);
  });

  if (done) {
    return (
      <AuthLayout
        title="Revisá tu email"
        description="Si existe una cuenta con ese email, te enviamos un enlace para restablecer la contraseña."
      >
        <Link to="/login" className="text-center text-sm underline underline-offset-4">
          Volver a ingresar
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Restablecer contraseña">
      <form onSubmit={onSubmit} className="grid gap-4" noValidate>
        <Field label="Email" error={form.formState.errors.email}>
          {(p) => (
            <Input
              {...p}
              type="email"
              inputMode="email"
              autoComplete="email"
              {...form.register("email")}
            />
          )}
        </Field>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Enviar enlace
        </Button>
      </form>
    </AuthLayout>
  );
}
