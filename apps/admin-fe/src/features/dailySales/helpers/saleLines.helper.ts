import type {
  IDailySaleDetail,
  ISaleLineInfo,
  TSaleLineFormValue,
} from "../types";
import type { IVariantSummary } from "#/features/products/types";

import { VariantLabelHelper } from "#/features/products/helpers/variantLabel.helper";

export class SaleLinesHelper {
  static emptyLine(): TSaleLineFormValue {
    return { variantId: "", quantity: null };
  }

  // A line already saved keeps its sold price, and the units it holds are
  // available to it again when editing (they were taken from stock earlier).
  static infoFromSaved(
    sale: IDailySaleDetail | null,
  ): Map<string, ISaleLineInfo> {
    return new Map(
      (sale?.items ?? []).map((item) => [
        item.variantId,
        {
          label: VariantLabelHelper.label(item),
          unitPricePaisa: item.unitPricePaisa,
          available: item.currentStock + item.quantity,
        },
      ]),
    );
  }

  static infoFromVariant(variant: IVariantSummary): ISaleLineInfo {
    return {
      label: VariantLabelHelper.label(variant),
      unitPricePaisa: variant.pricePaisa,
      available: variant.currentStock,
    };
  }

  static totals(
    lines: Array<TSaleLineFormValue>,
    info: Map<string, ISaleLineInfo>,
  ) {
    let units = 0;
    let revenuePaisa = 0;
    for (const line of lines) {
      const known = info.get(line.variantId);
      if (!known || !line.quantity || line.quantity < 0) continue;
      units += line.quantity;
      revenuePaisa += line.quantity * known.unitPricePaisa;
    }
    return { units, revenuePaisa };
  }
}
