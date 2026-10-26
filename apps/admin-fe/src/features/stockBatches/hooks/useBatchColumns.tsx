import type { IStockBatch } from "../types";
import type { ColumnDef } from "@tanstack/react-table";

import { Link } from "@tanstack/react-router";

import { Chip } from "#/components/Chip/Chip";

import { CurrencyHelper } from "#/lib/helpers/currency.helper";
import { DateHelper } from "#/lib/helpers/date.helper";
import { m } from "#/paraglide/messages";

export function useBatchColumns(): Array<ColumnDef<IStockBatch>> {
  return [
    {
      id: "batchNumber",
      header: m.batches_column_batch(),
      cell: ({ row }) => (
        <Link
          to="/stock/batches/$batchId"
          params={{ batchId: row.original.id }}
          className="font-medium text-foreground hover:underline"
        >
          {m.batches_number({ number: row.original.batchNumber })}
        </Link>
      ),
    },
    {
      id: "receivedOn",
      header: m.batches_received_on(),
      cell: ({ row }) => DateHelper.formatCalendarDate(row.original.receivedOn),
    },
    {
      id: "supplier",
      header: m.batches_supplier(),
      enableSorting: false,
      cell: ({ row }) => row.original.supplierName ?? "—",
    },
    {
      id: "lines",
      header: m.batches_column_lines(),
      enableSorting: false,
      cell: ({ row }) =>
        m.batches_lines_units({
          lines: row.original.itemCount,
          units: row.original.totalUnits,
        }),
    },
    {
      id: "cost",
      header: m.batches_column_cost(),
      enableSorting: false,
      cell: ({ row }) => CurrencyHelper.formatNpr(row.original.totalCostPaisa),
    },
    {
      id: "status",
      header: m.common_status(),
      enableSorting: false,
      cell: ({ row }) =>
        row.original.status === "voided" ? (
          <Chip variant="danger">{m.batches_voided()}</Chip>
        ) : (
          <Chip variant="success">{m.batches_recorded()}</Chip>
        ),
    },
    {
      id: "createdBy",
      header: m.common_recorded_by(),
      enableSorting: false,
      cell: ({ row }) => row.original.createdByName,
    },
  ];
}
