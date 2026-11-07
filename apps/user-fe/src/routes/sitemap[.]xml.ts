import { createFileRoute } from "@tanstack/react-router";

import { SeoApi } from "#/features/seo/api";
import { SitemapHelper } from "#/features/seo/helpers/sitemap.helper";
import {
  INDEXED_ENTITY_KINDS,
  INDEXED_STATIC_PATHS,
} from "#/features/seo/indexing";
import { SeoHelper } from "#/lib/helpers/seo.helper";
import { SiteUrlHelper } from "#/lib/helpers/siteUrl.helper";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries = await SeoApi.sitemap();
        const urls = [
          ...INDEXED_STATIC_PATHS.map((path) => ({
            loc: SeoHelper.absoluteUrl(path),
          })),
          ...entries
            .filter((entry) => INDEXED_ENTITY_KINDS.includes(entry.kind))
            .map((entry) => ({
              loc: SeoHelper.absoluteUrl(
                SiteUrlHelper.entityPath(entry.kind, entry.slug),
              ),
              lastmod: entry.updatedAt,
            })),
        ];
        return new Response(SitemapHelper.toXml(urls), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            // Crawlers re-read it often; an hour keeps the API out of the hot path.
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
