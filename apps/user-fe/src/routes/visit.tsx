import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "#/components/PagePlaceholder/PagePlaceholder";

import { SeoHelper } from "#/lib/helpers/seo.helper";

const DESCRIPTION = "Address, opening hours, phone and WhatsApp.";

export const Route = createFileRoute("/visit")({
  head: () =>
    SeoHelper.page({
      title: "Visit",
      description: DESCRIPTION,
      path: "/visit",
      noIndex: true,
    }),
  component: RouteComponent,
});

function RouteComponent() {
  return <PagePlaceholder title="Visit the store" description={DESCRIPTION} />;
}
