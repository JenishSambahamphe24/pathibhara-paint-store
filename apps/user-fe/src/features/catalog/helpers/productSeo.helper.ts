import type { IPublicProduct } from "../types";
import type { StockAvailability } from "@repo/shared";

import { MoneyHelper } from "@repo/shared";

import { Config } from "#/lib/config";
import { SeoHelper } from "#/lib/helpers/seo.helper";
import { SiteUrlHelper } from "#/lib/helpers/siteUrl.helper";

const SCHEMA_AVAILABILITY: Record<StockAvailability, string> = {
  inStock: "https://schema.org/InStock",
  lowStock: "https://schema.org/LimitedAvailability",
  askInStore: "https://schema.org/InStoreOnly",
};

export class ProductSeoHelper {
  // Search engines' product data: one offer range over the sizes on sale,
  // and the category path as breadcrumbs.
  static jsonLd(product: IPublicProduct): Array<Record<string, unknown>> {
    const url = SeoHelper.absoluteUrl(
      SiteUrlHelper.entityPath("product", product.slug),
    );
    const prices = product.variants.map((variant) => variant.pricePaisa);
    const rupees = (paisa: number) => MoneyHelper.toRupeesString(paisa);
    const isAvailable = product.variants.some(
      (variant) => variant.availability !== "askInStore",
    );

    const productData: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      url,
      category: product.category.name,
      ...(product.description && { description: product.description }),
      ...(product.images.length > 0 && {
        image: product.images.map((image) => SeoHelper.absoluteUrl(image.url)),
      }),
    };
    if (prices.length > 0) {
      productData.offers = {
        "@type": "AggregateOffer",
        priceCurrency: "NPR",
        lowPrice: rupees(Math.min(...prices)),
        highPrice: rupees(Math.max(...prices)),
        offerCount: prices.length,
        availability: isAvailable
          ? SCHEMA_AVAILABILITY.inStock
          : SCHEMA_AVAILABILITY.askInStore,
        seller: { "@type": "Organization", name: Config.site.name },
      };
    }

    const crumbs = [
      { name: "Products", url: SeoHelper.absoluteUrl("/products") },
      ...product.categoryPath.map((step) => ({
        name: step.name,
        url: SeoHelper.absoluteUrl(
          SiteUrlHelper.entityPath("category", step.slug),
        ),
      })),
      { name: product.name, url },
    ];
    const breadcrumbs = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    };

    return [productData, breadcrumbs];
  }
}
