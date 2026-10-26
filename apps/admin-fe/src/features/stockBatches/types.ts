import type { BatchStatus, StockBatchInput } from "@repo/shared";

export interface IStockBatch {
  id: string;
  batchNumber: number;
  receivedOn: string;
  supplierName: string | null;
  status: BatchStatus;
  itemCount: number;
  totalUnits: number;
  totalCostPaisa: number | null;
  createdByName: string;
  createdAt: string;
}

export interface IStockBatchItem {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  volumeMl: number;
  sku: string;
  quantity: number;
  unitCostPaisa: number | null;
  currentStock: number;
}

export interface IStockBatchDetail extends IStockBatch {
  notes: string | null;
  voidedAt: string | null;
  voidedByName: string | null;
  voidReason: string | null;
  items: Array<IStockBatchItem>;
}

export type TBatchLineFormValue = {
  variantId: string;
  quantity: number | null;
  unitCostPaisa: number | null;
};
export type TBatchFormValues = Omit<
  StockBatchInput,
  "items" | "supplierName" | "notes"
> & {
  supplierName: string;
  notes: string;
  items: Array<TBatchLineFormValue>;
};
