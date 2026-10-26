import type { TCalculatorFormValues } from "../types";
import type { IProductListItem } from "#/features/products/types";

import { Trash2 } from "lucide-react";

import { ActionButton } from "#/components/ActionButton/ActionButton";

import { withForm } from "#/lib/form";
import { m } from "#/paraglide/messages";

import { CalculatorAreaRows } from "./CalculatorAreaRows";
import { CalculatorProductRows } from "./CalculatorProductRows";

const DEFAULTS: TCalculatorFormValues = { wastagePercent: null, sections: [] };

export const CalculatorSectionCard = withForm({
  defaultValues: DEFAULTS,
  props: {
    sectionIndex: 0,
    canRemove: true,
    onRemove: () => {},
    productNames: new Map<string, string>(),
    onProductPicked: (_product: IProductListItem) => {},
  },
  render: function Render({
    form,
    sectionIndex,
    canRemove,
    onRemove,
    productNames,
    onProductPicked,
  }) {
    return (
      <section className="space-y-5 rounded-xl border border-border bg-surface p-5">
        <div className="flex items-start gap-3">
          <div className="grow">
            <form.AppField name={`sections[${sectionIndex}].name`}>
              {(field) => (
                <field.FormInput
                  label={m.calculator_section_name()}
                  placeholder={m.calculator_section_placeholder()}
                  required
                />
              )}
            </form.AppField>
          </div>
          <div className="pt-7">
            <ActionButton
              icon={<Trash2 size={16} />}
              tooltip={m.calculator_remove_section()}
              variant="danger"
              disabled={!canRemove}
              onClick={onRemove}
            />
          </div>
        </div>
        <CalculatorAreaRows
          form={form}
          sectionIndex={sectionIndex}
          kind="surfaces"
        />
        <CalculatorAreaRows
          form={form}
          sectionIndex={sectionIndex}
          kind="deductions"
        />
        <CalculatorProductRows
          form={form}
          sectionIndex={sectionIndex}
          productNames={productNames}
          onProductPicked={onProductPicked}
        />
      </section>
    );
  },
});
