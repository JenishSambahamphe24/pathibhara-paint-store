import type { ISaleLineInfo, TDailySaleFormValues } from "../types";
import type { IVariantSummary } from "#/features/products/types";

import { Trash2 } from "lucide-react";

import { ActionButton } from "#/components/ActionButton/ActionButton";

import { VariantPicker } from "#/features/products/components/VariantPicker";
import { withForm } from "#/lib/form";
import { CurrencyHelper } from "#/lib/helpers/currency.helper";
import { FormHelper } from "#/lib/helpers/form.helper";
import { m } from "#/paraglide/messages";

const DEFAULTS: TDailySaleFormValues = { notes: "", items: [] };

// Reads its line through a subscription: the parent array field doesn't
// re-render when a field nested inside one of its items changes.
export const DailySaleLineRow = withForm({
  defaultValues: DEFAULTS,
  props: {
    index: 0,
    info: new Map<string, ISaleLineInfo>(),
    onVariantPicked: (_variant: IVariantSummary) => {},
    onRemove: () => {},
  },
  render: function Render({ form, index, info, onVariantPicked, onRemove }) {
    return (
      <form.Subscribe selector={(state) => state.values.items.at(index)}>
        {(line) => {
          const known = line ? info.get(line.variantId) : undefined;
          const lineTotal =
            known && line?.quantity
              ? known.unitPricePaisa * line.quantity
              : null;
          return (
            <div className="grid grid-cols-2 items-start gap-3 border-b border-border-muted pb-3 md:grid-cols-12">
              <div className="col-span-2 md:col-span-6">
                <form.Field name={`items[${index}].variantId`}>
                  {(field) => (
                    <VariantPicker
                      label={m.common_product_size()}
                      value={field.state.value}
                      selectedLabel={known?.label}
                      error={FormHelper.getFieldError(field.state.meta.errors)}
                      onChange={(variant) => {
                        if (variant) onVariantPicked(variant);
                        field.handleChange(variant?.id ?? "");
                        FormHelper.clearServerError(field);
                      }}
                    />
                  )}
                </form.Field>
                {known && (
                  <p className="mt-1 text-xs text-foreground-subtle">
                    {m.sales_line_available({
                      count: known.available,
                      price: CurrencyHelper.formatNpr(known.unitPricePaisa),
                    })}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <form.AppField name={`items[${index}].quantity`}>
                  {(field) => (
                    <field.FormInput
                      label={m.common_quantity()}
                      type="number"
                      min={1}
                      step={1}
                      required
                    />
                  )}
                </form.AppField>
              </div>
              <div className="md:col-span-3 md:pt-7">
                <p className="text-xs text-foreground-subtle">
                  {m.sales_line_total()}
                </p>
                <p className="text-sm font-medium text-foreground">
                  {CurrencyHelper.formatNpr(lineTotal)}
                </p>
              </div>
              <div className="flex justify-end md:col-span-1 md:pt-7">
                <ActionButton
                  icon={<Trash2 size={16} />}
                  tooltip={m.common_remove_line()}
                  variant="danger"
                  onClick={onRemove}
                />
              </div>
            </div>
          );
        }}
      </form.Subscribe>
    );
  },
});
