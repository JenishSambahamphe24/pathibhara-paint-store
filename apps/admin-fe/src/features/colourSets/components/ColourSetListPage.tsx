import type { ColourSetListQuery } from "@repo/shared";

import { Plus, X } from "lucide-react";
import { useState } from "react";

import { BreadCrumb } from "#/components/Breadcrumb/Breadcrumb";
import { Button } from "#/components/Button/Button";
import { ColorSwatch } from "#/components/ColorSwatch/ColorSwatch";
import { DataTable } from "#/components/DataTable/DataTable";
import { FilterSelect } from "#/components/FilterSelect/FilterSelect";
import { PageHeader } from "#/components/PageHeader/PageHeader";
import { SearchInput } from "#/components/SearchInput/SearchInput";

import { useShade } from "#/features/shades/hooks/useShades";
import { PaginationHelper } from "#/lib/helpers/pagination.helper";
import { SortingHelper } from "#/lib/helpers/sorting.helper";
import { m } from "#/paraglide/messages";

import { useColourSetColumns } from "../hooks/useColourSetColumns";
import { useColourSets } from "../hooks/useColourSets";
import { ColourSetFormDrawer } from "./ColourSetFormDrawer";

interface ColourSetListPageProps {
  search: ColourSetListQuery;
  onSearchChange: (patch: Partial<ColourSetListQuery>) => void;
}

interface IDrawerState {
  colourSetId: string | null;
}

export function ColourSetListPage({
  search,
  onSearchChange,
}: ColourSetListPageProps) {
  const { data, isLoading } = useColourSets(search);
  const { data: filterShade } = useShade(search.shadeId ?? null);
  const [drawer, setDrawer] = useState<IDrawerState | null>(null);
  const columns = useColourSetColumns((colourSet) =>
    setDrawer({ colourSetId: colourSet.id }),
  );

  function filter(patch: Partial<ColourSetListQuery>) {
    onSearchChange({ ...patch, page: 1 });
  }

  return (
    <>
      <BreadCrumb
        items={[
          { title: m.sidebar_colours() },
          { title: m.sidebar_colour_sets() },
        ]}
      />
      <PageHeader
        title={m.colour_sets_title()}
        description={m.colour_sets_description()}
        actions={
          <Button
            startIcon={<Plus size={16} />}
            onClick={() => setDrawer({ colourSetId: null })}
          >
            {m.colour_sets_add()}
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput
          initialValue={search.search ?? ""}
          onSearch={(value) =>
            value !== (search.search ?? "") &&
            filter({ search: value || undefined })
          }
          placeholder={m.colour_sets_search()}
          className="w-full sm:w-72"
        />
        <FilterSelect
          label={m.common_status()}
          placeholder={m.common_all_statuses()}
          value={search.status ?? null}
          onChange={(value) =>
            filter({
              status: (value as ColourSetListQuery["status"]) ?? undefined,
            })
          }
          options={[
            { label: m.common_active(), value: "active" },
            { label: m.common_inactive(), value: "inactive" },
          ]}
        />
        {search.shadeId && (
          <span className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-surface py-1.5 pr-1.5 pl-3 text-sm text-foreground-muted">
            {filterShade && <ColorSwatch hex={filterShade.hex} size="sm" />}
            {m.colour_sets_using_shade({
              shade: filterShade
                ? `${filterShade.code} · ${filterShade.translations.en.name}`
                : "…",
            })}
            <button
              type="button"
              aria-label={m.colour_sets_clear_shade_filter()}
              onClick={() => filter({ shadeId: undefined })}
              className="cursor-pointer rounded p-0.5 text-foreground-faint transition-colors hover:bg-surface-subtle hover:text-foreground-muted"
            >
              <X size={14} />
            </button>
          </span>
        )}
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
            SortingHelper.fromState<ColourSetListQuery["sortBy"]>(next, {
              sortBy: "updatedAt",
              sortOrder: "desc",
            }),
          );
        }}
        isRowInactive={(row) => !row.isActive}
        emptyState={m.colour_sets_empty()}
      />

      {drawer && (
        <ColourSetFormDrawer
          key={drawer.colourSetId ?? "new"}
          colourSetId={drawer.colourSetId}
          onClose={() => setDrawer(null)}
        />
      )}
    </>
  );
}
