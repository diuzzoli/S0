/** Layout protegido: toda ruta bajo routes/_app/ exige sesión. */
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { sessionQuery } from "@/lib/auth-client";

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.ensureQueryData(sessionQuery);
    if (!session) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    return { session };
  },
  component: function AppLayout() {
    const { session } = Route.useRouteContext();
    return (
      <AppShell userName={session.user.name}>
        <Outlet />
      </AppShell>
    );
  },
});
