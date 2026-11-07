import { createFileRoute, redirect } from "@tanstack/react-router";

import { ColourSetApi } from "#/features/colourSets/api";
import { SlugRedirectHelper } from "#/features/seo/helpers/slugRedirect.helper";
import { LookHelper } from "#/features/visualizer/helpers/look.helper";

// A colour set has no page of its own: its link opens the visualizer painted
// with it. 302 rather than 301, since the set's shades can change. An old
// slug still gets its 301 first, and an unknown one a 404.
export const Route = createFileRoute("/colour-sets/$slug")({
  loader: async ({ params }) => {
    const colourSet = await SlugRedirectHelper.loadBySlug(
      "colourSet",
      params.slug,
      () => ColourSetApi.colourSet(params.slug),
    );
    throw redirect({
      to: "/visualizer",
      search: LookHelper.toSearch(LookHelper.fromColourSet(colourSet)),
      statusCode: 302,
    });
  },
});
