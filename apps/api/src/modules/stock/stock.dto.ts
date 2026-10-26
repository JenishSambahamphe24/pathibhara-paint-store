import { BaseDto, z } from "@repo/http-kit";
import {
  BATCH_STATUSES,
  dailySaleInputSchema,
  dailySaleListQuerySchema,
  STOCK_ADJUSTMENT_REASONS,
  STOCK_MOVEMENT_TYPES,
  stockAdjustmentInputSchema,
  stockAdjustmentListQuerySchema,
  stockBatchInputSchema,
  stockBatchListQuerySchema,
  stockBatchVoidSchema,
  stockMovementListQuerySchema,
} from "@repo/shared";

export class StockBatchInputDto extends BaseDto {
  static override readonly schema = stockBatchInputSchema;
}
export class StockBatchVoidDto extends BaseDto {
  static override readonly schema = stockBatchVoidSchema;
}
export class StockBatchListQueryDto extends BaseDto {
  static override readonly schema = stockBatchListQuerySchema;
}
export class DailySaleInputDto extends BaseDto {
  static override readonly schema = dailySaleInputSchema;
}
export class DailySaleListQueryDto extends BaseDto {
  static override readonly schema = dailySaleListQuerySchema;
}
export class StockAdjustmentInputDto extends BaseDto {
  static override readonly schema = stockAdjustmentInputSchema;
}
export class StockAdjustmentListQueryDto extends BaseDto {
  static override readonly schema = stockAdjustmentListQuerySchema;
}
export class StockMovementListQueryDto extends BaseDto {
  static override readonly schema = stockMovementListQuerySchema;
}

export class SaleDateParamsDto extends BaseDto {
  static override readonly schema = z.object({ date: z.iso.date() });
}

const variantRefSchema = {
  variantId: z.uuid(),
  productId: z.uuid(),
  productName: z.string(),
  volumeMl: z.number().int(),
  sku: z.string(),
};

export class StockBatchListItemDto extends BaseDto {
  static override readonly schema = z.object({
    id: z.uuid(),
    batchNumber: z.number().int(),
    receivedOn: z.iso.date(),
    supplierName: z.string().nullable(),
    status: z.enum(BATCH_STATUSES),
    itemCount: z.number().int(),
    totalUnits: z.number().int(),
    // Null when no line has a cost; partial when only some lines do.
    totalCostPaisa: z.number().int().nullable(),
    createdByName: z.string(),
    createdAt: z.iso.datetime(),
  });
}

export class StockBatchDetailDto extends BaseDto {
  static override readonly schema = StockBatchListItemDto.schema.extend({
    notes: z.string().nullable(),
    voidedAt: z.iso.datetime().nullable(),
    voidedByName: z.string().nullable(),
    voidReason: z.string().nullable(),
    items: z.array(
      z.object({
        id: z.uuid(),
        ...variantRefSchema,
        quantity: z.number().int(),
        unitCostPaisa: z.number().int().nullable(),
        currentStock: z.number().int(),
      }),
    ),
  });
}

export class DailySaleListItemDto extends BaseDto {
  static override readonly schema = z.object({
    id: z.uuid(),
    saleDate: z.iso.date(),
    lineCount: z.number().int(),
    units: z.number().int(),
    revenuePaisa: z.number().int(),
    updatedByName: z.string(),
    updatedAt: z.iso.datetime(),
  });
}

export class DailySaleDetailDto extends BaseDto {
  static override readonly schema = DailySaleListItemDto.schema.extend({
    notes: z.string().nullable(),
    createdByName: z.string(),
    createdAt: z.iso.datetime(),
    items: z.array(
      z.object({
        id: z.uuid(),
        ...variantRefSchema,
        quantity: z.number().int(),
        unitPricePaisa: z.number().int(),
        currentStock: z.number().int(),
      }),
    ),
  });
}

export class StockAdjustmentDto extends BaseDto {
  static override readonly schema = z.object({
    id: z.uuid(),
    ...variantRefSchema,
    quantityDelta: z.number().int(),
    reason: z.enum(STOCK_ADJUSTMENT_REASONS),
    note: z.string().nullable(),
    createdByName: z.string(),
    createdAt: z.iso.datetime(),
  });
}

export class StockMovementDto extends BaseDto {
  static override readonly schema = z.object({
    id: z.uuid(),
    ...variantRefSchema,
    type: z.enum(STOCK_MOVEMENT_TYPES),
    quantityDelta: z.number().int(),
    balanceAfter: z.number().int(),
    batchId: z.uuid().nullable(),
    batchNumber: z.number().int().nullable(),
    dailySaleId: z.uuid().nullable(),
    saleDate: z.iso.date().nullable(),
    adjustmentId: z.uuid().nullable(),
    adjustmentReason: z.enum(STOCK_ADJUSTMENT_REASONS).nullable(),
    createdByName: z.string(),
    createdAt: z.iso.datetime(),
  });
}
