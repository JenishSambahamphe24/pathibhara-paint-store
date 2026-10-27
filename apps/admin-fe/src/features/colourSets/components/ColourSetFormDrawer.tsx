import type { IColourSet } from "../types";
import type { IShadeSummary } from "#/features/shades/types";
import type { ReactNode } from "react";

import { useState } from "react";

import { VISUALIZER_COMPONENTS } from "@repo/shared";

import { Button } from "#/components/Button/Button";
import { Drawer } from "#/components/Drawer/Drawer";
import { FormSection } from "#/components/FormSection/FormSection";
import { SkeletonCell } from "#/components/Table/SkeletonCell";
import { UnsavedChangesDialog } from "#/components/UnsavedChangesDialog/UnsavedChangesDialog";

import { ShadePicker } from "#/features/shades/components/ShadePicker";
import { FormHelper } from "#/lib/helpers/form.helper";
import { m } from "#/paraglide/messages";

import { useUnsavedChanges } from "#/hooks/useUnsavedChanges";

import { VisualizerComponentHelper } from "../helpers/visualizerComponent.helper";
import { useColourSetForm } from "../hooks/useColourSetForm";
import { useColourSet } from "../hooks/useColourSets";
import { ColourSetPreview } from "./ColourSetPreview";

interface ColourSetFormDrawerProps {
  /** null creates a new colour set. */
  colourSetId: string | null;
  onClose: () => void;
}

export function ColourSetFormDrawer({
  colourSetId,
  onClose,
}: ColourSetFormDrawerProps) {
  const { data: colourSet, isLoading } = useColourSet(colourSetId);

  if (colourSetId && (isLoading || !colourSet)) {
    return (
      <Drawer
        open
        onOpenChange={(next) => !next && onClose()}
        title={m.colour_sets_edit_title()}
        size="xl"
      >
        <SkeletonCell />
      </Drawer>
    );
  }
  return <ColourSetForm colourSet={colourSet ?? null} onClose={onClose} />;
}

interface ColourSetFormProps {
  colourSet: IColourSet | null;
  onClose: () => void;
}

function ColourSetForm({ colourSet, onClose }: ColourSetFormProps) {
  const { form, handleSubmit } = useColourSetForm({
    colourSet,
    onSaved: onClose,
  });
  // Shades seen so far, by id: the form holds only ids, the preview needs
  // each one's colour and name.
  const [known, setKnown] = useState<Record<string, IShadeSummary>>(() =>
    colourSet
      ? Object.fromEntries(
          Object.values(colourSet.shades).map((shade) => [shade.id, shade]),
        )
      : {},
  );

  return (
    <form.Subscribe
      selector={(state) => state.isDirty && !state.isSubmitSuccessful}
    >
      {(isDirty) => (
        <ColourSetDrawerFrame
          isDirty={isDirty}
          title={
            colourSet ? m.colour_sets_edit_title() : m.colour_sets_new_title()
          }
          onClose={onClose}
        >
          <form.AppForm>
            <form
              onSubmit={FormHelper.submitHandler(handleSubmit)}
              noValidate
              className="space-y-6"
            >
              <FormSection
                title={m.colour_sets_section_shades()}
                description={m.colour_sets_section_shades_hint()}
              >
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-4">
                    {VISUALIZER_COMPONENTS.map((component) => (
                      <form.Field key={component} name={`shades.${component}`}>
                        {(field) => (
                          <ShadePicker
                            label={VisualizerComponentHelper.label(component)}
                            value={field.state.value}
                            selected={known[field.state.value]}
                            error={FormHelper.getFieldError(
                              field.state.meta.errors,
                            )}
                            onChange={(shade) => {
                              if (shade) {
                                setKnown((prev) => ({
                                  ...prev,
                                  [shade.id]: shade,
                                }));
                              }
                              field.handleChange(shade?.id ?? "");
                              FormHelper.clearServerError(field);
                            }}
                          />
                        )}
                      </form.Field>
                    ))}
                  </div>
                  <form.Subscribe selector={(state) => state.values.shades}>
                    {(shades) => (
                      <ColourSetPreview
                        shades={Object.fromEntries(
                          VISUALIZER_COMPONENTS.flatMap((component) => {
                            const shade = known[shades[component]] as
                              | IShadeSummary
                              | undefined;
                            return shade ? [[component, shade]] : [];
                          }),
                        )}
                      />
                    )}
                  </form.Subscribe>
                </div>
              </FormSection>

              <FormSection title={m.colour_sets_section_details()}>
                <div className="grid gap-5 sm:grid-cols-2">
                  {(["en", "ne"] as const).map((locale) => (
                    <div
                      key={locale}
                      className="space-y-4 rounded-lg border border-border-muted bg-surface-muted p-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {locale === "en"
                            ? m.translations_english()
                            : m.translations_nepali()}
                        </p>
                        {locale === "ne" && (
                          <p className="text-xs text-foreground-subtle">
                            {m.translations_nepali_hint()}
                          </p>
                        )}
                      </div>
                      <form.AppField name={`translations.${locale}.name`}>
                        {(field) => (
                          <field.FormInput
                            label={m.translations_name()}
                            required={locale === "en"}
                          />
                        )}
                      </form.AppField>
                      <form.AppField
                        name={`translations.${locale}.description`}
                      >
                        {(field) => (
                          <field.FormTextarea
                            label={m.translations_description()}
                            rows={3}
                          />
                        )}
                      </form.AppField>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
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
                        hint={m.colour_sets_active_hint()}
                      />
                    )}
                  </form.AppField>
                </div>
              </FormSection>

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
        </ColourSetDrawerFrame>
      )}
    </form.Subscribe>
  );
}

interface ColourSetDrawerFrameProps {
  isDirty: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

function ColourSetDrawerFrame({
  isDirty,
  title,
  onClose,
  children,
}: ColourSetDrawerFrameProps) {
  const { isBlocked, proceed, reset, guardClose } = useUnsavedChanges({
    isDirty,
  });
  return (
    <>
      <Drawer
        open
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
