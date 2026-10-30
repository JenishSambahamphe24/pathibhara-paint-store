import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "#/components/PagePlaceholder/PagePlaceholder";

import { SeoHelper } from "#/lib/helpers/seo.helper";

const DESCRIPTION =
  "Try exterior colours on a 3D house, work out how much paint you need, and find the right product for your walls.";

export const Route = createFileRoute("/")({
  head: () =>
    SeoHelper.page({
      title: "Pathibhara Paints",
      description: DESCRIPTION,
      path: "/",
      noIndex: true,
    }),
  component: RouteComponent,
});

function RouteComponent() {
  return <PagePlaceholder title="Home" description={DESCRIPTION} />;
}
