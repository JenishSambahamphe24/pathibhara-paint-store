export const LOCALES = ["en", "ne"] as const;
export type Locale = (typeof LOCALES)[number];

// English is required on every translatable record; Nepali is optional and
// falls back to English when missing.
export const DEFAULT_LOCALE: Locale = "en";
