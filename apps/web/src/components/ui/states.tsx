import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Toda lista o pantalla de datos debe contemplar 3 estados: cargando, vacío y error. */

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center">
      <p className="font-medium">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-destructive/40 p-4 text-sm">
      <p className="text-destructive">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-2 underline underline-offset-4">
          Reintentar
        </button>
      )}
    </div>
  );
}
