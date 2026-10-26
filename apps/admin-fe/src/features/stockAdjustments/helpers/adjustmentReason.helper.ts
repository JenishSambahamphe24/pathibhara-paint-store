import type { StockAdjustmentReason } from "@repo/shared";

import { m } from "#/paraglide/messages";

export class AdjustmentReasonHelper {
  static text(reason: StockAdjustmentReason): string {
    const labels: Record<StockAdjustmentReason, () => string> = {
      damaged: m.adjustments_reason_damaged,
      returned: m.adjustments_reason_returned,
      countCorrection: m.adjustments_reason_count,
      other: m.adjustments_reason_other,
    };
    return labels[reason]();
  }
}
