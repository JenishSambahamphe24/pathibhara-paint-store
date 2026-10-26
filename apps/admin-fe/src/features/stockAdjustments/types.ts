import type { StockAdjustmentReason } from "@repo/shared";

export interface IStockAdjustment {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  volumeMl: number;
  sku: string;
  quantityDelta: number;
  reason: StockAdjustmentReason;
  note: string | null;
  createdByName: string;
  createdAt: string;
}

export type TAdjustmentFormValues = {
  variantId: string;
  quantityDelta: number | null;
  reason: StockAdjustmentReason | null;
  note: string;
};
