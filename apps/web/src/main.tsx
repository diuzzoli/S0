import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { ApiError } from "@/lib/api";
import { routeTree } from "./routeTree.gen";
import { applyTheme, useUiStore } from "./stores/ui";
import "./styles.css";

// Sentry se carga solo si hay DSN y en un chunk aparte (no pesa en el primer render).
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  void import("@sentry/react").then((Sentry) =>
    Sentry.init({
      dsn: sentryDsn,
      environment: import.meta.env.MODE,
      // Sin datos personales del usuario.
      dataCollection: { userInfo: false, cookies: false, httpHeaders: false },
    }),
  );
}

applyTheme(useUiStore.getState().theme);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // No reintentar errores del cliente (401/403/404/422): solo fallas de red o 5xx.
      retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2,
    },
  },
});

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById("root");
if (!root) throw new Error("Falta #root en index.html");

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  </StrictMode>,
);
