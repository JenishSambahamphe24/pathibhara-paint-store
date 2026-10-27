import type { IDailySaleDetail, ISaleLineInfo } from "../types";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/Button/Button";
import { FormSection } from "#/components/FormSection/FormSection";

import { CurrencyHelper } from "#/lib/helpers/currency.helper";
import { DateHelper } from "#/lib/helpers/date.helper";
import { FormHelper } from "#/lib/helpers/form.helper";
import { m } from "#/paraglide/messages";

import { SaleLinesHelper } from "../helpers/saleLines.helper";
import { useDailySaleForm } from "../hooks/useDailySaleForm";
import { DailySaleLineRow } from "./DailySaleLineRow";

interface DailySaleFormProps {
  date: string;
  sale: IDailySaleDetail | null;
}

export function DailySaleForm({ date, sale }: DailySaleFormProps) {
  const { form, handleSubmit } = useDailySaleForm(date, sale);
  const [info, setInfo] = useState<Map<string, ISaleLineInfo>>(() =>
    SaleLinesHelper.infoFromSaved(sale),
  );

  return (
    <form.AppForm>
      <form
        onSubmit={FormHelper.submitHandler(handleSubmit)}
        noValidate
        className="space-y-5"
      >
        {sale && (
          <p className="text-sm text-foreground-subtle">
            {m.sales_last_saved({
              by: sale.updatedByName,
              at: DateHelper.formatDateTime(sale.updatedAt),
            })}
          </p>
        )}

        <FormSection
          title={m.sales_section_lines()}
          description={m.sales_section_lines_hint()}
        >
          <form.Field name="items" mode="array">
            {(itemsField) => (
              <>
                {itemsField.state.value.map((_line, index) => (
                  <DailySaleLineRow
                    key={index}
                    form={form}
                    index={index}
                    info={info}
                    onVariantPicked={(variant) => {
                      if (!info.has(variant.id)) {
                        setInfo((prev) =>
                          new Map(prev).set(
                            variant.id,
                            SaleLinesHelper.infoFromVariant(variant),
                          ),
                        );
                      }
                    }}
                    onRemove={() => itemsField.removeValue(index)}
                  />
                ))}
                {FormHelper.getFieldError(itemsField.state.meta.errors) && (
                  <p className="text-xs text-danger">
                    {FormHelper.getFieldError(itemsField.state.meta.errors)}
                  </p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  startIcon={<Plus size={14} />}
                  onClick={() =>
                    itemsField.pushValue(SaleLinesHelper.emptyLine())
                  }
                >
                  {m.common_add_line()}
                </Button>
              </>
            )}
          </form.Field>
        </FormSection>

        <FormSection title={m.common_notes()}>
          <form.AppField name="notes">
            {(field) => (
              <field.FormTextarea label={m.common_notes()} rows={2} />
            )}
          </form.AppField>
        </FormSection>

        <form.Subscribe
          selector={(state) =>
            [state.values.items, state.isSubmitting] as const
          }
        >
          {([items, isSubmitting]) => {
            const totals = SaleLinesHelper.totals(items, info);
            return (
              <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
                <p className="text-sm text-foreground-muted">
                  {m.sales_totals({
                    units: totals.units,
                    revenue: CurrencyHelper.formatNpr(totals.revenuePaisa),
                  })}
                </p>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? m.common_saving()
                    : sale
                      ? m.sales_save_changes()
                      : m.sales_save()}
                </Button>
              </div>
            );
          }}
        </form.Subscribe>
      </form>
    </form.AppForm>
  );
}
