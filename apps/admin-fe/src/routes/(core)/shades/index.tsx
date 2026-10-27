import type { SearchSchemaInput } from "@tanstack/react-router";

import { createFileRoute } from "@tanstack/react-router";

import { shadeListQuerySchema } from "@repo/shared";

import { ShadeListPage } from "#/features/shades/components/ShadeListPage";
import { SearchParamsHelper } from "#/lib/helpers/searchParams.helper";

export const Route = createFileRoute("/(core)/shades/")({
  validateSearch: (raw: Record<string, unknown> & SearchSchemaInput) =>
    SearchParamsHelper.parse(shadeListQuerySchema, raw),
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <ShadeListPage
      search={search}
      onSearchChange={(patch) =>
        navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })
      }
    />
  );
}
