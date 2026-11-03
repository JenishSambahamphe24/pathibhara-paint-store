import type { SlugEntityType } from "@repo/shared";

// What sitemap.xml lists. A page joins when its real design ships: add it here
// and drop `noIndex` from its route in the same change, so the sitemap never
// points search engines at a placeholder.
export const INDEXED_STATIC_PATHS: ReadonlyArray<string> = [];

export const INDEXED_ENTITY_KINDS: ReadonlyArray<SlugEntityType> = [];
