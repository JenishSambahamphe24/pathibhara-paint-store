import { createFileRoute } from "@tanstack/react-router";

import { CatalogApi } from "#/features/catalog/api";
import { ProductPage } from "#/features/catalog/components/ProductPage";
import { ProductSeoHelper } from "#/features/catalog/helpers/productSeo.helper";
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
      ? {
          ...SeoHelper.page({
            title: product.seoTitle ?? product.name,
            description:
              product.seoDescription ??
              product.description ??
              `${product.name}: sizes, prices and coverage.`,
            path: SiteUrlHelper.entityPath("product", product.slug),
            image: product.images[0]?.url,
          }),
          scripts: ProductSeoHelper.jsonLd(product).map((data) => ({
            type: "application/ld+json",
            children: JSON.stringify(data),
          })),
        }
      : {},
  component: RouteComponent,
});

function RouteComponent() {
  const product = Route.useLoaderData();
  return <ProductPage product={product} />;
}
