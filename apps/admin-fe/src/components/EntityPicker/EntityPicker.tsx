import { Combobox, createListCollection, Field } from "@ark-ui/react";
import clsx from "clsx";
import { Check, ChevronDown, X } from "lucide-react";
import { useMemo, useState } from "react";

export interface IEntityPickerOption {
  value: string;
  label: string;
}

interface EntityPickerProps {
  label: string;
  placeholder?: string;
  emptyText: string;
  /** Selected value ("" = none). */
  value: string;
  /** Display label for the selected value, used when it isn't in `options`. */
  selectedLabel?: string;
  /** Current (search) result set. */
  options: Array<IEntityPickerOption>;
  isLoading?: boolean;
  /** Visually hide the label (still read by screen readers) for filter rows. */
  hideLabel?: boolean;
  onChange: (value: string) => void;
  onSearchChange: (search: string) => void;
}

/**
 * Searchable single-select for picking a backend entity by id/slug. Keeps the
 * currently-selected option in the collection so its label still renders when
 * it's absent from the latest search results.
 */
export function EntityPicker({
  label,
  placeholder,
  emptyText,
  value,
  selectedLabel,
  options,
  isLoading = false,
  hideLabel = false,
  onChange,
  onSearchChange,
}: EntityPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const items = useMemo(() => {
    const base = [...options];
    if (value && selectedLabel && !base.some((o) => o.value === value)) {
      base.unshift({ value, label: selectedLabel });
    }
    return base;
  }, [options, value, selectedLabel]);

  const collection = useMemo(
    () =>
      createListCollection({
        items,
        itemToString: (item: IEntityPickerOption) => item.label,
        itemToValue: (item: IEntityPickerOption) => item.value,
      }),
    [items],
  );

  return (
    <Field.Root className={clsx("relative", isOpen && "z-50")}>
      <Field.Label
        className={clsx(
          "text-sm font-medium text-foreground-muted",
          hideLabel && "sr-only",
        )}
      >
        {label}
      </Field.Label>

      <Combobox.Root
        collection={collection}
        value={value ? [value] : []}
        onValueChange={(details) => onChange(details.value[0] ?? "")}
        onInputValueChange={(details) => {
          onSearchChange(details.inputValue);
          // The selected value and the input text are independent in Ark's
          // combobox — clearing the text (or the X trigger) must also drop the
          // selection so the filter actually resets.
          if (details.inputValue === "" && value) onChange("");
        }}
        onOpenChange={(details) => setIsOpen(details.open)}
        selectionBehavior="replace"
        openOnClick
        positioning={{ placement: "bottom-start", sameWidth: true, gutter: 2 }}
        unmountOnExit
      >
        <Combobox.Control className="relative">
          <Combobox.Input
            placeholder={placeholder}
            className={clsx(
              "w-full rounded-lg border bg-surface py-2.5 pr-16 pl-3 text-sm text-foreground",
              "placeholder-foreground-faint transition-colors focus:outline-none",
              "border-border-strong focus:border-foreground focus:ring-2 focus:ring-foreground/10",
            )}
          />
          <div className="absolute inset-y-0 right-0 flex items-center gap-0.5 pr-2">
            {value && (
              <Combobox.ClearTrigger
                onClick={() => onChange("")}
                className="cursor-pointer rounded p-1 text-foreground-faint transition-colors hover:text-foreground-muted"
              >
                <X size={14} />
              </Combobox.ClearTrigger>
            )}
            <Combobox.Trigger className="cursor-pointer rounded p-1 text-foreground-subtle">
              <ChevronDown size={16} />
            </Combobox.Trigger>
          </div>
        </Combobox.Control>

        <Combobox.Positioner className="z-50 rounded-lg border border-border bg-surface shadow-lg empty:hidden">
          <Combobox.Content className="max-h-64 overflow-y-auto overscroll-contain p-1 focus:outline-none">
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-foreground-subtle">…</div>
            ) : (
              <Combobox.Empty className="px-3 py-2 text-sm text-foreground-subtle">
                {emptyText}
              </Combobox.Empty>
            )}
            {collection.items.map((item) => (
              <Combobox.Item
                key={item.value}
                item={item}
                className={clsx(
                  "flex cursor-pointer items-center justify-between rounded-md px-3 py-1.5 text-sm text-foreground-muted",
                  "transition-colors hover:bg-surface-subtle",
                  "data-highlighted:bg-surface-subtle",
                  "data-[state=checked]:bg-info-subtle data-[state=checked]:font-medium data-[state=checked]:text-info-strong",
                )}
              >
                <Combobox.ItemText>{item.label}</Combobox.ItemText>
                <Combobox.ItemIndicator>
                  <Check size={14} />
                </Combobox.ItemIndicator>
              </Combobox.Item>
            ))}
          </Combobox.Content>
        </Combobox.Positioner>
      </Combobox.Root>
    </Field.Root>
  );
}
