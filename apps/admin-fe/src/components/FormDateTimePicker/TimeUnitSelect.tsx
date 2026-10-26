import type { createListCollection } from "@ark-ui/react";

import { Select } from "@ark-ui/react";
import clsx from "clsx";
import { Check, ChevronDown } from "lucide-react";

interface TimeUnitSelectProps {
  value: string;
  collection: ReturnType<
    typeof createListCollection<{ value: string; label: string }>
  >;
  disabled?: boolean;
  onValueChange: (next: string) => void;
}

export function TimeUnitSelect({
  value,
  collection,
  disabled,
  onValueChange,
}: TimeUnitSelectProps) {
  return (
    <Select.Root
      collection={collection}
      value={[value]}
      onValueChange={(details) => {
        const next = details.value[0];
        if (next) onValueChange(next);
      }}
      positioning={{ placement: "bottom-start", gutter: 2 }}
      disabled={disabled}
      unmountOnExit
    >
      <Select.Control>
        <Select.Trigger
          className={clsx(
            "inline-flex w-16 items-center justify-between gap-1 rounded-md border border-border-strong bg-surface px-2 py-1",
            "text-sm text-foreground transition-colors hover:bg-surface-muted",
            "cursor-pointer focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <Select.ValueText className="truncate" />
          <ChevronDown size={12} className="shrink-0 text-foreground-subtle" />
        </Select.Trigger>
      </Select.Control>

      <Select.Positioner>
        <Select.Content className="max-h-48 overflow-y-auto rounded-md border border-border bg-surface p-1 shadow-lg focus:outline-none">
          {collection.items.map((item) => (
            <Select.Item
              key={item.value}
              item={item}
              className={clsx(
                "flex cursor-pointer items-center justify-between rounded-sm px-2 py-1 text-sm text-foreground-muted",
                "transition-colors hover:bg-surface-subtle",
                "data-highlighted:bg-surface-subtle",
                "data-disabled:cursor-not-allowed data-disabled:opacity-40 data-disabled:hover:bg-transparent",
                "data-[state=checked]:bg-info-subtle data-[state=checked]:font-medium data-[state=checked]:text-info-strong",
              )}
            >
              <Select.ItemText>{item.label}</Select.ItemText>
              <Select.ItemIndicator>
                <Check size={12} />
              </Select.ItemIndicator>
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Positioner>
    </Select.Root>
  );
}
