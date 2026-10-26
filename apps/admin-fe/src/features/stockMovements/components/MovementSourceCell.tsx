import type { IStockMovement } from "../types";

import { Link } from "@tanstack/react-router";

import { AdjustmentReasonHelper } from "#/features/stockAdjustments/helpers/adjustmentReason.helper";
import { DateHelper } from "#/lib/helpers/date.helper";
import { m } from "#/paraglide/messages";

interface MovementSourceCellProps {
  movement: IStockMovement;
}

export function MovementSourceCell({ movement }: MovementSourceCellProps) {
  if (movement.batchId && movement.batchNumber !== null) {
    return (
      <Link
        to="/stock/batches/$batchId"
        params={{ batchId: movement.batchId }}
        className="hover:underline"
      >
        {m.batches_number({ number: movement.batchNumber })}
      </Link>
    );
  }
  if (movement.saleDate) {
    return (
      <Link
        to="/stock/sales/$date"
        params={{ date: movement.saleDate }}
        className="hover:underline"
      >
        {m.movements_sales_of({
          date: DateHelper.formatCalendarDate(movement.saleDate),
        })}
      </Link>
    );
  }
  if (movement.adjustmentReason)
    return <>{AdjustmentReasonHelper.text(movement.adjustmentReason)}</>;
  return <>—</>;
}
