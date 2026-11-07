import type { SlugEntityType } from "@repo/shared";

import { Config } from "#/lib/config";

// What sitemap.xml lists. A page joins when its real design ships: add it here
// and drop `noIndex` from its route in the same change, so the sitemap never
// points search engines at a placeholder.
export const INDEXED_STATIC_PATHS: ReadonlyArray<string> = [
  "/",
  "/visualizer",
  "/calculator",
  "/products",
  "/guides",
  // Joins once the store's details are real, not placeholders.
  ...(Config.store.isConfirmed ? ["/visit"] : []),
];

export const INDEXED_ENTITY_KINDS: ReadonlyArray<SlugEntityType> = [
  "category",
  "product",
  "post",
];
