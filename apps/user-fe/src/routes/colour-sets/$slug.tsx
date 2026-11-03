import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "#/components/PagePlaceholder/PagePlaceholder";

import { ColourSetApi } from "#/features/colourSets/api";
import { SlugRedirectHelper } from "#/features/seo/helpers/slugRedirect.helper";
import { SeoHelper } from "#/lib/helpers/seo.helper";
import { SiteUrlHelper } from "#/lib/helpers/siteUrl.helper";

export const Route = createFileRoute("/colour-sets/$slug")({
  loader: ({ params }) =>
    SlugRedirectHelper.loadBySlug("colourSet", params.slug, () =>
      ColourSetApi.colourSet(params.slug),
    ),
  head: ({ loaderData: colourSet }) =>
    colourSet
      ? SeoHelper.page({
          title: colourSet.name,
          description:
            colourSet.description ??
            `${colourSet.name}: an exterior colour set for walls, columns, doors and windows, and the roof edge.`,
          path: SiteUrlHelper.entityPath("colourSet", colourSet.slug),
          noIndex: true,
        })
      : {},
  component: RouteComponent,
});

function RouteComponent() {
  const colourSet = Route.useLoaderData();
  return (
    <PagePlaceholder
      title={colourSet.name}
      description={colourSet.description ?? ""}
    />
  );
}
