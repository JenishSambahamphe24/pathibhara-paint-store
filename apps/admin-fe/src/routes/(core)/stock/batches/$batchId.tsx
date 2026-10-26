import { createFileRoute } from "@tanstack/react-router";

import { BatchDetailPage } from "#/features/stockBatches/components/BatchDetailPage";

export const Route = createFileRoute("/(core)/stock/batches/$batchId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { batchId } = Route.useParams();
  return <BatchDetailPage batchId={batchId} />;
}
