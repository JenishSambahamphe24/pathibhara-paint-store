import type { SearchSchemaInput } from "@tanstack/react-router";

import { createFileRoute } from "@tanstack/react-router";

import { dailySaleListQuerySchema } from "@repo/shared";

import { DailySaleListPage } from "#/features/dailySales/components/DailySaleListPage";
import { SearchParamsHelper } from "#/lib/helpers/searchParams.helper";

export const Route = createFileRoute("/(core)/stock/sales/")({
  validateSearch: (raw: Record<string, unknown> & SearchSchemaInput) =>
    SearchParamsHelper.parse(dailySaleListQuerySchema, raw),
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <DailySaleListPage
      search={search}
      onSearchChange={(patch) =>
        navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })
      }
    />
  );
}
