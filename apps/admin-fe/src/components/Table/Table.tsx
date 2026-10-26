import type {
  ColumnDef,
  OnChangeFn,
  RowData,
  SortingState,
} from "@tanstack/react-table";
import type { ITableColumnMeta } from "#/components/Table/types";
import type { ReactNode } from "react";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import { useState } from "react";

import { SkeletonCell } from "#/components/Table/SkeletonCell";
import { SortIcon } from "#/components/Table/SortIcon";
import { TruncatedCell } from "#/components/Table/TruncatedCell";

import { m } from "#/paraglide/messages";

interface TableProps<TData extends RowData> {
  data: Array<TData>;
  columns: Array<ColumnDef<TData, any>>;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  manualSorting?: boolean;
  enableSorting?: boolean;
  emptyState?: ReactNode;
  className?: string;
  isLoading?: boolean;
  skeletonRows?: number;
  isRowInactive?: (row: TData) => boolean;
  isRowHighlighted?: (row: TData) => boolean;
}

export function Table<TData extends RowData>({
  data,
  columns,
  sorting: externalSorting,
  onSortingChange: externalOnSortingChange,
  manualSorting = false,
  enableSorting = true,
  emptyState,
  className,
  isLoading = false,
  skeletonRows = 5,
  isRowInactive,
  isRowHighlighted,
}: TableProps<TData>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);

  const sorting = externalSorting ?? internalSorting;
  const onSortingChange = externalOnSortingChange ?? setInternalSorting;

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    manualSorting,
    enableSorting,
  });

  return (
    <div className={clsx("overflow-x-auto", className)}>
      <table className="min-w-full text-left text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-border">
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();

                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className={clsx(
                      "px-4 py-3 text-xs font-semibold tracking-wide whitespace-nowrap text-foreground-subtle uppercase",
                      canSort && "cursor-pointer select-none",
                    )}
                    onClick={
                      canSort
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center gap-1.5">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {canSort && (
                          <SortIcon direction={header.column.getIsSorted()} />
                        )}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>

        <tbody>
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <tr
                key={`skeleton-${String(rowIndex)}`}
                className="border-b border-border-muted"
              >
                {columns.map((_col, colIndex) => (
                  <td
                    key={`skeleton-${String(rowIndex)}-${String(colIndex)}`}
                    className="px-4 py-3"
                  >
                    <SkeletonCell />
                  </td>
                ))}
              </tr>
            ))
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-sm text-foreground-faint"
              >
                {emptyState ?? m.table_empty()}
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => {
              const inactive = isRowInactive?.(row.original) ?? false;
              const highlighted =
                !inactive && (isRowHighlighted?.(row.original) ?? false);
              return (
                <tr
                  key={row.id}
                  className={clsx(
                    "border-b border-border-muted transition-colors",
                    inactive &&
                      "bg-surface-subtle/70 hover:bg-surface-strong/50 [&_a]:opacity-60 [&_a]:hover:opacity-80",
                    highlighted &&
                      "bg-success-subtle/40 hover:bg-success-subtle/60",
                    !inactive && !highlighted && "hover:bg-surface-muted/50",
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as
                      | ITableColumnMeta
                      | undefined;
                    const skipTruncate = meta?.skipTruncate === true;
                    const content = flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    );

                    return (
                      <td
                        key={cell.id}
                        className={clsx(
                          "px-4 py-3 text-sm whitespace-nowrap",
                          inactive
                            ? "text-foreground-faint"
                            : "text-foreground-muted",
                        )}
                      >
                        {skipTruncate ? (
                          content
                        ) : (
                          <TruncatedCell maxWidth={meta?.maxWidth}>
                            {content}
                          </TruncatedCell>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
