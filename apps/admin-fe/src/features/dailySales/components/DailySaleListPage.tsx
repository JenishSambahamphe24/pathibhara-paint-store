import type { DailySaleListQuery } from "@repo/shared";

import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { BreadCrumb } from "#/components/Breadcrumb/Breadcrumb";
import { Button } from "#/components/Button/Button";
import { DataTable } from "#/components/DataTable/DataTable";
import { DateRangeFilter } from "#/components/DateRangeFilter/DateRangeFilter";
import { PageHeader } from "#/components/PageHeader/PageHeader";

import { DateHelper } from "#/lib/helpers/date.helper";
import { PaginationHelper } from "#/lib/helpers/pagination.helper";
import { SortingHelper } from "#/lib/helpers/sorting.helper";
import { m } from "#/paraglide/messages";

import { useDailySaleColumns } from "../hooks/useDailySaleColumns";
import { useDailySales } from "../hooks/useDailySales";

interface DailySaleListPageProps {
  search: DailySaleListQuery;
  onSearchChange: (patch: Partial<DailySaleListQuery>) => void;
}

export function DailySaleListPage({
  search,
  onSearchChange,
}: DailySaleListPageProps) {
  const { data, isLoading } = useDailySales(search);
  const columns = useDailySaleColumns();

  function filter(patch: Partial<DailySaleListQuery>) {
    onSearchChange({ ...patch, page: 1 });
  }

  return (
    <>
      <BreadCrumb
        items={[
          { title: m.sidebar_stock() },
          { title: m.sidebar_daily_sales() },
        ]}
      />
      <PageHeader
        title={m.sales_title()}
        description={m.sales_description()}
        actions={
          <Link
            to="/stock/sales/$date"
            params={{ date: DateHelper.todayInStore() }}
          >
            <Button startIcon={<Plus size={16} />}>
              {m.sales_record_today()}
            </Button>
          </Link>
        }
      />
      <div className="mb-4 flex flex-wrap gap-3">
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
            SortingHelper.fromState<DailySaleListQuery["sortBy"]>(next, {
              sortBy: "saleDate",
              sortOrder: "desc",
            }),
          );
        }}
        emptyState={m.sales_empty()}
      />
    </>
  );
}
