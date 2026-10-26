import { createListCollection, Portal, Select } from "@ark-ui/react";
import clsx from "clsx";
import { ChevronDown, X } from "lucide-react";
import { useMemo } from "react";

interface IFilterSelectOption {
  label: string;
  value: string;
}

export interface IFilterSelectGroup {
  label: string;
  items: Array<IFilterSelectOption>;
}

interface BaseProps {
  label: string;
  placeholder: string;
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  wide?: boolean;
  fullWidth?: boolean;
  /** Pass `false` inside a modal Dialog: Ark disables pointer events outside
   * the dialog content, so a body-portalled menu opens but swallows clicks. */
  portalled?: boolean;
}

type FilterSelectProps = BaseProps &
  (
    | { options: Array<IFilterSelectOption>; groups?: never }
    | { groups: Array<IFilterSelectGroup>; options?: never }
  );

export function FilterSelect({
  label,
  placeholder,
  value,
  options,
  groups,
  onChange,
  disabled,
  wide = false,
  fullWidth = false,
  portalled = true,
}: FilterSelectProps) {
  const items = useMemo(
    () => groups?.flatMap((group) => group.items) ?? options ?? [],
    [groups, options],
  );

  const collection = useMemo(
    () =>
      createListCollection({
        items,
        itemToString: (item: IFilterSelectOption) => item.label,
        itemToValue: (item: IFilterSelectOption) => item.value,
      }),
    [items],
  );

  const hasSelection = value !== null && value !== "";

  const itemClassName = clsx(
    "flex cursor-pointer items-center rounded-md px-3 py-1.5 text-sm text-foreground-muted",
    "transition-colors hover:bg-surface-subtle",
    "data-highlighted:bg-surface-subtle",
    "data-[state=checked]:bg-info-subtle data-[state=checked]:font-medium data-[state=checked]:text-info-strong",
    "data-[state=checked]:data-highlighted:bg-info-subtle",
  );

  const positioner = (
    <Select.Positioner
      className={clsx(
        "z-50 rounded-lg border border-border bg-surface shadow-lg",
        "empty:hidden",
      )}
    >
      {/* Ark copies Content's z-index onto the Positioner inline, overriding its class. */}
      <Select.Content
        className={clsx(
          "z-50 max-h-64 overflow-y-auto overscroll-contain p-1",
          "focus:ring-0 focus:outline-0",
        )}
      >
        {groups
          ? groups.map((group) => (
              <Select.ItemGroup
                key={group.label}
                className="not-first:mt-1 not-first:border-t not-first:border-border-muted not-first:pt-1"
              >
                <Select.ItemGroupLabel className="px-3 pt-1.5 pb-0.5 text-xs font-medium text-foreground-faint">
                  {group.label}
                </Select.ItemGroupLabel>
                {group.items.map((item) => (
                  <Select.Item
                    key={item.value}
                    item={item}
                    className={itemClassName}
                  >
                    <Select.ItemText>{item.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.ItemGroup>
            ))
          : collection.items.map((item) => (
              <Select.Item
                key={item.value}
                item={item}
                className={itemClassName}
              >
                <Select.ItemText>{item.label}</Select.ItemText>
              </Select.Item>
            ))}
      </Select.Content>
    </Select.Positioner>
  );

  return (
    <Select.Root
      collection={collection}
      value={hasSelection ? [value] : []}
      onValueChange={(details) => {
        const next = details.value[0] ?? null;
        onChange(next);
      }}
      positioning={{ placement: "bottom-start", sameWidth: true }}
      disabled={disabled}
      unmountOnExit
      className={clsx(!portalled && "relative")}
    >
      <Select.Label className="sr-only">{label}</Select.Label>
      <Select.Control className="relative">
        <Select.Trigger
          className={clsx(
            "inline-flex w-full items-center justify-between gap-2 rounded-lg border border-border-strong bg-surface px-3 py-2",
            !fullWidth && (wide ? "sm:w-64" : "sm:w-48"),
            "text-sm text-foreground-muted transition-colors hover:bg-surface-muted",
            "cursor-pointer focus:ring-0 focus:outline-0",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <Select.ValueText
            placeholder={placeholder}
            className={clsx("truncate text-left", hasSelection && "pr-6")}
          />
          <ChevronDown size={14} className="shrink-0 text-foreground-subtle" />
        </Select.Trigger>

        {hasSelection && !disabled && (
          <button
            type="button"
            aria-label={label}
            className={clsx(
              "absolute top-1/2 right-8 -translate-y-1/2 rounded p-0.5",
              "cursor-pointer text-foreground-faint transition-colors hover:bg-surface-subtle hover:text-foreground-muted",
            )}
            onClick={(event) => {
              event.stopPropagation();
              onChange(null);
            }}
          >
            <X size={12} />
          </button>
        )}
      </Select.Control>

      {portalled ? <Portal>{positioner}</Portal> : positioner}
    </Select.Root>
  );
}
