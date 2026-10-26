import { createListCollection, Field, Portal, Select } from "@ark-ui/react";
import clsx from "clsx";
import { Check, ChevronDown, X } from "lucide-react";
import { useMemo, useState } from "react";

import { useFieldContext } from "#/lib/formContext";
import { FormHelper } from "#/lib/helpers/form.helper";
import { m } from "#/paraglide/messages";

export interface IFormMultiSelectOption {
  value: string;
  label: string;
  meta?: unknown;
}

interface FormMultiSelectProps {
  label: string;
  options: Array<IFormMultiSelectOption>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  renderOption?: (option: IFormMultiSelectOption) => React.ReactNode;
}

export function FormMultiSelect({
  label,
  options,
  placeholder,
  required = false,
  disabled = false,
  renderOption,
}: FormMultiSelectProps) {
  const field = useFieldContext<string[]>();
  const error = FormHelper.getFieldError(field.state.meta.errors);
  const selected = field.state.value;
  const [isOpen, setIsOpen] = useState(false);

  const collection = useMemo(
    () =>
      createListCollection({
        items: options,
        itemToString: (item: IFormMultiSelectOption) => item.label,
        itemToValue: (item: IFormMultiSelectOption) => item.value,
      }),
    [options],
  );

  function removeItem(value: string) {
    field.handleChange(selected.filter((v) => v !== value));
  }

  const selectedOptions = options.filter((o) => selected.includes(o.value));

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
        value={selected}
        multiple
        disabled={disabled}
        open={isOpen}
        onValueChange={(details) => {
          field.handleChange(details.value);
          if (field.state.meta.errorMap.onServer) {
            field.setMeta((meta) => ({
              ...meta,
              errorMap: { ...meta.errorMap, onServer: undefined },
            }));
          }
        }}
        onOpenChange={(details) => setIsOpen(details.open)}
        onInteractOutside={() => field.handleBlur()}
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
              disabled
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer focus:outline-none",
            )}
          >
            <span className="truncate text-left text-foreground-faint">
              {selected.length === 0
                ? placeholder
                : m.generic_selected_count({ count: String(selected.length) })}
            </span>
            <ChevronDown
              size={16}
              className="shrink-0 text-foreground-subtle"
            />
          </Select.Trigger>
        </Select.Control>

        <Portal>
          <Select.Positioner className="rounded-lg border border-border bg-surface shadow-lg empty:hidden">
            {/* Zag copies the content's z-index onto the positioner's inline
                style, so a z-index class on the positioner itself is ignored. */}
            <Select.Content className="z-popover flex max-h-64 flex-col focus:outline-none">
              <div className="overflow-y-auto overscroll-contain p-1">
                {collection.items.map((item) => {
                  const isChecked = selected.includes(item.value);

                  return (
                    <Select.Item
                      key={item.value}
                      item={item}
                      className={clsx(
                        "flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-1.5 text-sm",
                        "transition-colors hover:bg-surface-subtle",
                        "data-highlighted:bg-surface-subtle",
                        isChecked
                          ? "font-medium text-foreground"
                          : "text-foreground-muted",
                      )}
                    >
                      <Select.ItemIndicator
                        hidden={false}
                        className={clsx(
                          "flex size-4 shrink-0 items-center justify-center rounded border text-primary-foreground",
                          isChecked
                            ? "border-primary bg-primary"
                            : "border-border-strong bg-surface",
                        )}
                      >
                        {isChecked && <Check size={11} />}
                      </Select.ItemIndicator>
                      <Select.ItemText className="min-w-0 flex-1 truncate">
                        {renderOption ? renderOption(item) : item.label}
                      </Select.ItemText>
                    </Select.Item>
                  );
                })}
              </div>

              <div className="border-t border-border-muted p-1">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full cursor-pointer rounded-md px-3 py-1.5 text-right text-sm font-medium text-info-strong transition-colors hover:bg-surface-subtle"
                >
                  {m.generic_done()}
                </button>
              </div>
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>

      {selectedOptions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedOptions.map((opt) => (
            <span
              key={opt.value}
              className="inline-flex items-center gap-1 rounded-md bg-surface-subtle px-2 py-1 text-xs text-foreground"
            >
              {opt.label}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeItem(opt.value)}
                  className="cursor-pointer text-foreground-faint transition-colors hover:text-foreground"
                >
                  <X size={11} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {error && (
        <Field.ErrorText className="text-xs text-danger">
          {error}
        </Field.ErrorText>
      )}
    </Field.Root>
  );
}
