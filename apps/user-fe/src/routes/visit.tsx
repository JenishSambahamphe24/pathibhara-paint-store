import { createFileRoute } from "@tanstack/react-router";

import { VisitPage } from "#/features/visit/components/VisitPage";
import { StoreSeoHelper } from "#/features/visit/helpers/storeSeo.helper";
import { Config } from "#/lib/config";
import { SeoHelper } from "#/lib/helpers/seo.helper";

export const Route = createFileRoute("/visit")({
  head: () => {
    const jsonLd = StoreSeoHelper.jsonLd();
    return {
      ...SeoHelper.page({
        title: "Visit the store",
        description: `Address, opening hours, phone and WhatsApp for ${Config.site.name}. Bring your shade codes and we'll match them on the real shade cards.`,
        path: "/visit",
        // A page of placeholders isn't worth a place in search results.
        noIndex: !Config.store.isConfirmed,
      }),
      scripts: jsonLd
        ? [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }]
        : [],
    };
  },
  component: VisitPage,
});
