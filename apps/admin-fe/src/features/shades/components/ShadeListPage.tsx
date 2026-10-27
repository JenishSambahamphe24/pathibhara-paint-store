import type { ShadeListQuery } from "@repo/shared";

import { Plus } from "lucide-react";
import { useState } from "react";

import { BreadCrumb } from "#/components/Breadcrumb/Breadcrumb";
import { Button } from "#/components/Button/Button";
import { DataTable } from "#/components/DataTable/DataTable";
import { FilterSelect } from "#/components/FilterSelect/FilterSelect";
import { PageHeader } from "#/components/PageHeader/PageHeader";
import { SearchInput } from "#/components/SearchInput/SearchInput";

import { PaginationHelper } from "#/lib/helpers/pagination.helper";
import { SortingHelper } from "#/lib/helpers/sorting.helper";
import { m } from "#/paraglide/messages";

import { useShadeColumns } from "../hooks/useShadeColumns";
import { useShades } from "../hooks/useShades";
import { ShadeFormDrawer } from "./ShadeFormDrawer";

interface ShadeListPageProps {
  search: ShadeListQuery;
  onSearchChange: (patch: Partial<ShadeListQuery>) => void;
}

interface IDrawerState {
  shadeId: string | null;
}

export function ShadeListPage({ search, onSearchChange }: ShadeListPageProps) {
  const { data, isLoading } = useShades(search);
  const [drawer, setDrawer] = useState<IDrawerState | null>(null);
  const columns = useShadeColumns((shade) => setDrawer({ shadeId: shade.id }));

  function filter(patch: Partial<ShadeListQuery>) {
    onSearchChange({ ...patch, page: 1 });
  }

  return (
    <>
      <BreadCrumb
        items={[{ title: m.sidebar_colours() }, { title: m.sidebar_shades() }]}
      />
      <PageHeader
        title={m.shades_title()}
        description={m.shades_description()}
        actions={
          <Button
            startIcon={<Plus size={16} />}
            onClick={() => setDrawer({ shadeId: null })}
          >
            {m.shades_add()}
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
          placeholder={m.shades_search()}
          className="w-full sm:w-72"
        />
        <FilterSelect
          label={m.common_status()}
          placeholder={m.common_all_statuses()}
          value={search.status ?? null}
          onChange={(value) =>
            filter({ status: (value as ShadeListQuery["status"]) ?? undefined })
          }
          options={[
            { label: m.common_active(), value: "active" },
            { label: m.common_inactive(), value: "inactive" },
          ]}
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
            SortingHelper.fromState<ShadeListQuery["sortBy"]>(next, {
              sortBy: "code",
              sortOrder: "asc",
            }),
          );
        }}
        isRowInactive={(row) => !row.isActive}
        emptyState={m.shades_empty()}
      />

      {drawer && (
        <ShadeFormDrawer
          key={drawer.shadeId ?? "new"}
          shadeId={drawer.shadeId}
          onClose={() => setDrawer(null)}
        />
      )}
    </>
  );
}
