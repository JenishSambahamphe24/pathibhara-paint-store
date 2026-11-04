import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { CatalogApi } from "#/features/catalog/api";
import { CatalogPage } from "#/features/catalog/components/CatalogPage";
import { CATALOG_PAGE_SIZE } from "#/features/catalog/constants";
import { SeoHelper } from "#/lib/helpers/seo.helper";

export const Route = createFileRoute("/products/")({
  validateSearch: z.object({
    page: z.coerce.number().int().min(1).optional().catch(undefined),
  }),
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: async ({ deps }) => {
    const [categories, products] = await Promise.all([
      CatalogApi.categories(),
      CatalogApi.products({ perPage: CATALOG_PAGE_SIZE, page: deps.page }),
    ]);
    return { categories, products };
  },
  head: ({ loaderData }) =>
    SeoHelper.page({
      title: "Products",
      description:
        "Paints, primers, enamels and waterproofing, with every size and its price per litre.",
      path: "/products",
      // Later pages repeat the first page's description; keep them out of
      // results so the first page ranks.
      noIndex: (loaderData?.products.pagination.page ?? 1) > 1,
    }),
  component: RouteComponent,
});

function RouteComponent() {
  const { categories, products } = Route.useLoaderData();
  return (
    <CatalogPage categories={categories} current={null} products={products} />
  );
}
