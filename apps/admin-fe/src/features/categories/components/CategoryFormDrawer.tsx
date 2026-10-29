import type { ICategory } from "../types";

import { Button } from "#/components/Button/Button";
import { ContentFields } from "#/components/ContentFields/ContentFields";
import { FormDrawer } from "#/components/FormDrawer/FormDrawer";

import { FormHelper } from "#/lib/helpers/form.helper";
import { m } from "#/paraglide/messages";

import { CategoryTreeHelper } from "../helpers/categoryTree.helper";
import { useCategoryForm } from "../hooks/useCategoryForm";

interface CategoryFormDrawerProps {
  open: boolean;
  category: ICategory | null;
  defaultParentId: string | null;
  categories: Array<ICategory>;
  onClose: () => void;
  onExitComplete: () => void;
}

export function CategoryFormDrawer({
  open,
  category,
  defaultParentId,
  categories,
  onClose,
  onExitComplete,
}: CategoryFormDrawerProps) {
  const { form, handleSubmit } = useCategoryForm({
    category,
    defaultParentId,
    onSaved: onClose,
  });
  const parentOptions = CategoryTreeHelper.options(categories, category?.id);

  return (
    <form.Subscribe
      selector={(state) => state.isDirty && !state.isSubmitSuccessful}
    >
      {(isDirty) => (
        <FormDrawer
          open={open}
          isDirty={isDirty}
          title={
            category ? m.categories_edit_title() : m.categories_new_title()
          }
          size="xl"
          onClose={onClose}
          onExitComplete={onExitComplete}
        >
          <form.AppForm>
            <form
              onSubmit={FormHelper.submitHandler(handleSubmit)}
              noValidate
              className="space-y-5"
            >
              <form.AppField name="parentId">
                {(field) => (
                  <field.FormSelect
                    label={m.categories_parent()}
                    options={parentOptions}
                    nullOption={m.categories_top_level()}
                    hint={m.categories_parent_hint()}
                  />
                )}
              </form.AppField>

              <ContentFields
                form={form}
                fields={{
                  name: "name",
                  description: "description",
                  seoTitle: "seoTitle",
                  seoDescription: "seoDescription",
                }}
              />

              <form.AppField name="slug">
                {(field) => (
                  <field.FormInput
                    label={m.common_slug()}
                    placeholder={m.common_slug_placeholder()}
                    hint={m.common_slug_hint()}
                  />
                )}
              </form.AppField>

              <form.AppField name="isActive">
                {(field) => (
                  <field.FormSwitch
                    label={m.common_active()}
                    hint={m.categories_active_hint()}
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
                      {isSubmitting ? m.common_saving() : m.common_save()}
                    </Button>
                  </div>
                )}
              </form.Subscribe>
            </form>
          </form.AppForm>
        </FormDrawer>
      )}
    </form.Subscribe>
  );
}
