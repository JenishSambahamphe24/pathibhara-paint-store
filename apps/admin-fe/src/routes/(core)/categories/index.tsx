import { createFileRoute } from "@tanstack/react-router";

import { CategoryTreePage } from "#/features/categories/components/CategoryTreePage";

export const Route = createFileRoute("/(core)/categories/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CategoryTreePage />;
}
