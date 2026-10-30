export const COMMON_VOLUMES_ML = [500, 1000, 4000, 10000, 20000] as const;

export const MIN_COATS = 1;
export const MAX_COATS = 10;

// What the customer site may say about stock. Raw counts stay internal; this
// is the only stock signal a public response carries.
export const STOCK_AVAILABILITIES = ["inStock", "lowStock", "askInStore"] as const;
export type StockAvailability = (typeof STOCK_AVAILABILITIES)[number];
