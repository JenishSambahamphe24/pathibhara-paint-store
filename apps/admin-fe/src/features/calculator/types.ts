export type TAreaFormValue = {
  label: string;
  widthFt: number | null;
  heightFt: number | null;
  quantity: number | null;
};

export type TEstimateProductFormValue = {
  productId: string;
  coats: number | null;
};

export type TSectionFormValue = {
  name: string;
  surfaces: Array<TAreaFormValue>;
  deductions: Array<TAreaFormValue>;
  products: Array<TEstimateProductFormValue>;
};

export type TCalculatorFormValues = {
  wastagePercent: number | null;
  sections: Array<TSectionFormValue>;
};

export type TAreaKind = "surfaces" | "deductions";
