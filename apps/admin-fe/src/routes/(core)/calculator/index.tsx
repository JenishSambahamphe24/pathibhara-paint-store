import { createFileRoute } from "@tanstack/react-router";

import { CalculatorPage } from "#/features/calculator/components/CalculatorPage";

export const Route = createFileRoute("/(core)/calculator/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CalculatorPage />;
}
