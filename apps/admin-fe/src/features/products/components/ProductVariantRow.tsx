import type { IProductVariant } from "../types";

import clsx from "clsx";
import { Trash2 } from "lucide-react";

import { ActionButton } from "#/components/ActionButton/ActionButton";

import { withForm } from "#/lib/form";
import { m } from "#/paraglide/messages";

import { ProductFormHelper } from "../helpers/productForm.helper";

export const ProductVariantRow = withForm({
  defaultValues: ProductFormHelper.defaults(null, null),
  props: {
    index: 0,
    saved: undefined as IProductVariant | undefined,
    canRemove: true,
    onRemove: () => {},
  },
  render: function Render({ form, index, saved, canRemove, onRemove }) {
    const locked = saved?.hasHistory ?? false;
    return (
      <div
        className={clsx(
          "grid grid-cols-2 items-start gap-3 border-b border-border-muted py-3 last:border-b-0 md:grid-cols-12",
        )}
      >
        <div className="md:col-span-2">
          <form.AppField name={`variants[${index}].volumeMl`}>
            {(field) => (
              <field.FormVolumeInput
                label={m.products_variant_size()}
                required
                disabled={locked}
                hint={locked ? m.products_variant_size_locked() : undefined}
              />
            )}
          </form.AppField>
        </div>
        <div className="md:col-span-3">
          <form.AppField name={`variants[${index}].pricePaisa`}>
            {(field) => (
              <field.FormMoneyInput
                label={m.products_variant_price()}
                required
              />
            )}
          </form.AppField>
        </div>
        <div className="md:col-span-3">
          <form.AppField name={`variants[${index}].sku`}>
            {(field) => (
              <field.FormInput label={m.products_variant_sku()} required />
            )}
          </form.AppField>
        </div>
        <div className="md:col-span-2">
          <form.AppField name={`variants[${index}].reorderLevel`}>
            {(field) => (
              <field.FormInput
                label={m.products_variant_reorder()}
                type="number"
                min={0}
                step={1}
                hint={m.products_variant_reorder_hint()}
              />
            )}
          </form.AppField>
        </div>
        <div className="flex items-end justify-between gap-2 md:col-span-2 md:pt-7">
          <div className="space-y-1">
            <form.AppField name={`variants[${index}].isActive`}>
              {(field) => <field.FormSwitch label={m.common_active()} />}
            </form.AppField>
            {saved && (
              <p className="text-xs text-foreground-subtle">
                {m.products_variant_in_stock({ count: saved.currentStock })}
              </p>
            )}
          </div>
          <ActionButton
            icon={<Trash2 size={16} />}
            tooltip={
              canRemove
                ? m.products_variant_remove()
                : m.products_variant_remove_blocked()
            }
            variant="danger"
            onClick={onRemove}
            disabled={!canRemove}
          />
        </div>
      </div>
    );
  },
});
