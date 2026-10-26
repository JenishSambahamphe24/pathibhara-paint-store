import { z } from "zod";

export const SORT_ORDERS = ["asc", "desc"] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export const DEFAULT_PER_PAGE = 20;
export const MAX_PER_PAGE = 100;

// Flat shapes (spread them into z.object) so the API's OpenAPI generator can
// list each query parameter. No `.catch()`: zod-to-openapi can't describe it,
// and the API should reject a bad parameter. The admin's URL parsing drops
// invalid keys itself (SearchParamsHelper).
export const paginationQueryShape = {
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_PER_PAGE)
    .default(DEFAULT_PER_PAGE),
};

export const searchQueryShape = {
  search: z.string().trim().max(128).optional(),
};

export class ListQuerySchema {
  static sort<const TKeys extends readonly [string, ...string[]]>(
    keys: TKeys,
    defaultKey: TKeys[number],
    defaultOrder: SortOrder = "desc",
  ) {
    return {
      sortBy: z.enum(keys).default(defaultKey as never),
      sortOrder: z.enum(SORT_ORDERS).default(defaultOrder),
    };
  }

  static optionalEnum<const TValues extends readonly [string, ...string[]]>(values: TValues) {
    return z.enum(values).optional();
  }

  // The API receives "true"/"false" strings; the admin's router hands over
  // real booleans parsed from the URL. Accept both.
  static optionalBool() {
    return z.union([z.boolean(), z.stringbool()]).optional();
  }

  static optionalUuid() {
    return z.uuid().optional();
  }

  static optionalDate() {
    return z.iso.date().optional();
  }
}

export const ACTIVE_FILTERS = ["active", "inactive"] as const;
export type ActiveFilter = (typeof ACTIVE_FILTERS)[number];
