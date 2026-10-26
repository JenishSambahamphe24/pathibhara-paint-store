import type { TBatchFormValues } from "../types";
import type { IVariantSummary } from "#/features/products/types";

import { Trash2 } from "lucide-react";

import { ActionButton } from "#/components/ActionButton/ActionButton";

import { VariantPicker } from "#/features/products/components/VariantPicker";
import { VariantLabelHelper } from "#/features/products/helpers/variantLabel.helper";
import { withForm } from "#/lib/form";
import { CurrencyHelper } from "#/lib/helpers/currency.helper";
import { FormHelper } from "#/lib/helpers/form.helper";
import { m } from "#/paraglide/messages";

const DEFAULTS: TBatchFormValues = {
  receivedOn: "",
  supplierName: "",
  notes: "",
  items: [],
};

// Reads its line through a subscription: the parent array field doesn't
// re-render when a field nested inside one of its items changes.
export const BatchLineRow = withForm({
  defaultValues: DEFAULTS,
  props: {
    index: 0,
    picked: new Map<string, IVariantSummary>(),
    canRemove: true,
    onVariantPicked: (_variant: IVariantSummary) => {},
    onRemove: () => {},
  },
  render: function Render({
    form,
    index,
    picked,
    canRemove,
    onVariantPicked,
    onRemove,
  }) {
    return (
      <form.Subscribe
        selector={(state) => state.values.items.at(index)?.variantId}
      >
        {(variantId) => {
          const variant = variantId ? picked.get(variantId) : undefined;
          return (
            <div className="grid grid-cols-2 items-start gap-3 border-b border-border-muted pb-3 md:grid-cols-12">
              <div className="col-span-2 md:col-span-6">
                <form.Field name={`items[${index}].variantId`}>
                  {(field) => (
                    <VariantPicker
                      label={m.common_product_size()}
                      value={field.state.value}
                      selectedLabel={
                        variant ? VariantLabelHelper.label(variant) : undefined
                      }
                      error={FormHelper.getFieldError(field.state.meta.errors)}
                      onChange={(next) => {
                        if (next) onVariantPicked(next);
                        field.handleChange(next?.id ?? "");
                        FormHelper.clearServerError(field);
                      }}
                    />
                  )}
                </form.Field>
                {variant && (
                  <p className="mt-1 text-xs text-foreground-subtle">
                    {m.batches_line_current({
                      stock: variant.currentStock,
                      price: CurrencyHelper.formatNpr(variant.pricePaisa),
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
              <div className="md:col-span-3">
                <form.AppField name={`items[${index}].unitCostPaisa`}>
                  {(field) => (
                    <field.FormMoneyInput
                      label={m.batches_unit_cost()}
                      hint={m.common_optional()}
                    />
                  )}
                </form.AppField>
              </div>
              <div className="flex justify-end md:col-span-1 md:pt-7">
                <ActionButton
                  icon={<Trash2 size={16} />}
                  tooltip={m.common_remove_line()}
                  variant="danger"
                  disabled={!canRemove}
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
