import type { SlugEntityType } from "@repo/shared";

// The site's URL for each slugged record. Sitemap entries and slug redirects
// both come from the API as (kind, slug), so they resolve through here; change
// a prefix only together with a redirect from the old one.
const ENTITY_PATH_PREFIX: Record<SlugEntityType, string> = {
  category: "/categories",
  product: "/products",
  post: "/guides",
  colourSet: "/colour-sets",
};

export class SiteUrlHelper {
  static entityPath(kind: SlugEntityType, slug: string): string {
    return `${ENTITY_PATH_PREFIX[kind]}/${encodeURIComponent(slug)}`;
  }
}
