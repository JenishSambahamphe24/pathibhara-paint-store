export const STOCK_MOVEMENT_TYPES = [
  "batchIn",
  "batchVoid",
  "sale",
  "saleEdit",
  "adjustment",
] as const;
export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[number];

export const STOCK_ADJUSTMENT_REASONS = [
  "damaged",
  "returned",
  "countCorrection",
  "other",
] as const;
export type StockAdjustmentReason = (typeof STOCK_ADJUSTMENT_REASONS)[number];
