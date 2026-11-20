import { Label as LabelPrimitive } from "radix-ui";
import { type ReactNode, useId } from "react";
import type { FieldError } from "react-hook-form";
import { cn } from "@/lib/utils";

/**
 * Campo de formulario accesible: label asociado, error anunciado a lectores de
 * pantalla (aria-describedby + role="alert") y aria-invalid en el control.
 */
export function Field({
  label,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  error?: FieldError | undefined;
  hint?: string;
  className?: string;
  children: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby"?: string;
  }) => ReactNode;
}) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cn("grid gap-2", className)}>
      <LabelPrimitive.Root htmlFor={id} className="text-sm font-medium">
        {label}
      </LabelPrimitive.Root>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error.message}
        </p>
      )}
    </div>
  );
}
