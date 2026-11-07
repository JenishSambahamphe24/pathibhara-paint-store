import { BaseDto, z } from "@repo/http-kit";
import { SLUG_ENTITY_TYPES } from "@repo/shared";

export class SitemapEntryDto extends BaseDto {
  static override readonly schema = z.object({
    kind: z.enum(SLUG_ENTITY_TYPES),
    slug: z.string(),
    // The sitemap's <lastmod>.
    updatedAt: z.iso.datetime(),
  });
}
