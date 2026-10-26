import type {
  TAreaFormValue,
  TCalculatorFormValues,
  TEstimateProductFormValue,
  TSectionFormValue,
} from "../types";

export class CalculatorFormHelper {
  static emptyArea(label = ""): TAreaFormValue {
    return { label, widthFt: null, heightFt: null, quantity: 1 };
  }

  static emptyProduct(): TEstimateProductFormValue {
    return { productId: "", coats: null };
  }

  static emptySection(name: string): TSectionFormValue {
    return {
      name,
      surfaces: [CalculatorFormHelper.emptyArea()],
      deductions: [],
      products: [CalculatorFormHelper.emptyProduct()],
    };
  }

  static defaults(wastagePercent: number): TCalculatorFormValues {
    return {
      wastagePercent,
      sections: [CalculatorFormHelper.emptySection("Interior")],
    };
  }

  // For the live total next to a row; the server recomputes everything.
  static area(item: TAreaFormValue | undefined): number | null {
    if (!item?.widthFt || !item.heightFt || !item.quantity) return null;
    return item.widthFt * item.heightFt * item.quantity;
  }
}
