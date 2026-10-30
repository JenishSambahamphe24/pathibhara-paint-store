import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "#/components/PagePlaceholder/PagePlaceholder";

import { SeoHelper } from "#/lib/helpers/seo.helper";

const DESCRIPTION =
  "Enter your walls and get the litres, cans and cost you need.";

export const Route = createFileRoute("/calculator")({
  head: () =>
    SeoHelper.page({
      title: "Calculator",
      description: DESCRIPTION,
      path: "/calculator",
      noIndex: true,
    }),
  component: RouteComponent,
});

function RouteComponent() {
  return <PagePlaceholder title="Paint calculator" description={DESCRIPTION} />;
}
