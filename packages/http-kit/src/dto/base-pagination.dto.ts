import { z } from "../zod/zod-extended";

export const SORT_ORDERS = ["asc", "desc"] as const;

export const basePaginationShape = {
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(20),
} as const;

export const basePaginationSchema = z.object(basePaginationShape);

export class SortShapeHelper {
  static of<const TKeys extends readonly [string, ...string[]]>(
    keys: TKeys,
    defaultKey: TKeys[number],
    defaultOrder: (typeof SORT_ORDERS)[number] = "desc",
  ) {
    return {
      sortBy: z.enum(keys).default(defaultKey as never),
      sortOrder: z.enum(SORT_ORDERS).default(defaultOrder),
    } as const;
  }
}
