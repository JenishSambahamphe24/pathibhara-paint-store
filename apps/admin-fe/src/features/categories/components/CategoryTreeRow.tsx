import type { ICategory } from "../types";

import clsx from "clsx";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Pencil,
  Trash2,
} from "lucide-react";

import { ActionButton } from "#/components/ActionButton/ActionButton";
import { Chip } from "#/components/Chip/Chip";

import { m } from "#/paraglide/messages";

// Literal classes so Tailwind can see them; deeper levels share the last step.
const INDENT = ["pl-0", "pl-6", "pl-12", "pl-18", "pl-24", "pl-30", "pl-36"];

interface CategoryTreeRowProps {
  category: ICategory;
  isFirst: boolean;
  isLast: boolean;
  isCollapsed: boolean;
  isBusy: boolean;
  canReorder: boolean;
  onToggle: () => void;
  onMove: (direction: -1 | 1) => void;
  onAddChild: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function CategoryTreeRow({
  category,
  isFirst,
  isLast,
  isCollapsed,
  isBusy,
  canReorder,
  onToggle,
  onMove,
  onAddChild,
  onEdit,
  onDelete,
}: CategoryTreeRowProps) {
  const hasChildren = category.childCount > 0;
  const canDelete = !hasChildren && category.productCount === 0;

  return (
    <div
      className={clsx(
        "flex items-center gap-3 border-b border-border-muted px-4 py-2.5 last:border-b-0",
        !category.isActive && "bg-surface-subtle/70",
      )}
    >
      <div
        className={clsx(
          "flex min-w-0 grow items-center gap-2",
          INDENT[Math.min(category.depth, INDENT.length - 1)],
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          disabled={!hasChildren}
          aria-label={
            isCollapsed ? m.categories_expand() : m.categories_collapse()
          }
          className="cursor-pointer rounded p-0.5 text-foreground-subtle disabled:invisible"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </button>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={clsx(
                "truncate font-medium",
                category.isActive
                  ? "text-foreground"
                  : "text-foreground-subtle",
              )}
            >
              {category.translations.en.name}
            </span>
            {category.translations.ne && (
              <span className="truncate text-sm text-foreground-subtle">
                {category.translations.ne.name}
              </span>
            )}
            {!category.isActive && (
              <Chip variant="neutral">{m.common_inactive()}</Chip>
            )}
          </div>
          <p className="truncate text-xs text-foreground-faint">
            /{category.slug}
          </p>
        </div>
      </div>

      <span className="hidden shrink-0 text-xs text-foreground-subtle sm:inline">
        {m.categories_product_count({ count: category.productCount })}
      </span>

      <div className="flex shrink-0 items-center gap-0.5">
        {canReorder && (
          <>
            <ActionButton
              icon={<ArrowUp size={16} />}
              tooltip={m.categories_move_up()}
              onClick={() => onMove(-1)}
              disabled={isFirst || isBusy}
            />
            <ActionButton
              icon={<ArrowDown size={16} />}
              tooltip={m.categories_move_down()}
              onClick={() => onMove(1)}
              disabled={isLast || isBusy}
            />
          </>
        )}
        <ActionButton
          icon={<FolderPlus size={16} />}
          tooltip={m.categories_add_child()}
          onClick={onAddChild}
        />
        <ActionButton
          icon={<Pencil size={16} />}
          tooltip={m.common_edit()}
          onClick={onEdit}
        />
        <ActionButton
          icon={<Trash2 size={16} />}
          tooltip={
            canDelete ? m.common_delete() : m.categories_delete_blocked()
          }
          onClick={onDelete}
          variant="danger"
          disabled={!canDelete || isBusy}
        />
      </div>
    </div>
  );
}
