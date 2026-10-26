import type { StockAdjustmentReason, StockMovementType } from "@repo/shared";

export interface IStockMovement {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  volumeMl: number;
  sku: string;
  type: StockMovementType;
  quantityDelta: number;
  balanceAfter: number;
  batchId: string | null;
  batchNumber: number | null;
  dailySaleId: string | null;
  saleDate: string | null;
  adjustmentId: string | null;
  adjustmentReason: StockAdjustmentReason | null;
  createdByName: string;
  createdAt: string;
}
