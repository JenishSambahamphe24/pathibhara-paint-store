import type { ICategory } from "../types";
import type { ReactNode } from "react";

import { Button } from "#/components/Button/Button";
import { Drawer } from "#/components/Drawer/Drawer";
import { TranslationFields } from "#/components/TranslationFields/TranslationFields";
import { UnsavedChangesDialog } from "#/components/UnsavedChangesDialog/UnsavedChangesDialog";

import { FormHelper } from "#/lib/helpers/form.helper";
import { m } from "#/paraglide/messages";

import { useUnsavedChanges } from "#/hooks/useUnsavedChanges";

import { CategoryTreeHelper } from "../helpers/categoryTree.helper";
import { useCategoryForm } from "../hooks/useCategoryForm";

interface CategoryFormDrawerProps {
  open: boolean;
  category: ICategory | null;
  defaultParentId: string | null;
  categories: Array<ICategory>;
  onClose: () => void;
}

export function CategoryFormDrawer({
  open,
  category,
  defaultParentId,
  categories,
  onClose,
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
        <CategoryDrawerFrame
          open={open}
          isDirty={isDirty}
          title={
            category ? m.categories_edit_title() : m.categories_new_title()
          }
          onClose={onClose}
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

              <TranslationFields form={form} fields="translations" showSeo />

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
        </CategoryDrawerFrame>
      )}
    </form.Subscribe>
  );
}

interface CategoryDrawerFrameProps {
  open: boolean;
  isDirty: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

function CategoryDrawerFrame({
  open,
  isDirty,
  title,
  onClose,
  children,
}: CategoryDrawerFrameProps) {
  const { isBlocked, proceed, reset, guardClose } = useUnsavedChanges({
    isDirty,
  });
  return (
    <>
      <Drawer
        open={open}
        onOpenChange={(next) => !next && guardClose(onClose)}
        title={title}
        size="xl"
      >
        {children}
      </Drawer>
      <UnsavedChangesDialog
        open={isBlocked}
        onDiscard={() => {
          proceed();
          onClose();
        }}
        onCancel={reset}
      />
    </>
  );
}
