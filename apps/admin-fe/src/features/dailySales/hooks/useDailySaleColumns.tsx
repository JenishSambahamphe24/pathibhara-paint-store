import type { IDailySale } from "../types";
import type { ColumnDef } from "@tanstack/react-table";

import { Link } from "@tanstack/react-router";

import { CurrencyHelper } from "#/lib/helpers/currency.helper";
import { DateHelper } from "#/lib/helpers/date.helper";
import { m } from "#/paraglide/messages";

export function useDailySaleColumns(): Array<ColumnDef<IDailySale>> {
  return [
    {
      id: "saleDate",
      header: m.sales_column_date(),
      cell: ({ row }) => (
        <Link
          to="/stock/sales/$date"
          params={{ date: row.original.saleDate }}
          className="font-medium text-foreground hover:underline"
        >
          {DateHelper.formatCalendarDate(row.original.saleDate)}
        </Link>
      ),
    },
    {
      id: "lines",
      header: m.sales_column_lines(),
      enableSorting: false,
      cell: ({ row }) => row.original.lineCount,
    },
    {
      id: "units",
      header: m.sales_column_units(),
      cell: ({ row }) => row.original.units,
    },
    {
      id: "revenue",
      header: m.sales_column_revenue(),
      cell: ({ row }) => CurrencyHelper.formatNpr(row.original.revenuePaisa),
    },
    {
      id: "updatedBy",
      header: m.common_recorded_by(),
      enableSorting: false,
      cell: ({ row }) =>
        `${row.original.updatedByName}, ${DateHelper.formatDateTime(row.original.updatedAt)}`,
    },
  ];
}
