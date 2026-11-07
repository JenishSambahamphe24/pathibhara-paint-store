export type TSectionKey = "interior" | "exterior";

export type TPresetId = "room" | "exterior" | "blank";

// What the visitor is typing: sizes stay strings until they're sent, so a
// half-typed "12." isn't rewritten under their cursor.
export interface IAreaRow {
  id: string;
  label: string;
  width: string;
  height: string;
  quantity: number;
}

export interface IProductRow {
  id: string;
  // Empty until the visitor picks one.
  productId: string;
  coats: number;
}

export interface ISectionDraft {
  key: TSectionKey;
  name: string;
  isOn: boolean;
  surfaces: Array<IAreaRow>;
  deductions: Array<IAreaRow>;
  products: Array<IProductRow>;
}

export interface IEstimateContainerLine {
  variantId: string;
  volumeMl: number;
  count: number;
  unitPricePaisa: number;
  lineTotalPaisa: number;
}

export interface IEstimateProductLine {
  productId: string;
  name: string;
  coats: number;
  coverageSqftPerLitre: number;
  areaSqft: number;
  // Paint the job needs, wastage included, before rounding to can sizes.
  requiredMl: number;
  purchasedMl: number;
  costPaisa: number;
  containers: Array<IEstimateContainerLine>;
}

export interface IEstimateSection {
  name: string;
  grossAreaSqft: number;
  deductionAreaSqft: number;
  netAreaSqft: number;
  products: Array<IEstimateProductLine>;
  subtotalPaisa: number;
}

export interface IEstimateResult {
  wastagePercent: number;
  sections: Array<IEstimateSection>;
  totalPaisa: number;
}
