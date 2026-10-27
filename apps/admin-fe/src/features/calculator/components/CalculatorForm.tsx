import type { IProductListItem } from "#/features/products/types";

import { Calculator, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/Button/Button";

import { FormHelper } from "#/lib/helpers/form.helper";
import { m } from "#/paraglide/messages";

import { CalculatorFormHelper } from "../helpers/calculatorForm.helper";
import { useCalculatorForm } from "../hooks/useCalculatorForm";
import { CalculatorSectionCard } from "./CalculatorSectionCard";
import { EstimateResultPanel } from "./EstimateResultPanel";

interface CalculatorFormProps {
  defaultWastagePercent: number;
}

export function CalculatorForm({ defaultWastagePercent }: CalculatorFormProps) {
  const { form, handleSubmit, result } = useCalculatorForm(
    defaultWastagePercent,
  );
  const [productNames, setProductNames] = useState<Map<string, string>>(
    new Map(),
  );

  function rememberName(product: IProductListItem) {
    setProductNames((prev) => new Map(prev).set(product.id, product.name));
  }

  return (
    <form.AppForm>
      <form
        onSubmit={FormHelper.submitHandler(handleSubmit)}
        noValidate
        className="space-y-5"
      >
        <form.Field name="sections" mode="array">
          {(sections) => (
            <>
              {sections.state.value.map((_section, index) => (
                <CalculatorSectionCard
                  key={index}
                  form={form}
                  sectionIndex={index}
                  canRemove={sections.state.value.length > 1}
                  onRemove={() => sections.removeValue(index)}
                  productNames={productNames}
                  onProductPicked={rememberName}
                />
              ))}
              {FormHelper.getFieldError(sections.state.meta.errors) && (
                <p className="text-xs text-danger">
                  {FormHelper.getFieldError(sections.state.meta.errors)}
                </p>
              )}
              <Button
                variant="outline"
                startIcon={<Plus size={16} />}
                onClick={() =>
                  sections.pushValue(
                    CalculatorFormHelper.emptySection(
                      sections.state.value.length === 1
                        ? m.calculator_default_exterior()
                        : "",
                    ),
                  )
                }
              >
                {m.calculator_add_section()}
              </Button>
            </>
          )}
        </form.Field>

        <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-border bg-surface p-5">
          <div className="w-48">
            <form.AppField name="wastagePercent">
              {(field) => (
                <field.FormInput
                  label={m.calculator_wastage()}
                  type="number"
                  min={0}
                  max={50}
                  step={0.5}
                  hint={m.calculator_wastage_hint()}
                />
              )}
            </form.AppField>
          </div>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button
                type="submit"
                size="lg"
                startIcon={<Calculator size={18} />}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? m.calculator_calculating()
                  : m.calculator_calculate()}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>

      {result && (
        <div className="mt-8 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            {m.calculator_result_title()}
          </h2>
          <EstimateResultPanel result={result} />
        </div>
      )}
    </form.AppForm>
  );
}
