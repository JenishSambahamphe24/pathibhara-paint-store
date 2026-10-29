import type { ICategory } from "../types";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { BreadCrumb } from "#/components/Breadcrumb/Breadcrumb";
import { Button } from "#/components/Button/Button";
import { ConfirmDialog } from "#/components/ConfirmDialog/ConfirmDialog";
import { FilterSelect } from "#/components/FilterSelect/FilterSelect";
import { PageHeader } from "#/components/PageHeader/PageHeader";
import { SearchInput } from "#/components/SearchInput/SearchInput";
import { SkeletonCell } from "#/components/Table/SkeletonCell";

import { m } from "#/paraglide/messages";

import { useDrawerState } from "#/hooks/useDrawerState";

import { CategoryTreeHelper } from "../helpers/categoryTree.helper";
import { useCategories } from "../hooks/useCategories";
import { useCategoryActions } from "../hooks/useCategoryActions";
import { CategoryFormDrawer } from "./CategoryFormDrawer";
import { CategoryTreeRow } from "./CategoryTreeRow";

interface IDrawerState {
  category: ICategory | null;
  parentId: string | null;
}

// A tree, so it isn't paged like other lists: a shop has tens of categories,
// and paging would split branches. Search and status filter still apply.
export function CategoryTreePage() {
  const { data: categories = [], isLoading } = useCategories();
  const { move, remove, isReordering, isRemoving } =
    useCategoryActions(categories);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const drawer = useDrawerState<IDrawerState>();
  const [deleting, setDeleting] = useState<ICategory | null>(null);

  const isFiltering = search.trim() !== "" || status !== null;
  const visible = useMemo(() => {
    const filtered = CategoryTreeHelper.filter(categories, search, status);
    if (isFiltering) return filtered;
    const hidden = new Set<string>();
    for (const category of filtered) {
      if (
        category.parentId &&
        (collapsed.has(category.parentId) || hidden.has(category.parentId))
      ) {
        hidden.add(category.id);
      }
    }
    return filtered.filter((c) => !hidden.has(c.id));
  }, [categories, search, status, collapsed, isFiltering]);

  function toggle(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <BreadCrumb
        items={[
          { title: m.sidebar_catalogue() },
          { title: m.sidebar_categories() },
        ]}
      />
      <PageHeader
        title={m.categories_title()}
        description={m.categories_description()}
        actions={
          <Button
            startIcon={<Plus size={16} />}
            onClick={() => drawer.open({ category: null, parentId: null })}
          >
            {m.categories_add()}
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <SearchInput
          onSearch={setSearch}
          placeholder={m.categories_search()}
          className="w-full sm:w-72"
        />
        <FilterSelect
          label={m.common_status()}
          placeholder={m.common_all_statuses()}
          value={status}
          onChange={(value) => setStatus(value as "active" | "inactive" | null)}
          options={[
            { label: m.common_active(), value: "active" },
            { label: m.common_inactive(), value: "inactive" },
          ]}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border-b border-border-muted px-4 py-3">
              <SkeletonCell />
            </div>
          ))
        ) : visible.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-foreground-faint">
            {isFiltering ? m.categories_no_match() : m.categories_empty()}
          </p>
        ) : (
          visible.map((category) => {
            const siblings = CategoryTreeHelper.siblings(categories, category);
            return (
              <CategoryTreeRow
                key={category.id}
                category={category}
                isFirst={siblings[0]?.id === category.id}
                isLast={siblings.at(-1)?.id === category.id}
                isCollapsed={collapsed.has(category.id)}
                isBusy={isReordering || isRemoving}
                canReorder={!isFiltering}
                onToggle={() => toggle(category.id)}
                onMove={(direction) => move(category, direction)}
                onAddChild={() =>
                  drawer.open({ category: null, parentId: category.id })
                }
                onEdit={() =>
                  drawer.open({ category, parentId: category.parentId })
                }
                onDelete={() => setDeleting(category)}
              />
            );
          })
        )}
      </div>

      {drawer.value && (
        <CategoryFormDrawer
          key={
            drawer.value.category?.id ??
            `new-${drawer.value.parentId ?? "root"}`
          }
          open={drawer.isOpen}
          category={drawer.value.category}
          defaultParentId={drawer.value.parentId}
          categories={categories}
          onClose={drawer.close}
          onExitComplete={drawer.clear}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={m.categories_delete_title()}
        description={m.categories_delete_description({
          name: deleting?.name ?? "",
        })}
        confirmLabel={m.common_delete()}
        isLoading={isRemoving}
        onConfirm={async () => {
          if (!deleting) return;
          await remove(deleting.id).catch(() => undefined);
          setDeleting(null);
        }}
      />
    </>
  );
}
