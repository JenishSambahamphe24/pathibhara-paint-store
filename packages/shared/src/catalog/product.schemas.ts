import { z } from "zod";

import { slugInputSchema } from "../helpers/slug.schema";
import { contentTranslationsSchema } from "../i18n/translation.schemas";
import {
  ACTIVE_FILTERS,
  ListQuerySchema,
  paginationQueryShape,
  searchQueryShape,
} from "../list/list-query.schemas";
import { paisaSchema } from "../money/money.helper";
import { MAX_COATS, MIN_COATS } from "./constants";

export const MAX_PRODUCT_IMAGES = 8;
const MAX_VOLUME_ML = 1_000_000;
const MAX_STOCK_LEVEL = 1_000_000;

export const productVariantInputSchema = z.object({
  // Present for an existing size, absent for a new one.
  id: z.uuid().optional(),
  volumeMl: z
    .number({ error: "Enter a size" })
    .int()
    .positive("Size must be more than 0")
    .max(MAX_VOLUME_ML),
  pricePaisa: z.number({ error: "Enter a valid price" }).pipe(paisaSchema),
  sku: z.string().trim().min(1, "SKU is required").max(64),
  reorderLevel: z
    .number({ error: "Enter a number" })
    .int()
    .min(0, "Can't be negative")
    .max(MAX_STOCK_LEVEL),
  isActive: z.boolean(),
});
export type ProductVariantInput = z.input<typeof productVariantInputSchema>;

export const productInputSchema = z.object({
  categoryId: z.uuid("Choose a category"),
  slug: slugInputSchema,
  coverageSqftPerLitre: z
    .number({ error: "Enter the coverage" })
    .positive("Coverage must be more than 0")
    .max(10_000)
    .refine((value) => Math.round(value * 100) === value * 100, {
      message: "Use at most 2 decimal places",
    }),
  defaultCoats: z
    .number({ error: "Enter the number of coats" })
    .int()
    .min(MIN_COATS)
    .max(MAX_COATS),
  isActive: z.boolean(),
  translations: contentTranslationsSchema,
  imageFileIds: z.array(z.uuid()).max(MAX_PRODUCT_IMAGES),
  variants: z
    .array(productVariantInputSchema)
    .min(1, "Add at least one size")
    .superRefine((variants, ctx) => {
      const volumes = new Map<number, number>();
      const skus = new Map<string, number>();
      variants.forEach((variant, index) => {
        const sameVolume = volumes.get(variant.volumeMl);
        if (sameVolume !== undefined) {
          ctx.addIssue({ code: "custom", path: [index, "volumeMl"], message: "This size is listed twice" });
        }
        volumes.set(variant.volumeMl, index);
        const sku = variant.sku.trim().toLowerCase();
        if (sku && skus.has(sku)) {
          ctx.addIssue({ code: "custom", path: [index, "sku"], message: "This SKU is listed twice" });
        }
        skus.set(sku, index);
      });
    }),
});
export type ProductInput = z.input<typeof productInputSchema>;

export const PRODUCT_SORT_KEYS = ["name", "createdAt", "updatedAt", "stock"] as const;

export const productListQuerySchema = z.object({
  ...paginationQueryShape,
  ...searchQueryShape,
  ...ListQuerySchema.sort(PRODUCT_SORT_KEYS, "updatedAt"),
  categoryId: ListQuerySchema.optionalUuid(),
  status: ListQuerySchema.optionalEnum(ACTIVE_FILTERS),
  lowStock: ListQuerySchema.optionalBool(),
});
export type ProductListQuery = z.output<typeof productListQuerySchema>;

export const variantSearchQuerySchema = z.object({
  ...paginationQueryShape,
  ...searchQueryShape,
  // Pickers for new stock lines hide inactive sizes; history views don't.
  includeInactive: ListQuerySchema.optionalBool(),
});
export type VariantSearchQuery = z.output<typeof variantSearchQuerySchema>;
