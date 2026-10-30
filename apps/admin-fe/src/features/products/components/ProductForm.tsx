import type { IProduct } from "../types";

import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { BreadCrumb } from "#/components/Breadcrumb/Breadcrumb";
import { Button } from "#/components/Button/Button";
import { ContentFields } from "#/components/ContentFields/ContentFields";
import { FormSection } from "#/components/FormSection/FormSection";
import { PageHeader } from "#/components/PageHeader/PageHeader";
import { UnsavedChangesDialog } from "#/components/UnsavedChangesDialog/UnsavedChangesDialog";

import { CategoryTreeHelper } from "#/features/categories/helpers/categoryTree.helper";
import { useCategories } from "#/features/categories/hooks/useCategories";
import { FormHelper } from "#/lib/helpers/form.helper";
import { m } from "#/paraglide/messages";

import { useUnsavedChanges } from "#/hooks/useUnsavedChanges";

import { ProductFormHelper } from "../helpers/productForm.helper";
import { useProductForm } from "../hooks/useProductForm";
import { ProductImagesField } from "./ProductImagesField";
import { ProductVariantRow } from "./ProductVariantRow";

interface ProductFormProps {
  product: IProduct | null;
}

export function ProductForm({ product }: ProductFormProps) {
  const { form, handleSubmit } = useProductForm(product);
  const { data: categories = [] } = useCategories();
  const savedVariants = new Map(product?.variants.map((v) => [v.id, v]) ?? []);
  const title = product ? product.name : m.products_new_title();

  return (
    <form.AppForm>
      <BreadCrumb
        items={[
          { title: m.sidebar_catalogue() },
          { title: m.sidebar_products(), url: "/products" },
          { title },
        ]}
      />
      <form
        onSubmit={FormHelper.submitHandler(handleSubmit)}
        noValidate
        className="space-y-5"
      >
        <form.Subscribe
          selector={(state) => [state.isSubmitting, state.isDirty] as const}
        >
          {([isSubmitting, isDirty]) => (
            <>
              <PageHeader
                title={title}
                description={
                  product
                    ? product.categoryPath.join(" › ")
                    : m.products_new_description()
                }
                actions={
                  <>
                    <Link
                      to="/products"
                      className="text-sm text-foreground-subtle hover:text-foreground"
                    >
                      {m.common_back_to_list()}
                    </Link>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? m.common_saving() : m.common_save()}
                    </Button>
                  </>
                }
              />
              <UnsavedGuard isDirty={isDirty && !isSubmitting} />
            </>
          )}
        </form.Subscribe>

        <FormSection title={m.products_section_details()}>
          <div className="grid gap-4 md:grid-cols-2">
            <form.AppField name="categoryId">
              {(field) => (
                <field.FormSelect
                  label={m.products_category()}
                  options={CategoryTreeHelper.options(categories)}
                  placeholder={m.products_category_placeholder()}
                  required
                />
              )}
            </form.AppField>
            <form.AppField name="isActive">
              {(field) => (
                <field.FormSwitch
                  label={m.common_active()}
                  hint={m.products_active_hint()}
                />
              )}
            </form.AppField>
            <form.AppField name="coverageSqftPerLitre">
              {(field) => (
                <field.FormInput
                  label={m.products_coverage()}
                  type="number"
                  min={0}
                  step={0.01}
                  required
                  hint={m.products_coverage_hint()}
                />
              )}
            </form.AppField>
            <form.AppField name="defaultCoats">
              {(field) => (
                <field.FormInput
                  label={m.products_default_coats()}
                  type="number"
                  min={1}
                  max={10}
                  step={1}
                  required
                />
              )}
            </form.AppField>
          </div>
        </FormSection>

        <FormSection
          title={m.products_section_content()}
          description={m.products_section_content_hint()}
        >
          <ContentFields
            form={form}
            fields={{
              name: "name",
              description: "description",
              seoTitle: "seoTitle",
              seoDescription: "seoDescription",
            }}
          />
        </FormSection>

        <FormSection
          title={m.products_section_sizes()}
          description={m.products_section_sizes_hint()}
        >
          <form.Field name="variants" mode="array">
            {(field) => (
              <>
                {field.state.value.map((variant, index) => {
                  const saved = variant.id
                    ? savedVariants.get(variant.id)
                    : undefined;
                  return (
                    <ProductVariantRow
                      key={variant.id ?? `new-${index}`}
                      form={form}
                      index={index}
                      saved={saved}
                      canRemove={
                        !saved?.hasHistory && field.state.value.length > 1
                      }
                      onRemove={() => field.removeValue(index)}
                    />
                  );
                })}
                {FormHelper.getFieldError(field.state.meta.errors) && (
                  <p className="text-xs text-danger">
                    {FormHelper.getFieldError(field.state.meta.errors)}
                  </p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  startIcon={<Plus size={14} />}
                  onClick={() =>
                    field.pushValue(ProductFormHelper.emptyVariant())
                  }
                >
                  {m.products_variant_add()}
                </Button>
              </>
            )}
          </form.Field>
        </FormSection>

        <FormSection title={m.products_section_images()}>
          <form.Field name="imageFileIds">
            {(field) => (
              <ProductImagesField
                value={field.state.value}
                onChange={field.handleChange}
                initialFiles={product?.images ?? []}
                error={FormHelper.getFieldError(field.state.meta.errors)}
              />
            )}
          </form.Field>
        </FormSection>

        <FormSection title={m.products_section_seo()}>
          <form.AppField name="slug">
            {(field) => (
              <field.FormInput
                label={m.common_slug()}
                placeholder={m.common_slug_placeholder()}
                hint={m.common_slug_hint()}
              />
            )}
          </form.AppField>
        </FormSection>
      </form>
    </form.AppForm>
  );
}

interface UnsavedGuardProps {
  isDirty: boolean;
}

function UnsavedGuard({ isDirty }: UnsavedGuardProps) {
  const { isBlocked, proceed, reset } = useUnsavedChanges({ isDirty });
  return (
    <UnsavedChangesDialog
      open={isBlocked}
      onDiscard={proceed}
      onCancel={reset}
    />
  );
}
