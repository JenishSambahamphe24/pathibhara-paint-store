import type { IVariantSummary } from "#/features/products/types";

import { useState } from "react";

import { STOCK_ADJUSTMENT_REASONS } from "@repo/shared";

import { Button } from "#/components/Button/Button";
import { Drawer } from "#/components/Drawer/Drawer";

import { VariantPicker } from "#/features/products/components/VariantPicker";
import { VariantLabelHelper } from "#/features/products/helpers/variantLabel.helper";
import { FormHelper } from "#/lib/helpers/form.helper";
import { m } from "#/paraglide/messages";

import { AdjustmentReasonHelper } from "../helpers/adjustmentReason.helper";
import { useAdjustmentForm } from "../hooks/useAdjustmentForm";
import { AdjustmentQuantityField } from "./AdjustmentQuantityField";

interface AdjustmentFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onExitComplete: () => void;
}

export function AdjustmentFormDrawer({
  open,
  onClose,
  onExitComplete,
}: AdjustmentFormDrawerProps) {
  const { form, handleSubmit } = useAdjustmentForm(onClose);
  const [variant, setVariant] = useState<IVariantSummary | null>(null);

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => !next && onClose()}
      onExitComplete={onExitComplete}
      title={m.adjustments_new_title()}
      description={m.adjustments_new_description()}
    >
      <form.AppForm>
        <form
          onSubmit={FormHelper.submitHandler(handleSubmit)}
          noValidate
          className="space-y-5"
        >
          <form.Field name="variantId">
            {(field) => (
              <div className="space-y-1">
                <VariantPicker
                  label={m.common_product_size()}
                  value={field.state.value}
                  selectedLabel={
                    variant ? VariantLabelHelper.label(variant) : undefined
                  }
                  includeInactive
                  error={FormHelper.getFieldError(field.state.meta.errors)}
                  onChange={(next) => {
                    setVariant(next);
                    field.handleChange(next?.id ?? "");
                  }}
                />
                {variant && (
                  <p className="text-xs text-foreground-subtle">
                    {m.adjustments_current_stock({
                      count: variant.currentStock,
                    })}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="quantityDelta">
            {(field) => (
              <AdjustmentQuantityField
                value={field.state.value}
                errors={field.state.meta.errors}
                onChange={(value) => {
                  field.handleChange(value);
                  FormHelper.clearServerError(field);
                }}
              />
            )}
          </form.Field>

          <form.AppField name="reason">
            {(field) => (
              <field.FormSelect
                label={m.adjustments_reason()}
                required
                placeholder={m.adjustments_reason_placeholder()}
                options={STOCK_ADJUSTMENT_REASONS.map((reason) => ({
                  value: reason,
                  label: AdjustmentReasonHelper.text(reason),
                }))}
              />
            )}
          </form.AppField>

          <form.AppField name="note">
            {(field) => (
              <field.FormTextarea
                label={m.adjustments_note()}
                rows={3}
                hint={m.adjustments_note_hint()}
              />
            )}
          </form.AppField>

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  {m.generic_cancel()}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? m.common_saving() : m.adjustments_save()}
                </Button>
              </div>
            )}
          </form.Subscribe>
        </form>
      </form.AppForm>
    </Drawer>
  );
}
