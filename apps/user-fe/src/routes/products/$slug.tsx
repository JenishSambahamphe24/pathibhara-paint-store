import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "#/components/PagePlaceholder/PagePlaceholder";

import { CatalogApi } from "#/features/catalog/api";
import { SlugRedirectHelper } from "#/features/seo/helpers/slugRedirect.helper";
import { SeoHelper } from "#/lib/helpers/seo.helper";
import { SiteUrlHelper } from "#/lib/helpers/siteUrl.helper";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) =>
    SlugRedirectHelper.loadBySlug("product", params.slug, () =>
      CatalogApi.product(params.slug),
    ),
  head: ({ loaderData: product }) =>
    product
      ? SeoHelper.page({
          title: product.seoTitle ?? product.name,
          description:
            product.seoDescription ??
            product.description ??
            `${product.name}: sizes, prices and coverage.`,
          path: SiteUrlHelper.entityPath("product", product.slug),
          image: product.images[0]?.url,
          noIndex: true,
        })
      : {},
  component: RouteComponent,
});

function RouteComponent() {
  const product = Route.useLoaderData();
  return (
    <PagePlaceholder
      title={product.name}
      description={product.description ?? ""}
    />
  );
}
