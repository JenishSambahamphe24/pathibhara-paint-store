import type {
  ColumnDef,
  OnChangeFn,
  RowData,
  SortingState,
} from "@tanstack/react-table";
import type { IPagination } from "#/types/api.types";
import type { ReactNode } from "react";

import { Pagination } from "#/components/Pagination/Pagination";
import { Table } from "#/components/Table/Table";

import { PaginationHelper } from "#/lib/helpers/pagination.helper";

interface DataTableProps<TData extends RowData> {
  data: Array<TData>;
  columns: Array<ColumnDef<TData, any>>;
  pagination: IPagination;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  emptyState?: ReactNode;
  isLoading?: boolean;
  perPageOptions?: Array<number>;
  className?: string;
  isRowInactive?: (row: TData) => boolean;
  isRowHighlighted?: (row: TData) => boolean;
}

// Server-side pagination and sorting: the table never sorts its own page.
export function DataTable<TData extends RowData>({
  data,
  columns,
  pagination,
  onPageChange,
  onPerPageChange,
  sorting,
  onSortingChange,
  emptyState,
  isLoading,
  perPageOptions = [10, 20, 50, 100],
  className,
  isRowInactive,
  isRowHighlighted,
}: DataTableProps<TData>) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <Table
        data={data}
        columns={columns}
        sorting={sorting}
        onSortingChange={onSortingChange}
        manualSorting
        enableSorting={!!onSortingChange}
        emptyState={emptyState}
        isLoading={isLoading}
        skeletonRows={Math.min(pagination.perPage, 10)}
        className={className}
        isRowInactive={isRowInactive}
        isRowHighlighted={isRowHighlighted}
      />

      <Pagination
        hasNextPage={PaginationHelper.hasNextPage(pagination)}
        hasPreviousPage={PaginationHelper.hasPreviousPage(pagination)}
        onNextPage={() => onPageChange(pagination.page + 1)}
        onPreviousPage={() => onPageChange(pagination.page - 1)}
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        perPage={pagination.perPage}
        onPerPageChange={onPerPageChange}
        perPageOptions={perPageOptions}
        showPerPage
      />
    </div>
  );
}
