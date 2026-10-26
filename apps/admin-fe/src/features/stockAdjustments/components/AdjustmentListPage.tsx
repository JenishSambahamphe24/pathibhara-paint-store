import type { IStockAdjustment } from "../types";
import type { StockAdjustmentListQuery } from "@repo/shared";
import type { ColumnDef } from "@tanstack/react-table";

import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { Plus } from "lucide-react";
import { useState } from "react";

import { STOCK_ADJUSTMENT_REASONS, VolumeHelper } from "@repo/shared";

import { BreadCrumb } from "#/components/Breadcrumb/Breadcrumb";
import { Button } from "#/components/Button/Button";
import { DataTable } from "#/components/DataTable/DataTable";
import { DateRangeFilter } from "#/components/DateRangeFilter/DateRangeFilter";
import { FilterSelect } from "#/components/FilterSelect/FilterSelect";
import { PageHeader } from "#/components/PageHeader/PageHeader";
import { SearchInput } from "#/components/SearchInput/SearchInput";

import { DateHelper } from "#/lib/helpers/date.helper";
import { PaginationHelper } from "#/lib/helpers/pagination.helper";
import { SortingHelper } from "#/lib/helpers/sorting.helper";
import { m } from "#/paraglide/messages";

import { AdjustmentReasonHelper } from "../helpers/adjustmentReason.helper";
import { useStockAdjustments } from "../hooks/useStockAdjustments";
import { AdjustmentFormDrawer } from "./AdjustmentFormDrawer";

interface AdjustmentListPageProps {
  search: StockAdjustmentListQuery;
  onSearchChange: (patch: Partial<StockAdjustmentListQuery>) => void;
}

const columns: Array<ColumnDef<IStockAdjustment>> = [
  {
    id: "createdAt",
    header: () => m.common_when(),
    cell: ({ row }) => DateHelper.formatDateTime(row.original.createdAt),
  },
  {
    id: "product",
    header: () => m.common_product_size(),
    enableSorting: false,
    cell: ({ row }) => (
      <Link
        to="/products/$productId"
        params={{ productId: row.original.productId }}
        className="text-foreground hover:underline"
      >
        {row.original.productName} {VolumeHelper.label(row.original.volumeMl)}
      </Link>
    ),
  },
  {
    id: "quantityDelta",
    header: () => m.adjustments_change(),
    cell: ({ row }) => (
      <span
        className={clsx(
          "font-medium",
          row.original.quantityDelta < 0 ? "text-danger" : "text-success",
        )}
      >
        {row.original.quantityDelta > 0
          ? `+${row.original.quantityDelta}`
          : row.original.quantityDelta}
      </span>
    ),
  },
  {
    id: "reason",
    header: () => m.adjustments_reason(),
    enableSorting: false,
    cell: ({ row }) => AdjustmentReasonHelper.text(row.original.reason),
  },
  {
    id: "note",
    header: () => m.adjustments_note(),
    enableSorting: false,
    meta: { maxWidth: "lg" },
    cell: ({ row }) => row.original.note ?? "—",
  },
  {
    id: "by",
    header: () => m.common_recorded_by(),
    enableSorting: false,
    cell: ({ row }) => row.original.createdByName,
  },
];

export function AdjustmentListPage({
  search,
  onSearchChange,
}: AdjustmentListPageProps) {
  const { data, isLoading } = useStockAdjustments(search);
  const [isCreating, setIsCreating] = useState(false);

  function filter(patch: Partial<StockAdjustmentListQuery>) {
    onSearchChange({ ...patch, page: 1 });
  }

  return (
    <>
      <BreadCrumb
        items={[
          { title: m.sidebar_stock() },
          { title: m.sidebar_adjustments() },
        ]}
      />
      <PageHeader
        title={m.adjustments_title()}
        description={m.adjustments_description()}
        actions={
          <Button
            startIcon={<Plus size={16} />}
            onClick={() => setIsCreating(true)}
          >
            {m.adjustments_new_title()}
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <SearchInput
          initialValue={search.search ?? ""}
          onSearch={(value) =>
            value !== (search.search ?? "") &&
            filter({ search: value || undefined })
          }
          placeholder={m.adjustments_search()}
          className="w-full sm:w-72"
        />
        <FilterSelect
          label={m.adjustments_reason()}
          placeholder={m.adjustments_all_reasons()}
          value={search.reason ?? null}
          onChange={(value) =>
            filter({
              reason:
                (value as StockAdjustmentListQuery["reason"]) ?? undefined,
            })
          }
          options={STOCK_ADJUSTMENT_REASONS.map((reason) => ({
            value: reason,
            label: AdjustmentReasonHelper.text(reason),
          }))}
        />
        <DateRangeFilter
          start={search.from ?? null}
          end={search.to ?? null}
          maxRangeMonths={24}
          onChange={(from, to) =>
            filter({ from: from ?? undefined, to: to ?? undefined })
          }
        />
      </div>
      <DataTable
        data={data?.items ?? []}
        columns={columns}
        pagination={data?.pagination ?? PaginationHelper.empty(search.perPage)}
        isLoading={isLoading}
        onPageChange={(page) => onSearchChange({ page })}
        onPerPageChange={(perPage) => filter({ perPage })}
        sorting={SortingHelper.toState(search.sortBy, search.sortOrder)}
        onSortingChange={(updater) => {
          const current = SortingHelper.toState(
            search.sortBy,
            search.sortOrder,
          );
          const next =
            typeof updater === "function" ? updater(current) : updater;
          filter(
            SortingHelper.fromState<StockAdjustmentListQuery["sortBy"]>(next, {
              sortBy: "createdAt",
              sortOrder: "desc",
            }),
          );
        }}
        emptyState={m.adjustments_empty()}
      />
      {isCreating && (
        <AdjustmentFormDrawer open onClose={() => setIsCreating(false)} />
      )}
    </>
  );
}
