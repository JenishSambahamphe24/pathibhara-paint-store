import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "#/components/PagePlaceholder/PagePlaceholder";

import { SeoHelper } from "#/lib/helpers/seo.helper";

const DESCRIPTION =
  "Paints, primers and waterproofing, with every size and price.";

export const Route = createFileRoute("/products")({
  head: () =>
    SeoHelper.page({
      title: "Products",
      description: DESCRIPTION,
      path: "/products",
      noIndex: true,
    }),
  component: RouteComponent,
});

function RouteComponent() {
  return <PagePlaceholder title="Products" description={DESCRIPTION} />;
}
