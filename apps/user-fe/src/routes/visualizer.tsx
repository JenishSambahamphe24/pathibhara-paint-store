import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ColourSetApi } from "#/features/colourSets/api";
import { ShadeApi } from "#/features/shades/api";
import { VisualizerPage } from "#/features/visualizer/components/VisualizerPage";
import { LookHelper } from "#/features/visualizer/helpers/look.helper";
import { SeoHelper } from "#/lib/helpers/seo.helper";

// The visualizer shows every set; the API returns at most this many a page.
const COLOUR_SET_LIMIT = 100;
const SHADE_CODE = z.string().trim().max(40).optional().catch(undefined);

export const Route = createFileRoute("/visualizer")({
  // A shared link carries the look: ?w=<walls>&c=<columns>&d=<doors>&r=<roof>.
  // A bad value is dropped rather than failing the page.
  validateSearch: z.object({
    w: SHADE_CODE,
    c: SHADE_CODE,
    d: SHADE_CODE,
    r: SHADE_CODE,
  }),
  staticData: { fullScreen: true },
  loader: async () => {
    const [shades, colourSets] = await Promise.all([
      ShadeApi.all(),
      ColourSetApi.list(COLOUR_SET_LIMIT),
    ]);
    return { shades, colourSets };
  },
  head: () =>
    SeoHelper.page({
      title: "Exterior colour visualizer",
      description:
        "Turn a 3D house, tap a part, tap a shade. Try the store's colour sets, compare two looks and send your picks to the store on WhatsApp.",
      path: "/visualizer",
    }),
  component: RouteComponent,
});

function RouteComponent() {
  const { shades, colourSets } = Route.useLoaderData();
  const search = Route.useSearch();
  const index = LookHelper.index(shades);
  const fromLink = LookHelper.fromSearch(search, index);
  const initialLook = !LookHelper.isEmpty(fromLink)
    ? fromLink
    : colourSets[0]
      ? LookHelper.fromColourSet(colourSets[0])
      : LookHelper.EMPTY;

  return (
    <VisualizerPage
      shades={shades}
      colourSets={colourSets}
      initialLook={initialLook}
    />
  );
}
