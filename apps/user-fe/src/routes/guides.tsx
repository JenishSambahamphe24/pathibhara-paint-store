import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "#/components/PagePlaceholder/PagePlaceholder";

import { SeoHelper } from "#/lib/helpers/seo.helper";

const DESCRIPTION =
  "Practical guides on waterproofing, primers and choosing exterior colours.";

export const Route = createFileRoute("/guides")({
  head: () =>
    SeoHelper.page({
      title: "Guides",
      description: DESCRIPTION,
      path: "/guides",
      noIndex: true,
    }),
  component: RouteComponent,
});

function RouteComponent() {
  return <PagePlaceholder title="Guides" description={DESCRIPTION} />;
}
