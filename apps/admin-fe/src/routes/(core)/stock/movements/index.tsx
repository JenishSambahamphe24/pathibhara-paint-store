import type { SearchSchemaInput } from "@tanstack/react-router";

import { createFileRoute } from "@tanstack/react-router";

import { stockMovementListQuerySchema } from "@repo/shared";

import { MovementListPage } from "#/features/stockMovements/components/MovementListPage";
import { SearchParamsHelper } from "#/lib/helpers/searchParams.helper";

export const Route = createFileRoute("/(core)/stock/movements/")({
  validateSearch: (raw: Record<string, unknown> & SearchSchemaInput) =>
    SearchParamsHelper.parse(stockMovementListQuerySchema, raw),
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <MovementListPage
      search={search}
      onSearchChange={(patch) =>
        navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })
      }
    />
  );
}
