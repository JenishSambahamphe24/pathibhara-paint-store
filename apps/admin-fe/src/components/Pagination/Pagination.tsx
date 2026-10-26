import { createListCollection, Portal, Select } from "@ark-ui/react";
import clsx from "clsx";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

import { m } from "#/paraglide/messages";

const DEFAULT_PER_PAGE_OPTIONS = [10, 25, 50];

interface PaginationProps {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  currentPage?: number;
  totalPages?: number;
  perPage: number;
  onPerPageChange: (perPage: number) => void;
  perPageOptions?: number[];
  showPerPage?: boolean;
}

interface IPerPageItem {
  label: string;
  value: string;
}

export function Pagination({
  hasNextPage,
  hasPreviousPage,
  onNextPage,
  onPreviousPage,
  currentPage,
  totalPages,
  perPage,
  onPerPageChange,
  perPageOptions = DEFAULT_PER_PAGE_OPTIONS,
  showPerPage = false,
}: PaginationProps) {
  const collection = useMemo(() => {
    const items: Array<IPerPageItem> = perPageOptions.map((option) => ({
      label: m.pagination_per_page({ count: option }),
      value: String(option),
    }));

    return createListCollection({
      items,
      itemToString: (item: IPerPageItem) => item.label,
      itemToValue: (item: IPerPageItem) => item.value,
    });
  }, [perPageOptions]);

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3">
      {showPerPage ? (
        <Select.Root
          collection={collection}
          value={[String(perPage)]}
          onValueChange={(details) => {
            const value = details.value[0];
            if (value) {
              onPerPageChange(Number(value));
            }
          }}
          positioning={{ placement: "bottom-start" }}
        >
          <Select.Control>
            <Select.Trigger
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-3 py-1.5",
                "text-sm text-foreground-muted transition-colors hover:bg-surface-muted",
                "cursor-pointer focus:ring-0 focus:outline-0",
              )}
            >
              <Select.ValueText />
              <ChevronDown size={14} className="text-foreground-subtle" />
            </Select.Trigger>
          </Select.Control>

          <Portal>
            <Select.Positioner>
              <Select.Content
                className={clsx(
                  "z-50 min-w-32 rounded-lg border border-border bg-surface p-1 shadow-lg",
                  "focus:ring-0 focus:outline-0",
                )}
              >
                {collection.items.map((item) => (
                  <Select.Item
                    key={item.value}
                    item={item}
                    className={clsx(
                      "flex cursor-pointer items-center rounded-md px-3 py-1.5 text-sm text-foreground-muted",
                      "transition-colors hover:bg-surface-subtle",
                      "data-highlighted:bg-surface-subtle",
                      "data-[state=checked]:font-medium data-[state=checked]:text-foreground",
                    )}
                  >
                    <Select.ItemText>{item.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-3">
        {currentPage != null && (
          <span className="text-sm text-foreground-muted">
            {totalPages != null
              ? m.pagination_page_of({
                  current: currentPage,
                  total: totalPages,
                })
              : m.pagination_page({ current: currentPage })}
          </span>
        )}

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={!hasPreviousPage}
            onClick={onPreviousPage}
            className={clsx(
              "inline-flex items-center gap-1 rounded-lg border border-border-strong bg-surface px-3 py-1.5",
              "text-sm font-medium text-foreground-muted transition-colors",
              "hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50",
              "cursor-pointer focus:ring-0 focus:outline-0",
            )}
          >
            <ChevronLeft size={14} />
            {m.pagination_previous()}
          </button>

          <button
            type="button"
            disabled={!hasNextPage}
            onClick={onNextPage}
            className={clsx(
              "inline-flex items-center gap-1 rounded-lg border border-border-strong bg-surface px-3 py-1.5",
              "text-sm font-medium text-foreground-muted transition-colors",
              "hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50",
              "cursor-pointer focus:ring-0 focus:outline-0",
            )}
          >
            {m.pagination_next()}
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
