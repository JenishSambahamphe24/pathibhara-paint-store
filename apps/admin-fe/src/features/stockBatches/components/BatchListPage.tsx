import type { StockBatchListQuery } from "@repo/shared";

import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { BreadCrumb } from "#/components/Breadcrumb/Breadcrumb";
import { Button } from "#/components/Button/Button";
import { DataTable } from "#/components/DataTable/DataTable";
import { DateRangeFilter } from "#/components/DateRangeFilter/DateRangeFilter";
import { FilterSelect } from "#/components/FilterSelect/FilterSelect";
import { PageHeader } from "#/components/PageHeader/PageHeader";
import { SearchInput } from "#/components/SearchInput/SearchInput";

import { PaginationHelper } from "#/lib/helpers/pagination.helper";
import { SortingHelper } from "#/lib/helpers/sorting.helper";
import { m } from "#/paraglide/messages";

import { useBatchColumns } from "../hooks/useBatchColumns";
import { useStockBatches } from "../hooks/useStockBatches";

interface BatchListPageProps {
  search: StockBatchListQuery;
  onSearchChange: (patch: Partial<StockBatchListQuery>) => void;
}

export function BatchListPage({ search, onSearchChange }: BatchListPageProps) {
  const { data, isLoading } = useStockBatches(search);
  const columns = useBatchColumns();

  function filter(patch: Partial<StockBatchListQuery>) {
    onSearchChange({ ...patch, page: 1 });
  }

  return (
    <>
      <BreadCrumb
        items={[{ title: m.sidebar_stock() }, { title: m.sidebar_batches() }]}
      />
      <PageHeader
        title={m.batches_title()}
        description={m.batches_description()}
        actions={
          <Link to="/stock/batches/new">
            <Button startIcon={<Plus size={16} />}>
              {m.batches_new_title()}
            </Button>
          </Link>
        }
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <SearchInput
          initialValue={search.search ?? ""}
          onSearch={(value) =>
            value !== (search.search ?? "") &&
            filter({ search: value || undefined })
          }
          placeholder={m.batches_search()}
          className="w-full sm:w-72"
        />
        <FilterSelect
          label={m.common_status()}
          placeholder={m.common_all_statuses()}
          value={search.status ?? null}
          onChange={(value) =>
            filter({
              status: (value as StockBatchListQuery["status"]) ?? undefined,
            })
          }
          options={[
            { label: m.batches_recorded(), value: "active" },
            { label: m.batches_voided(), value: "voided" },
          ]}
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
            SortingHelper.fromState<StockBatchListQuery["sortBy"]>(next, {
              sortBy: "receivedOn",
              sortOrder: "desc",
            }),
          );
        }}
        isRowInactive={(row) => row.status === "voided"}
        emptyState={m.batches_empty()}
      />
    </>
  );
}
