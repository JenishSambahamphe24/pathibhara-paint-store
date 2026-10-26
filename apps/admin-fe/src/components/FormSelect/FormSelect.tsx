import { createListCollection, Field, Select } from "@ark-ui/react";
import clsx from "clsx";
import { Check, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

import { useFieldContext } from "#/lib/formContext";

interface IFormSelectOption {
  label: string;
  value: string;
  // Consecutive options sharing a group render under one heading.
  group?: string;
}

interface IFormSelectGroup {
  label: string | undefined;
  items: Array<IFormSelectOption>;
}

interface FormSelectProps {
  label: string;
  options: Array<IFormSelectOption>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
}

function getError(errors: Array<unknown>): string | undefined {
  const e = errors[0];
  if (!e) return undefined;
  if (typeof e === "string") return e;
  return (e as { message?: string }).message ?? String(e);
}

export function FormSelect({
  label,
  options,
  placeholder,
  required = false,
  disabled = false,
  hint,
}: FormSelectProps) {
  const field = useFieldContext<string | null>();
  const error = getError(field.state.meta.errors);
  const value = field.state.value ?? "";
  const [isOpen, setIsOpen] = useState(false);

  const collection = useMemo(
    () =>
      createListCollection({
        items: options,
        itemToString: (item: IFormSelectOption) => item.label,
        itemToValue: (item: IFormSelectOption) => item.value,
      }),
    [options],
  );

  const groups = useMemo(() => {
    const result: Array<IFormSelectGroup> = [];
    for (const option of options) {
      const last = result.at(-1);
      if (last && last.label === option.group) last.items.push(option);
      else result.push({ label: option.group, items: [option] });
    }
    return result;
  }, [options]);

  function renderItem(item: IFormSelectOption) {
    return (
      <Select.Item
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
        <Select.ItemText>{item.label}</Select.ItemText>
        <Select.ItemIndicator>
          <Check size={14} />
        </Select.ItemIndicator>
      </Select.Item>
    );
  }

  return (
    <Field.Root
      invalid={!!error}
      className={clsx("relative", isOpen && "z-50")}
    >
      <Field.Label className="text-sm font-medium text-foreground-muted">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </Field.Label>

      <Select.Root
        collection={collection}
        value={value ? [value] : []}
        onValueChange={(details) => {
          field.handleChange(details.value[0] ?? null);
          if (field.state.meta.errorMap.onServer) {
            field.setMeta((meta) => ({
              ...meta,
              errorMap: { ...meta.errorMap, onServer: undefined },
            }));
          }
        }}
        onOpenChange={(details) => setIsOpen(details.open)}
        onInteractOutside={() => field.handleBlur()}
        disabled={disabled}
        positioning={{ placement: "bottom-start", sameWidth: true, gutter: 2 }}
        unmountOnExit
      >
        <Select.Control>
          <Select.Trigger
            className={clsx(
              "inline-flex w-full items-center justify-between gap-2 rounded-lg border bg-surface px-3 py-2.5",
              "text-sm text-foreground transition-colors",
              "border-border-strong focus:border-foreground focus:ring-2 focus:ring-foreground/10",
              "data-invalid:border-danger data-invalid:focus:border-danger data-invalid:focus:ring-danger/10",
              "cursor-pointer focus:outline-none",
              "data-disabled:cursor-not-allowed data-disabled:bg-surface-subtle data-disabled:text-foreground-subtle",
            )}
          >
            <Select.ValueText
              placeholder={placeholder}
              className="truncate text-left"
            />
            <ChevronDown
              size={16}
              className="shrink-0 text-foreground-subtle"
            />
          </Select.Trigger>
        </Select.Control>

        <Select.Positioner className="z-50 rounded-lg border border-border bg-surface shadow-lg empty:hidden">
          <Select.Content className="max-h-64 overflow-y-auto overscroll-contain p-1 focus:outline-none">
            {groups.map((group, index) =>
              group.label === undefined ? (
                group.items.map(renderItem)
              ) : (
                <Select.ItemGroup
                  key={group.label}
                  className={clsx(
                    index > 0 && "mt-1 border-t border-border-muted pt-1",
                  )}
                >
                  <Select.ItemGroupLabel className="px-3 pt-1.5 pb-1 text-xs font-semibold tracking-wide text-foreground-subtle uppercase">
                    {group.label}
                  </Select.ItemGroupLabel>
                  {group.items.map(renderItem)}
                </Select.ItemGroup>
              ),
            )}
          </Select.Content>
        </Select.Positioner>
      </Select.Root>

      {error ? (
        <Field.ErrorText className="text-xs text-danger">
          {error}
        </Field.ErrorText>
      ) : (
        hint && <p className="text-xs text-foreground-subtle">{hint}</p>
      )}
    </Field.Root>
  );
}
