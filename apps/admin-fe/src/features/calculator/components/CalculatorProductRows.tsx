import type { TCalculatorFormValues } from "../types";
import type { IProductListItem } from "#/features/products/types";

import { Plus, Trash2 } from "lucide-react";

import { ActionButton } from "#/components/ActionButton/ActionButton";
import { Button } from "#/components/Button/Button";

import { ProductPicker } from "#/features/products/components/ProductPicker";
import { withForm } from "#/lib/form";
import { FormHelper } from "#/lib/helpers/form.helper";
import { m } from "#/paraglide/messages";

import { CalculatorFormHelper } from "../helpers/calculatorForm.helper";

const DEFAULTS: TCalculatorFormValues = { wastagePercent: null, sections: [] };

export const CalculatorProductRows = withForm({
  defaultValues: DEFAULTS,
  props: {
    sectionIndex: 0,
    productNames: new Map<string, string>(),
    onProductPicked: (_product: IProductListItem) => {},
  },
  render: function Render({
    form,
    sectionIndex,
    productNames,
    onProductPicked,
  }) {
    return (
      <form.Field name={`sections[${sectionIndex}].products`} mode="array">
        {(rows) => (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground-muted">
              {m.calculator_products()}
            </p>
            {rows.state.value.map((_row, index) => (
              <div
                key={index}
                className="grid grid-cols-2 items-start gap-2 sm:grid-cols-12"
              >
                <div className="col-span-2 sm:col-span-8">
                  <form.Field
                    name={`sections[${sectionIndex}].products[${index}].productId`}
                  >
                    {(field) => (
                      <ProductPicker
                        label={m.calculator_product()}
                        value={field.state.value}
                        selectedLabel={productNames.get(field.state.value)}
                        error={FormHelper.getFieldError(
                          field.state.meta.errors,
                        )}
                        onChange={(product) => {
                          field.handleChange(product?.id ?? "");
                          FormHelper.clearServerError(field);
                          if (!product) return;
                          onProductPicked(product);
                          // Each product brings its own recommended coats.
                          form.setFieldValue(
                            `sections[${sectionIndex}].products[${index}].coats`,
                            product.defaultCoats,
                          );
                        }}
                      />
                    )}
                  </form.Field>
                </div>
                <div className="sm:col-span-3">
                  <form.AppField
                    name={`sections[${sectionIndex}].products[${index}].coats`}
                  >
                    {(field) => (
                      <field.FormInput
                        label={m.calculator_coats()}
                        type="number"
                        min={1}
                        max={10}
                        step={1}
                        required
                      />
                    )}
                  </form.AppField>
                </div>
                <div className="flex justify-end sm:col-span-1 sm:pt-7">
                  <ActionButton
                    icon={<Trash2 size={16} />}
                    tooltip={m.common_remove_line()}
                    variant="danger"
                    disabled={rows.state.value.length === 1}
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
              onClick={() =>
                rows.pushValue(CalculatorFormHelper.emptyProduct())
              }
            >
              {m.calculator_add_product()}
            </Button>
          </div>
        )}
      </form.Field>
    );
  },
});
