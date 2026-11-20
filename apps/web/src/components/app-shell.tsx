/**
 * Layout mobile-first:
 *  - Mobile: barra superior + navegación inferior fija (zona del pulgar).
 *  - Desktop (md+): barra lateral fija + contenido.
 * Agregá ítems de menú en NAV_ITEMS: se reflejan en ambas navegaciones.
 */
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Home, LogOut, Moon, NotebookPen, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useUiStore } from "@/stores/ui";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Inicio", icon: Home },
  { to: "/notes", label: "Notas", icon: NotebookPen },
] as const;

export function AppShell({ userName, children }: { userName: string; children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useUiStore();
  const isDark = theme === "dark";

  async function signOut() {
    await authClient.signOut();
    queryClient.clear();
    await navigate({ to: "/login" });
  }

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[15rem_1fr]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3 focus:bg-background"
      >
        Saltar al contenido
      </a>

      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r p-4 md:flex">
        <div className="mb-6 px-2 text-lg font-semibold">App</div>
        <nav aria-label="Principal" className="grid gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              activeProps={{ className: "bg-accent text-foreground font-medium" }}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto grid gap-2 border-t pt-4">
          <p className="truncate px-2 text-sm text-muted-foreground">{userName}</p>
          <Button variant="ghost" className="justify-start" onClick={signOut}>
            <LogOut aria-hidden /> Salir
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-6">
          <span className="font-semibold md:hidden">App</span>
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label={isDark ? "Usar tema claro" : "Usar tema oscuro"}
              onClick={() => setTheme(isDark ? "light" : "dark")}
            >
              {isDark ? <Sun /> : <Moon />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Salir"
              onClick={signOut}
            >
              <LogOut />
            </Button>
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-5xl flex-1 p-4 pb-safe-nav md:p-6 md:pb-6">
          {children}
        </main>
      </div>

      {/* Navegación inferior mobile */}
      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t bg-background pb-safe md:hidden"
      >
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex h-16 flex-col items-center justify-center gap-1 text-xs text-muted-foreground"
            activeProps={{ className: "text-foreground font-medium" }}
          >
            <Icon className="size-5" aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
