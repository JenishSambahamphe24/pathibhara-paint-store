import type { IStockMovement } from "../types";
import type { StockMovementListQuery } from "@repo/shared";
import type { ColumnDef } from "@tanstack/react-table";

import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { X } from "lucide-react";

import { STOCK_MOVEMENT_TYPES, VolumeHelper } from "@repo/shared";

import { BreadCrumb } from "#/components/Breadcrumb/Breadcrumb";
import { DataTable } from "#/components/DataTable/DataTable";
import { DateRangeFilter } from "#/components/DateRangeFilter/DateRangeFilter";
import { FilterSelect } from "#/components/FilterSelect/FilterSelect";
import { PageHeader } from "#/components/PageHeader/PageHeader";
import { SearchInput } from "#/components/SearchInput/SearchInput";

import { VariantLabelHelper } from "#/features/products/helpers/variantLabel.helper";
import { DateHelper } from "#/lib/helpers/date.helper";
import { PaginationHelper } from "#/lib/helpers/pagination.helper";
import { SortingHelper } from "#/lib/helpers/sorting.helper";
import { m } from "#/paraglide/messages";

import { MovementTypeHelper } from "../helpers/movementType.helper";
import {
  useFilteredVariant,
  useStockMovements,
} from "../hooks/useStockMovements";
import { MovementSourceCell } from "./MovementSourceCell";
import { MovementTypeChip } from "./MovementTypeChip";

interface MovementListPageProps {
  search: StockMovementListQuery;
  onSearchChange: (patch: Partial<StockMovementListQuery>) => void;
}

const columns: Array<ColumnDef<IStockMovement>> = [
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
        to="/stock/movements"
        search={{ variantId: row.original.variantId }}
        className="text-foreground hover:underline"
      >
        {row.original.productName} {VolumeHelper.label(row.original.volumeMl)}
      </Link>
    ),
  },
  {
    id: "type",
    header: () => m.movements_column_type(),
    enableSorting: false,
    cell: ({ row }) => <MovementTypeChip type={row.original.type} />,
  },
  {
    id: "quantityDelta",
    header: () => m.movements_column_change(),
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
    id: "balance",
    header: () => m.movements_column_balance(),
    enableSorting: false,
    cell: ({ row }) => row.original.balanceAfter,
  },
  {
    id: "source",
    header: () => m.movements_column_source(),
    enableSorting: false,
    cell: ({ row }) => <MovementSourceCell movement={row.original} />,
  },
  {
    id: "by",
    header: () => m.common_recorded_by(),
    enableSorting: false,
    cell: ({ row }) => row.original.createdByName,
  },
];

export function MovementListPage({
  search,
  onSearchChange,
}: MovementListPageProps) {
  const { data, isLoading } = useStockMovements(search);
  const { data: variant } = useFilteredVariant(search.variantId);

  function filter(patch: Partial<StockMovementListQuery>) {
    onSearchChange({ ...patch, page: 1 });
  }

  return (
    <>
      <BreadCrumb
        items={[{ title: m.sidebar_stock() }, { title: m.sidebar_movements() }]}
      />
      <PageHeader
        title={
          variant
            ? m.movements_title_for({ name: VariantLabelHelper.label(variant) })
            : m.movements_title()
        }
        description={
          variant
            ? m.movements_current_stock({ count: variant.currentStock })
            : m.movements_description()
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {search.variantId ? (
          <button
            type="button"
            onClick={() => filter({ variantId: undefined })}
            className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border-strong px-3 py-1.5 text-sm text-foreground-muted hover:bg-surface-muted"
          >
            {variant ? VariantLabelHelper.label(variant) : "…"}
            <X size={14} />
          </button>
        ) : (
          <SearchInput
            initialValue={search.search ?? ""}
            onSearch={(value) =>
              value !== (search.search ?? "") &&
              filter({ search: value || undefined })
            }
            placeholder={m.movements_search()}
            className="w-full sm:w-72"
          />
        )}
        <FilterSelect
          label={m.movements_column_type()}
          placeholder={m.movements_all_types()}
          value={search.type ?? null}
          onChange={(value) =>
            filter({
              type: (value as StockMovementListQuery["type"]) ?? undefined,
            })
          }
          options={STOCK_MOVEMENT_TYPES.map((type) => ({
            value: type,
            label: MovementTypeHelper.label(type),
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
            SortingHelper.fromState<StockMovementListQuery["sortBy"]>(next, {
              sortBy: "createdAt",
              sortOrder: "desc",
            }),
          );
        }}
        emptyState={m.movements_empty()}
      />
    </>
  );
}
