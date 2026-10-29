import type { IShade } from "../types";

import { useStore } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "#/components/Button/Button";
import { ConfirmDialog } from "#/components/ConfirmDialog/ConfirmDialog";
import { FormDrawer } from "#/components/FormDrawer/FormDrawer";
import { SkeletonCell } from "#/components/Table/SkeletonCell";

import { ProductPicker } from "#/features/products/components/ProductPicker";
import { ApiErrorHelper } from "#/lib/helpers/apiError.helper";
import { FormHelper } from "#/lib/helpers/form.helper";
import { toaster } from "#/lib/toaster";
import { m } from "#/paraglide/messages";

import { ShadeApi } from "../api";
import { useShadeForm } from "../hooks/useShadeForm";
import { SHADE_LIST_QUERY_KEY, useShade } from "../hooks/useShades";

interface ShadeFormDrawerProps {
  /** null creates a new shade. */
  shadeId: string | null;
  open: boolean;
  onClose: () => void;
  onExitComplete: () => void;
}

export function ShadeFormDrawer({
  shadeId,
  open,
  onClose,
  onExitComplete,
}: ShadeFormDrawerProps) {
  const { data: shade, isLoading } = useShade(shadeId);
  const [isDirty, setIsDirty] = useState(false);
  const isReady = shadeId === null || (!isLoading && shade !== undefined);

  return (
    <FormDrawer
      open={open}
      isDirty={isDirty}
      title={shadeId ? m.shades_edit_title() : m.shades_new_title()}
      onClose={onClose}
      onExitComplete={onExitComplete}
    >
      {isReady ? (
        <ShadeForm
          shade={shade ?? null}
          onClose={onClose}
          onDirtyChange={setIsDirty}
        />
      ) : (
        <SkeletonCell />
      )}
    </FormDrawer>
  );
}

interface ShadeFormProps {
  shade: IShade | null;
  onClose: () => void;
  onDirtyChange: (isDirty: boolean) => void;
}

function ShadeForm({ shade, onClose, onDirtyChange }: ShadeFormProps) {
  const { form, handleSubmit } = useShadeForm({ shade, onSaved: onClose });
  const isDirty = useStore(
    form.store,
    (state) => state.isDirty && !state.isSubmitSuccessful,
  );
  useEffect(() => onDirtyChange(isDirty), [isDirty, onDirtyChange]);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const removeMutation = useMutation({
    mutationFn: ShadeApi.remove,
    onSuccess: async () => {
      toaster.success({ description: m.shades_deleted() });
      // Close the confirmation before the drawer, so no dialog is still open
      // when the drawer's content unmounts.
      setIsDeleting(false);
      await queryClient.invalidateQueries({
        queryKey: [SHADE_LIST_QUERY_KEY],
      });
      onClose();
    },
    onError: (error) =>
      toaster.error({ description: ApiErrorHelper.describe(error) }),
  });

  return (
    <>
      <form.AppForm>
        <form
          onSubmit={FormHelper.submitHandler(handleSubmit)}
          noValidate
          className="space-y-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <form.AppField name="code">
              {(field) => (
                <field.FormInput
                  label={m.shades_code()}
                  hint={m.shades_code_hint()}
                  maxLength={32}
                  required
                />
              )}
            </form.AppField>
            <form.AppField name="hex">
              {(field) => (
                <field.FormColorPicker label={m.shades_colour()} required />
              )}
            </form.AppField>
          </div>

          <div className="grid gap-4 rounded-lg border border-border-muted bg-surface-muted p-4 sm:grid-cols-2">
            <form.AppField name="translations.en.name">
              {(field) => (
                <field.FormInput label={m.shades_name_en()} required />
              )}
            </form.AppField>
            <form.AppField name="translations.ne.name">
              {(field) => (
                <field.FormInput
                  label={m.shades_name_ne()}
                  hint={m.translations_nepali_hint()}
                />
              )}
            </form.AppField>
          </div>

          <form.Field name="productId">
            {(field) => (
              <div className="space-y-1">
                <ProductPicker
                  label={m.shades_product()}
                  value={field.state.value ?? ""}
                  selectedLabel={shade?.productName ?? undefined}
                  error={FormHelper.getFieldError(field.state.meta.errors)}
                  onChange={(product) => {
                    field.handleChange(product?.id ?? null);
                    FormHelper.clearServerError(field);
                  }}
                />
                <p className="text-xs text-foreground-subtle">
                  {m.shades_product_hint()}
                </p>
              </div>
            )}
          </form.Field>

          <form.AppField name="isActive">
            {(field) => (
              <field.FormSwitch
                label={m.common_active()}
                hint={m.shades_active_hint()}
              />
            )}
          </form.AppField>

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
                <div className="text-xs text-foreground-subtle">
                  {shade &&
                    (shade.colourSetCount > 0 ? (
                      <Link
                        to="/colour-sets"
                        search={{ shadeId: shade.id }}
                        className="text-info-strong hover:underline"
                      >
                        {m.shades_used_in_sets({
                          count: shade.colourSetCount,
                        })}
                      </Link>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDeleting(true)}
                      >
                        {m.common_delete()}
                      </Button>
                    ))}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    {m.generic_cancel()}
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? m.common_saving() : m.common_save()}
                  </Button>
                </div>
              </div>
            )}
          </form.Subscribe>
        </form>
      </form.AppForm>

      <ConfirmDialog
        open={isDeleting}
        onOpenChange={setIsDeleting}
        title={m.shades_delete_title()}
        description={m.shades_delete_description({
          name: shade ? `${shade.code} · ${shade.translations.en.name}` : "",
        })}
        confirmLabel={m.common_delete()}
        isLoading={removeMutation.isPending}
        onConfirm={() => shade && removeMutation.mutate(shade.id)}
      />
    </>
  );
}
