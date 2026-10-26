export interface IDailySale {
  id: string;
  saleDate: string;
  lineCount: number;
  units: number;
  revenuePaisa: number;
  updatedByName: string;
  updatedAt: string;
}

export interface IDailySaleItem {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  volumeMl: number;
  sku: string;
  quantity: number;
  unitPricePaisa: number;
  currentStock: number;
}

export interface IDailySaleDetail extends IDailySale {
  notes: string | null;
  createdByName: string;
  createdAt: string;
  items: Array<IDailySaleItem>;
}

export type TSaleLineFormValue = { variantId: string; quantity: number | null };
export type TDailySaleFormValues = {
  notes: string;
  items: Array<TSaleLineFormValue>;
};

// What the entry page knows about a size: its name, the price the line will
// use, and how many can still be sold on this day.
export interface ISaleLineInfo {
  label: string;
  unitPricePaisa: number;
  available: number;
}
