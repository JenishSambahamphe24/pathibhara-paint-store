import type { TBatchLineFormValue } from "../types";

export class BatchFormHelper {
  static emptyLine(): TBatchLineFormValue {
    return { variantId: "", quantity: null, unitCostPaisa: null };
  }
}
