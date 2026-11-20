import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { session } = Route.useRouteContext();
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Hola, {session.user.name}</h1>
      {/* Grilla mobile-first: 1 columna, 2 en sm, 3 en lg. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/notes"
          className="rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <Card className="h-full transition-colors hover:bg-accent">
            <CardHeader>
              <CardTitle>Notas</CardTitle>
              <CardDescription>Módulo de ejemplo con el patrón completo.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
