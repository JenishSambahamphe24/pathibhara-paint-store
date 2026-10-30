import { BaseDto, z } from "@repo/http-kit";
import { costEstimateInputSchema } from "@repo/shared";

export class CostEstimateInputDto extends BaseDto {
  static override readonly schema = costEstimateInputSchema;
}

export class CalculatorDefaultsDto extends BaseDto {
  static override readonly schema = z.object({ wastagePercent: z.number() });
}

const publicContainerSchema = z.object({
  variantId: z.uuid(),
  volumeMl: z.number().int(),
  count: z.number().int(),
  unitPricePaisa: z.number().int(),
  lineTotalPaisa: z.number().int(),
});

const containerSchema = publicContainerSchema.extend({
  currentStock: z.number().int().nullable(),
  isShort: z.boolean(),
});

const publicProductLineSchema = z.object({
  productId: z.uuid(),
  name: z.string(),
  coats: z.number().int(),
  coverageSqftPerLitre: z.number(),
  areaSqft: z.number(),
  requiredMl: z.number().int(),
  roundedMl: z.number().int(),
  purchasedMl: z.number().int(),
  overshootMl: z.number().int(),
  containers: z.array(publicContainerSchema),
  costPaisa: z.number().int(),
});

const productLineSchema = publicProductLineSchema.extend({
  containers: z.array(containerSchema),
  hasStockShortage: z.boolean(),
});

const publicSectionSchema = z.object({
  name: z.string(),
  grossAreaSqft: z.number(),
  deductionAreaSqft: z.number(),
  netAreaSqft: z.number(),
  products: z.array(publicProductLineSchema),
  subtotalPaisa: z.number().int(),
});

// The customer's estimate: same quantities and selling prices as the admin's,
// without the stock counts and shortage flags.
export class PublicCostEstimateResultDto extends BaseDto {
  static override readonly schema = z.object({
    wastagePercent: z.number(),
    sections: z.array(publicSectionSchema),
    totalPaisa: z.number().int(),
  });
}

export class CostEstimateResultDto extends BaseDto {
  static override readonly schema = z.object({
    wastagePercent: z.number(),
    sections: z.array(publicSectionSchema.extend({ products: z.array(productLineSchema) })),
    totalPaisa: z.number().int(),
    hasStockShortage: z.boolean(),
  });
}
