import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

import { PageSkeleton } from "#/components/PageSkeleton/PageSkeleton";

import { CatalogApi } from "#/features/catalog/api";
import { CatalogPage } from "#/features/catalog/components/CatalogPage";
import { CATALOG_PAGE_SIZE } from "#/features/catalog/constants";
import { SlugRedirectHelper } from "#/features/seo/helpers/slugRedirect.helper";
import { SeoHelper } from "#/lib/helpers/seo.helper";
import { SiteUrlHelper } from "#/lib/helpers/siteUrl.helper";

export const Route = createFileRoute("/categories/$slug")({
  validateSearch: z.object({
    page: z.coerce.number().int().min(1).optional().catch(undefined),
  }),
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: async ({ params, deps }) => {
    const [category, categories, products] = await Promise.all([
      SlugRedirectHelper.loadBySlug("category", params.slug, () =>
        CatalogApi.category(params.slug),
      ),
      CatalogApi.categories(),
      CatalogApi.products({
        perPage: CATALOG_PAGE_SIZE,
        page: deps.page,
        category: params.slug,
      }),
    ]);
    // A page past the end is a 404, not a blank page search engines keep.
    if (deps.page > Math.max(1, products.pagination.totalPages)) {
      throw notFound();
    }
    return { category, categories, products };
  },
  head: ({ loaderData }) =>
    loaderData
      ? SeoHelper.page({
          title: loaderData.category.seoTitle ?? loaderData.category.name,
          description:
            loaderData.category.seoDescription ??
            loaderData.category.description ??
            `${loaderData.category.name}: every product, size and price.`,
          path: SiteUrlHelper.entityPath("category", loaderData.category.slug),
          image: loaderData.category.image?.url,
          noIndex: loaderData.products.pagination.page > 1,
        })
      : {},
  component: RouteComponent,
  pendingComponent: () => <PageSkeleton kind="grid" />,
});

function RouteComponent() {
  const { category, categories, products } = Route.useLoaderData();
  return (
    <CatalogPage
      categories={categories}
      current={category}
      products={products}
    />
  );
}
