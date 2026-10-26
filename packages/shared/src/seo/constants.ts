// Entities with public, slug-based URLs. A changed slug leaves a redirect row.
export const SLUG_ENTITY_TYPES = ["category", "product", "post", "colourSet"] as const;
export type SlugEntityType = (typeof SLUG_ENTITY_TYPES)[number];

export const SEO_TITLE_MAX_LENGTH = 70;
export const SEO_DESCRIPTION_MAX_LENGTH = 160;
