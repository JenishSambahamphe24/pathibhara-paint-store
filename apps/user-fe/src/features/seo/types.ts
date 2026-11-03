import type { SlugEntityType } from "@repo/shared";

export interface ISitemapEntry {
  kind: SlugEntityType;
  slug: string;
  updatedAt: string;
}

export interface ISitemapUrl {
  // Absolute.
  loc: string;
  lastmod?: string;
}
