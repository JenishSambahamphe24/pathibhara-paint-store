import { createFileRoute } from "@tanstack/react-router";

import { ProductForm } from "#/features/products/components/ProductForm";

export const Route = createFileRoute("/(core)/products/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ProductForm product={null} />;
}
