import type { StockMovementType } from "@repo/shared";

import { m } from "#/paraglide/messages";

export class MovementTypeHelper {
  static label(type: StockMovementType): string {
    const labels: Record<StockMovementType, () => string> = {
      batchIn: m.movements_type_batch_in,
      batchVoid: m.movements_type_batch_void,
      sale: m.movements_type_sale,
      saleEdit: m.movements_type_sale_edit,
      adjustment: m.movements_type_adjustment,
    };
    return labels[type]();
  }
}
