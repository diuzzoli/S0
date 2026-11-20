import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
    name: z.string().trim().min(2, "Ingresá tu nombre").max(100),
    email: z.email("Email inválido"),
    password: z.string().min(10, "Mínimo 10 caracteres").max(128),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "No coinciden" });

export const Route = createFileRoute("/register")({ component: Register });

function Register() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirm: "" },
  });

  const onSubmit = form.handleSubmit(async ({ name, email, password }) => {
    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "/dashboard",
    });
    if (error) {
      toast.error(error.message ?? "No se pudo crear la cuenta");
      return;
    }
    setSentTo(email);
  });

  if (sentTo) {
    return (
      <AuthLayout
        title="Revisá tu email"
        description={`Te enviamos un enlace de confirmación a ${sentTo}.`}
      >
        <Link to="/login" className="text-center text-sm underline underline-offset-4">
          Volver a ingresar
        </Link>
      </AuthLayout>
    );
  }

  const { errors } = form.formState;
  return (
    <AuthLayout
      title="Crear cuenta"
      footer={
        <>
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="underline underline-offset-4">
            Ingresá
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="grid gap-4" noValidate>
        <Field label="Nombre" error={errors.name}>
          {(p) => <Input {...p} autoComplete="name" {...form.register("name")} />}
        </Field>
        <Field label="Email" error={errors.email}>
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
        <Field label="Contraseña" error={errors.password} hint="Mínimo 10 caracteres.">
          {(p) => (
            <Input
              {...p}
              type="password"
              autoComplete="new-password"
              {...form.register("password")}
            />
          )}
        </Field>
        <Field label="Repetir contraseña" error={errors.confirm}>
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
          {form.formState.isSubmitting ? "Creando…" : "Crear cuenta"}
        </Button>
      </form>
    </AuthLayout>
  );
}
