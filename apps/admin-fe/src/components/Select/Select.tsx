import {
  Select as ArkSelect,
  createListCollection,
  Portal,
} from "@ark-ui/react";
import clsx from "clsx";
import { Check, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

export interface ISelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  options: Array<ISelectOption>;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
  /**
   * Render the dropdown in a body portal (default). Pass `false` when the
   * select lives inside a modal Dialog — Ark disables pointer events outside
   * the dialog content while it's open, so a portalled dropdown is visible
   * but unclickable. Inline rendering (like FormSelect) keeps it interactive.
   */
  portalled?: boolean;
}

/**
 * Custom, full-width select built on Ark UI. Mirrors `FormSelect`'s styling
 * but does not couple to TanStack Form — use this when binding a select to
 * plain local state (settings card, ad-hoc filters, etc.).
 */
export function Select({
  options,
  value,
  onChange,
  placeholder,
  label,
  disabled = false,
  className,
  size = "md",
  portalled = true,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const collection = useMemo(
    () =>
      createListCollection({
        items: options,
        itemToString: (item: ISelectOption) => item.label,
        itemToValue: (item: ISelectOption) => item.value,
      }),
    [options],
  );

  const positioner = (
    <ArkSelect.Positioner className="z-50 rounded-lg border border-border bg-surface shadow-lg empty:hidden">
      <ArkSelect.Content className="max-h-72 overflow-y-auto overscroll-contain p-1 focus:outline-none">
        {collection.items.map((item) => (
          <ArkSelect.Item
            key={item.value}
            item={item}
            className={clsx(
              "flex cursor-pointer items-center justify-between rounded-md px-3 py-1.5 text-sm text-foreground-muted",
              "transition-colors hover:bg-surface-subtle",
              "data-highlighted:bg-surface-subtle",
              "data-[state=checked]:bg-info-subtle data-[state=checked]:font-medium data-[state=checked]:text-info-strong",
              "data-[state=checked]:data-highlighted:bg-info-subtle",
            )}
          >
            <ArkSelect.ItemText>{item.label}</ArkSelect.ItemText>
            <ArkSelect.ItemIndicator>
              <Check size={14} />
            </ArkSelect.ItemIndicator>
          </ArkSelect.Item>
        ))}
      </ArkSelect.Content>
    </ArkSelect.Positioner>
  );

  return (
    <ArkSelect.Root
      collection={collection}
      value={value ? [value] : []}
      onValueChange={(details) => {
        const next = details.value.at(0);
        if (next !== undefined) onChange(next);
      }}
      onOpenChange={(details) => setIsOpen(details.open)}
      positioning={{ placement: "bottom-start", sameWidth: true, gutter: 2 }}
      disabled={disabled}
      unmountOnExit
      className={clsx(!portalled && "relative", !portalled && isOpen && "z-50")}
    >
      {label && <ArkSelect.Label className="sr-only">{label}</ArkSelect.Label>}
      <ArkSelect.Control className={clsx("relative w-full", isOpen && "z-50")}>
        <ArkSelect.Trigger
          className={clsx(
            "inline-flex w-full items-center justify-between gap-2 rounded-lg border bg-surface text-foreground transition-colors",
            size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3 py-2.5 text-sm",
            "border-border-strong focus:border-foreground focus:ring-2 focus:ring-foreground/10",
            "cursor-pointer select-none focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <ArkSelect.ValueText
            placeholder={placeholder}
            className="truncate text-left"
          />
          <ChevronDown
            size={size === "sm" ? 14 : 16}
            className="shrink-0 text-foreground-subtle"
          />
        </ArkSelect.Trigger>
      </ArkSelect.Control>

      {portalled ? <Portal>{positioner}</Portal> : positioner}
    </ArkSelect.Root>
  );
}
