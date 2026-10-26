import type { IVariantSummary } from "#/features/products/types";

import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";

import { BreadCrumb } from "#/components/Breadcrumb/Breadcrumb";
import { Button } from "#/components/Button/Button";
import { FormSection } from "#/components/FormSection/FormSection";
import { PageHeader } from "#/components/PageHeader/PageHeader";

import { DateHelper } from "#/lib/helpers/date.helper";
import { FormHelper } from "#/lib/helpers/form.helper";
import { m } from "#/paraglide/messages";

import { BatchFormHelper } from "../helpers/batchForm.helper";
import { useBatchForm } from "../hooks/useBatchForm";
import { BatchLineRow } from "./BatchLineRow";

export function BatchFormPage() {
  const { form, handleSubmit } = useBatchForm();
  const [picked, setPicked] = useState<Map<string, IVariantSummary>>(new Map());

  return (
    <form.AppForm>
      <BreadCrumb
        items={[
          { title: m.sidebar_stock() },
          { title: m.sidebar_batches(), url: "/stock/batches" },
          { title: m.batches_new_title() },
        ]}
      />
      <form action={handleSubmit} noValidate className="space-y-5">
        <PageHeader
          title={m.batches_new_title()}
          description={m.batches_new_description()}
          actions={
            <>
              <Link
                to="/stock/batches"
                className="text-sm text-foreground-subtle hover:text-foreground"
              >
                {m.common_back_to_list()}
              </Link>
              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? m.common_saving() : m.batches_record()}
                  </Button>
                )}
              </form.Subscribe>
            </>
          }
        />

        <FormSection title={m.batches_section_details()}>
          <div className="grid gap-4 md:grid-cols-3">
            <form.AppField name="receivedOn">
              {(field) => (
                <field.FormInput
                  label={m.batches_received_on()}
                  type="date"
                  max={DateHelper.todayInStore()}
                  required
                />
              )}
            </form.AppField>
            <form.AppField name="supplierName">
              {(field) => <field.FormInput label={m.batches_supplier()} />}
            </form.AppField>
            <form.AppField name="notes">
              {(field) => <field.FormInput label={m.common_notes()} />}
            </form.AppField>
          </div>
        </FormSection>

        <FormSection
          title={m.batches_section_lines()}
          description={m.batches_section_lines_hint()}
        >
          <form.Field name="items" mode="array">
            {(itemsField) => (
              <>
                {itemsField.state.value.map((_line, index) => (
                  <BatchLineRow
                    key={index}
                    form={form}
                    index={index}
                    picked={picked}
                    canRemove={itemsField.state.value.length > 1}
                    onVariantPicked={(variant) =>
                      setPicked((prev) =>
                        new Map(prev).set(variant.id, variant),
                      )
                    }
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
                    itemsField.pushValue(BatchFormHelper.emptyLine())
                  }
                >
                  {m.common_add_line()}
                </Button>
              </>
            )}
          </form.Field>
        </FormSection>
      </form>
    </form.AppForm>
  );
}
