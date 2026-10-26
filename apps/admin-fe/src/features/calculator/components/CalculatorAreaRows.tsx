import type { TAreaKind, TCalculatorFormValues } from "../types";

import { Plus, Trash2 } from "lucide-react";

import { ActionButton } from "#/components/ActionButton/ActionButton";
import { Button } from "#/components/Button/Button";

import { withForm } from "#/lib/form";
import { FormHelper } from "#/lib/helpers/form.helper";
import { m } from "#/paraglide/messages";

import { CalculatorFormHelper } from "../helpers/calculatorForm.helper";

const DEFAULTS: TCalculatorFormValues = { wastagePercent: null, sections: [] };

export const CalculatorAreaRows = withForm({
  defaultValues: DEFAULTS,
  props: { sectionIndex: 0, kind: "surfaces" as TAreaKind },
  render: function Render({ form, sectionIndex, kind }) {
    const isDeduction = kind === "deductions";
    return (
      <form.Field name={`sections[${sectionIndex}].${kind}`} mode="array">
        {(rows) => (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground-muted">
              {isDeduction
                ? m.calculator_deductions()
                : m.calculator_surfaces()}
            </p>
            {rows.state.value.length === 0 && isDeduction && (
              <p className="text-xs text-foreground-subtle">
                {m.calculator_no_deductions()}
              </p>
            )}
            {rows.state.value.map((_row, index) => (
              <div
                key={index}
                className="grid grid-cols-2 items-start gap-2 sm:grid-cols-12"
              >
                <div className="col-span-2 sm:col-span-4">
                  <form.AppField
                    name={`sections[${sectionIndex}].${kind}[${index}].label`}
                  >
                    {(field) => (
                      <field.FormInput
                        label={m.calculator_label()}
                        placeholder={
                          isDeduction
                            ? m.calculator_label_door()
                            : m.calculator_label_wall()
                        }
                      />
                    )}
                  </form.AppField>
                </div>
                <div className="sm:col-span-2">
                  <form.AppField
                    name={`sections[${sectionIndex}].${kind}[${index}].widthFt`}
                  >
                    {(field) => (
                      <field.FormInput
                        label={m.calculator_width()}
                        type="number"
                        min={0}
                        step={0.1}
                        required
                      />
                    )}
                  </form.AppField>
                </div>
                <div className="sm:col-span-2">
                  <form.AppField
                    name={`sections[${sectionIndex}].${kind}[${index}].heightFt`}
                  >
                    {(field) => (
                      <field.FormInput
                        label={m.calculator_height()}
                        type="number"
                        min={0}
                        step={0.1}
                        required
                      />
                    )}
                  </form.AppField>
                </div>
                <div className="sm:col-span-2">
                  <form.AppField
                    name={`sections[${sectionIndex}].${kind}[${index}].quantity`}
                  >
                    {(field) => (
                      <field.FormInput
                        label={m.calculator_quantity()}
                        type="number"
                        min={1}
                        step={1}
                        required
                      />
                    )}
                  </form.AppField>
                </div>
                <div className="flex items-center justify-between gap-2 sm:col-span-2 sm:pt-7">
                  <form.Subscribe
                    selector={(state) =>
                      state.values.sections.at(sectionIndex)?.[kind].at(index)
                    }
                  >
                    {(item) => {
                      const area = CalculatorFormHelper.area(item);
                      return (
                        <span className="text-sm text-foreground-subtle">
                          {area === null
                            ? "—"
                            : m.calculator_sqft({ value: area.toFixed(1) })}
                        </span>
                      );
                    }}
                  </form.Subscribe>
                  <ActionButton
                    icon={<Trash2 size={16} />}
                    tooltip={m.common_remove_line()}
                    variant="danger"
                    disabled={!isDeduction && rows.state.value.length === 1}
                    onClick={() => rows.removeValue(index)}
                  />
                </div>
              </div>
            ))}
            {FormHelper.getFieldError(rows.state.meta.errors) && (
              <p className="text-xs text-danger">
                {FormHelper.getFieldError(rows.state.meta.errors)}
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              startIcon={<Plus size={14} />}
              onClick={() => rows.pushValue(CalculatorFormHelper.emptyArea())}
            >
              {isDeduction
                ? m.calculator_add_deduction()
                : m.calculator_add_surface()}
            </Button>
          </div>
        )}
      </form.Field>
    );
  },
});
