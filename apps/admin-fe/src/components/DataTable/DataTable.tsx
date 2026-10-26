import type {
  ColumnDef,
  OnChangeFn,
  RowData,
  SortingState,
} from "@tanstack/react-table";
import type { TPagination } from "#/types/api.types";
import type { ReactNode } from "react";

import { Pagination } from "#/components/Pagination/Pagination";
import { Table } from "#/components/Table/Table";

import { PaginationHelper } from "#/lib/helpers/pagination.helper";

interface DataTableProps<TData extends RowData> {
  data: Array<TData>;
  columns: Array<ColumnDef<TData, any>>;
  pagination: TPagination;
  onNavigateNext: () => void;
  onNavigatePrevious: () => void;
  onPerPageChange: (perPage: number) => void;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  manualSorting?: boolean;
  enableSorting?: boolean;
  emptyState?: ReactNode;
  isLoading?: boolean;
  perPageOptions?: number[];
  /** On by default — pass false only for tables with no real page size to
   * change (e.g. an unpaginated live set rendered through synthetic
   * pagination). */
  showPerPage?: boolean;
  className?: string;
  isRowInactive?: (row: TData) => boolean;
  isRowHighlighted?: (row: TData) => boolean;
}

export function DataTable<TData extends RowData>({
  data,
  columns,
  pagination,
  onNavigateNext,
  onNavigatePrevious,
  onPerPageChange,
  sorting,
  onSortingChange,
  manualSorting,
  enableSorting,
  emptyState,
  isLoading,
  perPageOptions,
  showPerPage = true,
  className,
  isRowInactive,
  isRowHighlighted,
}: DataTableProps<TData>) {
  const isPageBased = PaginationHelper.isPageBased(pagination);
  const hasNextPage = PaginationHelper.hasNextPage(pagination);
  const hasPreviousPage = PaginationHelper.hasPreviousPage(pagination);

  const currentPage = isPageBased ? pagination.currentPage : undefined;
  const totalPages = isPageBased
    ? PaginationHelper.getTotalPages(pagination)
    : undefined;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <Table
        data={data}
        columns={columns}
        sorting={sorting}
        onSortingChange={onSortingChange}
        manualSorting={manualSorting}
        enableSorting={enableSorting}
        emptyState={emptyState}
        isLoading={isLoading}
        skeletonRows={pagination.perPage}
        className={className}
        isRowInactive={isRowInactive}
        isRowHighlighted={isRowHighlighted}
      />

      <Pagination
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onNextPage={onNavigateNext}
        onPreviousPage={onNavigatePrevious}
        currentPage={currentPage}
        totalPages={totalPages}
        perPage={pagination.perPage}
        onPerPageChange={onPerPageChange}
        perPageOptions={perPageOptions}
        showPerPage={showPerPage}
      />
    </div>
  );
}
