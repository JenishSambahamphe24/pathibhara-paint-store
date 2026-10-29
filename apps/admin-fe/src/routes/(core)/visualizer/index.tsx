import type { SearchSchemaInput } from "@tanstack/react-router";

import { createFileRoute } from "@tanstack/react-router";

import { VisualizerPage } from "#/features/visualizer/components/VisualizerPage";
import { visualizerSearchSchema } from "#/features/visualizer/visualizer.schemas";
import { SearchParamsHelper } from "#/lib/helpers/searchParams.helper";

export const Route = createFileRoute("/(core)/visualizer/")({
  validateSearch: (raw: Record<string, unknown> & SearchSchemaInput) =>
    SearchParamsHelper.parse(visualizerSearchSchema, raw),
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <VisualizerPage
      search={search}
      onSearchChange={(patch) =>
        navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })
      }
    />
  );
}
