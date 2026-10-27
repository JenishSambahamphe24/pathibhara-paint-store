import type { SearchSchemaInput } from "@tanstack/react-router";

import { createFileRoute } from "@tanstack/react-router";

import { dashboardQuerySchema } from "@repo/shared";

import { DashboardPage } from "#/features/dashboard/components/DashboardPage";
import { SearchParamsHelper } from "#/lib/helpers/searchParams.helper";

export const Route = createFileRoute("/(core)/dashboard/")({
  validateSearch: (raw: Record<string, unknown> & SearchSchemaInput) => SearchParamsHelper.parse(dashboardQuerySchema, raw),
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <DashboardPage search={search} onSearchChange={(patch) => navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })} />
  );
}
