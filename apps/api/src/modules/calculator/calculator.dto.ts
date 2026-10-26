import { BaseDto, z } from "@repo/http-kit";
import { costEstimateInputSchema } from "@repo/shared";

export class CostEstimateInputDto extends BaseDto {
  static override readonly schema = costEstimateInputSchema;
}

export class CalculatorDefaultsDto extends BaseDto {
  static override readonly schema = z.object({ wastagePercent: z.number() });
}

const containerSchema = z.object({
  variantId: z.uuid(),
  volumeMl: z.number().int(),
  count: z.number().int(),
  unitPricePaisa: z.number().int(),
  lineTotalPaisa: z.number().int(),
  currentStock: z.number().int().nullable(),
  isShort: z.boolean(),
});

const productLineSchema = z.object({
  productId: z.uuid(),
  name: z.string(),
  coats: z.number().int(),
  coverageSqftPerLitre: z.number(),
  areaSqft: z.number(),
  requiredMl: z.number().int(),
  roundedMl: z.number().int(),
  purchasedMl: z.number().int(),
  overshootMl: z.number().int(),
  containers: z.array(containerSchema),
  costPaisa: z.number().int(),
  hasStockShortage: z.boolean(),
});

export class CostEstimateResultDto extends BaseDto {
  static override readonly schema = z.object({
    wastagePercent: z.number(),
    sections: z.array(
      z.object({
        name: z.string(),
        grossAreaSqft: z.number(),
        deductionAreaSqft: z.number(),
        netAreaSqft: z.number(),
        products: z.array(productLineSchema),
        subtotalPaisa: z.number().int(),
      }),
    ),
    totalPaisa: z.number().int(),
    hasStockShortage: z.boolean(),
  });
}
