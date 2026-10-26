import type { ProductListQuery } from "@repo/shared";

import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { BreadCrumb } from "#/components/Breadcrumb/Breadcrumb";
import { Button } from "#/components/Button/Button";
import { DataTable } from "#/components/DataTable/DataTable";
import { FilterSelect } from "#/components/FilterSelect/FilterSelect";
import { PageHeader } from "#/components/PageHeader/PageHeader";
import { SearchInput } from "#/components/SearchInput/SearchInput";

import { CategoryTreeHelper } from "#/features/categories/helpers/categoryTree.helper";
import { useCategories } from "#/features/categories/hooks/useCategories";
import { PaginationHelper } from "#/lib/helpers/pagination.helper";
import { SortingHelper } from "#/lib/helpers/sorting.helper";
import { m } from "#/paraglide/messages";

import { useProductColumns } from "../hooks/useProductColumns";
import { useProducts } from "../hooks/useProducts";

interface ProductListPageProps {
  search: ProductListQuery;
  onSearchChange: (patch: Partial<ProductListQuery>) => void;
}

export function ProductListPage({
  search,
  onSearchChange,
}: ProductListPageProps) {
  const { data, isLoading } = useProducts(search);
  const { data: categories = [] } = useCategories();
  const columns = useProductColumns();

  // Any filter change goes back to page 1; paging itself keeps the filters.
  function filter(patch: Partial<ProductListQuery>) {
    onSearchChange({ ...patch, page: 1 });
  }

  return (
    <>
      <BreadCrumb
        items={[
          { title: m.sidebar_catalogue() },
          { title: m.sidebar_products() },
        ]}
      />
      <PageHeader
        title={m.products_title()}
        description={m.products_description()}
        actions={
          <Link to="/products/new">
            <Button startIcon={<Plus size={16} />}>{m.products_add()}</Button>
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
          placeholder={m.products_search()}
          className="w-full sm:w-72"
        />
        <FilterSelect
          label={m.products_category()}
          placeholder={m.products_all_categories()}
          value={search.categoryId ?? null}
          onChange={(value) => filter({ categoryId: value ?? undefined })}
          options={CategoryTreeHelper.options(categories)}
          wide
        />
        <FilterSelect
          label={m.common_status()}
          placeholder={m.common_all_statuses()}
          value={search.status ?? null}
          onChange={(value) =>
            filter({
              status: (value as ProductListQuery["status"]) ?? undefined,
            })
          }
          options={[
            { label: m.common_active(), value: "active" },
            { label: m.common_inactive(), value: "inactive" },
          ]}
        />
        <FilterSelect
          label={m.products_stock_filter()}
          placeholder={m.products_any_stock()}
          value={search.lowStock ? "low" : null}
          onChange={(value) =>
            filter({ lowStock: value === "low" ? true : undefined })
          }
          options={[{ label: m.products_low_stock_only(), value: "low" }]}
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
            SortingHelper.fromState<ProductListQuery["sortBy"]>(next, {
              sortBy: "updatedAt",
              sortOrder: "desc",
            }),
          );
        }}
        isRowInactive={(row) => !row.isActive}
        emptyState={m.products_empty()}
      />
    </>
  );
}
