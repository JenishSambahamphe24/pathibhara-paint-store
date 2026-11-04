import { createFileRoute } from "@tanstack/react-router";

import { CatalogApi } from "#/features/catalog/api";
import { ColourSetApi } from "#/features/colourSets/api";
import { GuideApi } from "#/features/guides/api";
import { HomePage } from "#/features/home/components/HomePage";
import { Config } from "#/lib/config";
import { SeoHelper } from "#/lib/helpers/seo.helper";

const COLOUR_SET_COUNT = 4;
const GUIDE_COUNT = 3;
// More than the two shown, since only products with a photo are used.
const PRODUCT_SAMPLE_COUNT = 6;

export const Route = createFileRoute("/")({
  loader: async () => {
    const [colourSets, guides, products] = await Promise.all([
      ColourSetApi.list(COLOUR_SET_COUNT),
      GuideApi.latest(GUIDE_COUNT),
      CatalogApi.products({ perPage: PRODUCT_SAMPLE_COUNT }),
    ]);
    return { colourSets, guides, products: products.items };
  },
  head: () =>
    SeoHelper.page({
      title: Config.site.name,
      description: Config.site.description,
      path: "/",
    }),
  component: RouteComponent,
});

function RouteComponent() {
  const { colourSets, guides, products } = Route.useLoaderData();
  return (
    <HomePage colourSets={colourSets} guides={guides} products={products} />
  );
}
