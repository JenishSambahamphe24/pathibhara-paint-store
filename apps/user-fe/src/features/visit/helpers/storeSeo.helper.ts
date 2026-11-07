import { Config } from "#/lib/config";
import { SeoHelper } from "#/lib/helpers/seo.helper";

export class StoreSeoHelper {
  // Search engines' local business data: the details here should match the
  // Google Maps listing word for word. Only sent once Config.store is
  // confirmed, so placeholders never reach search results.
  static jsonLd(): Record<string, unknown> | null {
    const { store, site } = Config;
    if (!store.isConfirmed) return null;

    return {
      "@context": "https://schema.org",
      "@type": "HomeGoodsStore",
      name: site.name,
      url: SeoHelper.absoluteUrl("/"),
      telephone: store.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: store.address,
        addressLocality: store.city,
        addressCountry: "NP",
      },
      hasMap: store.mapUrl,
      openingHoursSpecification: store.hours
        .filter((row) => row.schemaDays.length > 0 && row.opens && row.closes)
        .map((row) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: row.schemaDays,
          opens: row.opens,
          closes: row.closes,
        })),
    };
  }
}
