import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "#/components/PagePlaceholder/PagePlaceholder";

import { CatalogApi } from "#/features/catalog/api";
import { SlugRedirectHelper } from "#/features/seo/helpers/slugRedirect.helper";
import { SeoHelper } from "#/lib/helpers/seo.helper";
import { SiteUrlHelper } from "#/lib/helpers/siteUrl.helper";

export const Route = createFileRoute("/categories/$slug")({
  loader: ({ params }) =>
    SlugRedirectHelper.loadBySlug("category", params.slug, () =>
      CatalogApi.category(params.slug),
    ),
  head: ({ loaderData: category }) =>
    category
      ? SeoHelper.page({
          title: category.seoTitle ?? category.name,
          description:
            category.seoDescription ??
            category.description ??
            `${category.name}: products, sizes and prices.`,
          path: SiteUrlHelper.entityPath("category", category.slug),
          image: category.image?.url,
          noIndex: true,
        })
      : {},
  component: RouteComponent,
});

function RouteComponent() {
  const category = Route.useLoaderData();
  return (
    <PagePlaceholder
      title={category.name}
      description={category.description ?? ""}
    />
  );
}
