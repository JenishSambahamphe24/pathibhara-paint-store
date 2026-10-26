import { createFileRoute } from "@tanstack/react-router";

import { BatchFormPage } from "#/features/stockBatches/components/BatchFormPage";

export const Route = createFileRoute("/(core)/stock/batches/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return <BatchFormPage />;
}
