import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "#/components/PagePlaceholder/PagePlaceholder";

import { SeoHelper } from "#/lib/helpers/seo.helper";

const DESCRIPTION =
  "Pick a shade for each part of a 3D house and see your exterior before you paint.";

export const Route = createFileRoute("/visualizer")({
  head: () =>
    SeoHelper.page({
      title: "Visualizer",
      description: DESCRIPTION,
      path: "/visualizer",
      noIndex: true,
    }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PagePlaceholder
      title="Exterior colour visualizer"
      description={DESCRIPTION}
    />
  );
}
