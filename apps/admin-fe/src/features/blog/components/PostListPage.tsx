import type { PostListQuery } from "@repo/shared";

import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { BreadCrumb } from "#/components/Breadcrumb/Breadcrumb";
import { Button } from "#/components/Button/Button";
import { DataTable } from "#/components/DataTable/DataTable";
import { FilterSelect } from "#/components/FilterSelect/FilterSelect";
import { PageHeader } from "#/components/PageHeader/PageHeader";
import { SearchInput } from "#/components/SearchInput/SearchInput";

import { PaginationHelper } from "#/lib/helpers/pagination.helper";
import { SortingHelper } from "#/lib/helpers/sorting.helper";
import { m } from "#/paraglide/messages";

import { usePostColumns } from "../hooks/usePostColumns";
import { usePosts } from "../hooks/usePosts";

interface PostListPageProps {
  search: PostListQuery;
  onSearchChange: (patch: Partial<PostListQuery>) => void;
}

export function PostListPage({ search, onSearchChange }: PostListPageProps) {
  const { data, isLoading } = usePosts(search);
  const columns = usePostColumns();

  function filter(patch: Partial<PostListQuery>) {
    onSearchChange({ ...patch, page: 1 });
  }

  return (
    <>
      <BreadCrumb items={[{ title: m.sidebar_content() }, { title: m.sidebar_blog() }]} />
      <PageHeader
        title={m.blog_title()}
        description={m.blog_description()}
        actions={
          <Link to="/blog/new">
            <Button startIcon={<Plus size={16} />}>{m.blog_new_title()}</Button>
          </Link>
        }
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <SearchInput
          initialValue={search.search ?? ""}
          onSearch={(value) => value !== (search.search ?? "") && filter({ search: value || undefined })}
          placeholder={m.blog_search()}
          className="w-full sm:w-72"
        />
        <FilterSelect
          label={m.common_status()}
          placeholder={m.common_all_statuses()}
          value={search.status ?? null}
          onChange={(value) => filter({ status: (value as PostListQuery["status"]) ?? undefined })}
          options={[
            { label: m.blog_status_published(), value: "published" },
            { label: m.blog_status_draft(), value: "draft" },
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
          const current = SortingHelper.toState(search.sortBy, search.sortOrder);
          const next = typeof updater === "function" ? updater(current) : updater;
          filter(SortingHelper.fromState<PostListQuery["sortBy"]>(next, { sortBy: "updatedAt", sortOrder: "desc" }));
        }}
        emptyState={m.blog_empty()}
      />
    </>
  );
}
