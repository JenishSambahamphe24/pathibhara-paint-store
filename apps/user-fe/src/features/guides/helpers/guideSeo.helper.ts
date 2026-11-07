import type { IPublicPost } from "../types";

import { Config } from "#/lib/config";
import { SeoHelper } from "#/lib/helpers/seo.helper";
import { SiteUrlHelper } from "#/lib/helpers/siteUrl.helper";

export class GuideSeoHelper {
  // Search engines' article data. The author is the store: posts are written
  // in the admin panel, not signed by a person.
  static jsonLd(post: IPublicPost): Record<string, unknown> {
    const store = { "@type": "Organization", name: Config.site.name };
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.seoTitle ?? post.title,
      url: SeoHelper.absoluteUrl(SiteUrlHelper.entityPath("post", post.slug)),
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      author: store,
      publisher: store,
      ...(post.excerpt && { description: post.excerpt }),
      ...(post.coverImage && {
        image: SeoHelper.absoluteUrl(post.coverImage.url),
      }),
    };
  }
}
