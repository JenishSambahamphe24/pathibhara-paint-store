import { z } from "zod";

import { MAX_COATS, MIN_COATS } from "../catalog/constants";
import { TextSchema } from "../helpers/text.schema";

const MAX_DIMENSION_FT = 1000;
const MAX_AREA_ITEMS = 100;

const dimensionSchema = z
  .number({ error: "Enter a size in feet" })
  .positive("Must be more than 0")
  .max(MAX_DIMENSION_FT, `Must be ${MAX_DIMENSION_FT} ft or less`);

export const areaItemSchema = z.object({
  label: TextSchema.optional(80),
  widthFt: dimensionSchema,
  heightFt: dimensionSchema,
  quantity: z.number({ error: "Enter how many" }).int("Use a whole number").min(1, "At least 1").max(500),
});
export type AreaItemInput = z.input<typeof areaItemSchema>;

export const estimateProductSchema = z.object({
  productId: z.uuid("Choose a product"),
  coats: z.number({ error: "Enter the coats" }).int().min(MIN_COATS).max(MAX_COATS),
});

export const estimateSectionSchema = z
  .object({
    name: TextSchema.required(60, "Name this section, e.g. Interior"),
    surfaces: z.array(areaItemSchema).min(1, "Add at least one wall or surface").max(MAX_AREA_ITEMS),
    deductions: z.array(areaItemSchema).max(MAX_AREA_ITEMS),
    products: z
      .array(estimateProductSchema)
      .min(1, "Choose at least one product")
      .max(10)
      .superRefine((products, ctx) => {
        const seen = new Set<string>();
        products.forEach((product, index) => {
          if (seen.has(product.productId)) {
            ctx.addIssue({ code: "custom", path: [index, "productId"], message: "This product is listed twice" });
          }
          seen.add(product.productId);
        });
      }),
  })
  .superRefine((section, ctx) => {
    const gross = AreaMath.total(section.surfaces);
    const deducted = AreaMath.total(section.deductions);
    if (deducted >= gross) {
      ctx.addIssue({
        code: "custom",
        path: ["deductions"],
        message: "Doors and windows can't cover the whole wall area",
      });
    }
  });

export const costEstimateInputSchema = z.object({
  wastagePercent: z
    .number({ error: "Enter a wastage percentage" })
    .min(0, "Can't be negative")
    .max(50, "At most 50%"),
  sections: z.array(estimateSectionSchema).min(1, "Add at least one section").max(20),
});
export type CostEstimateInput = z.input<typeof costEstimateInputSchema>;
export type CostEstimate = z.output<typeof costEstimateInputSchema>;

export class AreaMath {
  static total(items: ReadonlyArray<{ widthFt: number; heightFt: number; quantity: number }>): number {
    return items.reduce((sum, item) => sum + item.widthFt * item.heightFt * item.quantity, 0);
  }
}
