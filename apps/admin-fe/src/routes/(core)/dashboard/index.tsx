import { createFileRoute } from "@tanstack/react-router";

import { DashboardPage } from "#/features/dashboard/components/DashboardPage";

export const Route = createFileRoute("/(core)/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <DashboardPage />;
}
