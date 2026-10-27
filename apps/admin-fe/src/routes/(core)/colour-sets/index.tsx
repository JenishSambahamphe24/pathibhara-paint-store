import type { SearchSchemaInput } from "@tanstack/react-router";

import { createFileRoute } from "@tanstack/react-router";

import { colourSetListQuerySchema } from "@repo/shared";

import { ColourSetListPage } from "#/features/colourSets/components/ColourSetListPage";
import { SearchParamsHelper } from "#/lib/helpers/searchParams.helper";

export const Route = createFileRoute("/(core)/colour-sets/")({
  validateSearch: (raw: Record<string, unknown> & SearchSchemaInput) =>
    SearchParamsHelper.parse(colourSetListQuerySchema, raw),
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <ColourSetListPage
      search={search}
      onSearchChange={(patch) =>
        navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })
      }
    />
  );
}
