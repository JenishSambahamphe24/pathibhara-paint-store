import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { CalculatorApi } from "#/features/calculator/api";
import { CalculatorPage } from "#/features/calculator/components/CalculatorPage";
import { CatalogApi } from "#/features/catalog/api";
import { SeoHelper } from "#/lib/helpers/seo.helper";

export const Route = createFileRoute("/calculator")({
  // ?products=<slug>,<slug> starts the exterior with those products; the
  // visualizer sends the products behind the shades the visitor picked.
  validateSearch: z.object({
    products: z.string().max(400).optional().catch(undefined),
  }),
  staticData: { hideContactBar: true },
  loader: async () => {
    const [products, wastagePercent] = await Promise.all([
      CatalogApi.allProducts(),
      CalculatorApi.defaultWastagePercent(),
    ]);
    return { products, wastagePercent };
  },
  head: () =>
    SeoHelper.page({
      title: "Paint cost calculator",
      description:
        "Type your wall sizes in feet. See the litres of paint, the cans to buy and the total in rupees, then send it to the store on WhatsApp.",
      path: "/calculator",
    }),
  component: RouteComponent,
});

function RouteComponent() {
  const { products, wastagePercent } = Route.useLoaderData();
  const { products: slugs } = Route.useSearch();
  const wanted = new Set(slugs?.split(",").filter(Boolean));
  const startWith = products.filter((product) => wanted.has(product.slug));

  return (
    <CalculatorPage
      products={products}
      wastagePercent={wastagePercent}
      startWith={startWith}
    />
  );
}
