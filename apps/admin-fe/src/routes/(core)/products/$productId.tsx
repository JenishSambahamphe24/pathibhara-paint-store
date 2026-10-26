import { createFileRoute } from "@tanstack/react-router";

import { ProductEditPage } from "#/features/products/components/ProductEditPage";

export const Route = createFileRoute("/(core)/products/$productId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { productId } = Route.useParams();
  return <ProductEditPage productId={productId} />;
}
