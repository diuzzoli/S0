import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: Outlet,
  notFoundComponent: () => (
    <div className="grid min-h-dvh place-items-center p-6 text-center">
      <div className="grid gap-3">
        <h1 className="text-2xl font-semibold">Página no encontrada</h1>
        <Link to="/" className="underline underline-offset-4">
          Volver al inicio
        </Link>
      </div>
    </div>
  ),
});
